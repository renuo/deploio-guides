---
prev:
  text: Configuring Your Database
  link: /user-guide/configuring-your-database
next:
  text: Other dependencies
  link: /user-guide/other-dependencies
description: Download, verify, extract, and load a PostgreSQL Economy backup using nctl and standard command-line tools.
---

# Download a PostgreSQL Economy backup

PostgreSQL Economy backups are created daily and stored in S3-compatible object storage. Downloading a backup does not restore it.

> **PostgreSQL only:** The [MySQL Economy reference](https://docs.nine.ch/docs/on-demand-services/mysql/economy/#backups) currently states that backups are unavailable.

## Requirements

Install [`nctl`](https://docs.nine.ch/docs/nctl/), [`jq`](https://jqlang.github.io/jq/), [`rclone`](https://rclone.org/), and [`zstd`](https://facebook.github.io/zstd/).

Sign in if necessary:

```bash
nctl auth login
```

## Download the latest backup

Replace the two bracketed placeholders, then run the complete block in Bash. The script shows the selected database and asks for confirmation before retrieving credentials or backup data.

```bash
(
  set -euo pipefail

  PROJECT="[MY_PROJECT]"
  DATABASE="[MY_DATABASE]"
  DESTINATION="./${PROJECT}-${DATABASE}-latest.sql.zst"

  if [[ "$PROJECT" == "[MY_PROJECT]" || "$DATABASE" == "[MY_DATABASE]" ]]; then
    echo "Replace [MY_PROJECT] and [MY_DATABASE] before running this script." >&2
    exit 1
  fi

  echo "Project:     $PROJECT"
  echo "Database:    $DATABASE"
  echo "Destination: $DESTINATION"
  read -r -p "Download this database backup? [y/N] " CONFIRM
  if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Download cancelled."
    exit 0
  fi

  DATABASE_INSTANCE="$(
    nctl get postgresdatabase "$DATABASE" \
      --project "$PROJECT" \
      --output json |
      jq -er '.status.atProvider.name'
  )"

  BUCKET="$(
    nctl get bucket --project "$PROJECT" --output json |
      jq -ce --arg prefix "postgresdatabase-${DATABASE}-" '
        [.[ ]
          | select(.metadata.labels["nine.ch/controllerKind"] == "DatabaseBackupSchedule")
          | select(.metadata.name | startswith($prefix))]
        | if length == 1
          then .[0]
          else error("expected exactly one backup bucket")
          end
      '
  )"

  BUCKET_NAME="$(jq -er '.metadata.name' <<< "$BUCKET")"
  BUCKET_ENDPOINT="$(jq -er '.status.atProvider.endpoint' <<< "$BUCKET")"

  export RCLONE_CONFIG_DEPLOIO_TYPE="s3"
  export RCLONE_CONFIG_DEPLOIO_PROVIDER="Other"
  export RCLONE_CONFIG_DEPLOIO_ENDPOINT="https://${BUCKET_ENDPOINT}"
  export RCLONE_CONFIG_DEPLOIO_ACCESS_KEY_ID="$(
    nctl get bucketuser "$BUCKET_NAME" \
      --project "$PROJECT" \
      --print-access-key
  )"
  export RCLONE_CONFIG_DEPLOIO_SECRET_ACCESS_KEY="$(
    nctl get bucketuser "$BUCKET_NAME" \
      --project "$PROJECT" \
      --print-secret-key
  )"

  BACKUP_OBJECT="$(
    rclone lsjson "DEPLOIO:${BUCKET_NAME}" --s3-no-check-bucket |
      jq -er --arg prefix "PostgresDatabase-${DATABASE_INSTANCE}-" '
        [.[] | select(.Name | startswith($prefix))]
        | sort_by(.ModTime)
        | last
        | .Name
      '
  )"

  rclone copyto \
    "DEPLOIO:${BUCKET_NAME}/${BACKUP_OBJECT}" \
    "$DESTINATION" \
    --progress \
    --stats-one-line \
    --s3-no-check-bucket

  zstd --test "$DESTINATION"

  SQL_DESTINATION="${DESTINATION%.zst}"
  read -r -p "Extract the backup to ${SQL_DESTINATION}? [y/N] " EXTRACT
  if [[ "$EXTRACT" == "y" || "$EXTRACT" == "Y" ]]; then
    if [[ -e "$SQL_DESTINATION" ]]; then
      echo "Refusing to overwrite ${SQL_DESTINATION}." >&2
      exit 1
    fi

    zstd --decompress --keep \
      --output "$SQL_DESTINATION" \
      "$DESTINATION"
    echo "Extracted SQL: $SQL_DESTINATION"
  fi
)
```

The download does not change the database, but the resulting `.zst` or `.sql` file may contain sensitive production data. The subshell removes the temporary S3 credentials when it exits.

## Load the backup with psql

The `.zst` file is compressed. If you accepted the extraction prompt above, load the resulting `.sql` file:

```bash
BACKUP_FILE="./[MY_PROJECT]-[MY_DATABASE]-latest.sql"
TARGET_DATABASE_URL="[TARGET_DATABASE_URL]"
psql "$TARGET_DATABASE_URL" --set ON_ERROR_STOP=on < "$BACKUP_FILE"
```

Or stream the compressed file directly into `psql` without extracting it:

```bash
BACKUP_FILE="./[MY_PROJECT]-[MY_DATABASE]-latest.sql.zst"
TARGET_DATABASE_URL="[TARGET_DATABASE_URL]"
zstd --decompress --stdout "$BACKUP_FILE" |
  psql "$TARGET_DATABASE_URL" --set ON_ERROR_STOP=on
```

Check `TARGET_DATABASE_URL` carefully: loading a backup writes to that database. Prefer a newly created, empty target database.

For additional restore information, see the [Nine PostgreSQL Economy reference](https://docs.nine.ch/docs/on-demand-services/postgresql/economy/#backups).
