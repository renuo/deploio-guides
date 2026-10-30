---
prev:
  text: Configuring Your Database
  link: /user-guide/configuring-your-database
next:
  text: Other dependencies
  link: /user-guide/other-dependencies
description: Retrieve, verify, extract, and load a PostgreSQL Economy backup using nctl and standard command-line tools.
---

# PostgreSQL Economy backups

This guide shows how to retrieve the latest managed backup, optionally extract it, and load it into another database. Downloading a backup does not change the source database.

::: warning PostgreSQL only
MySQL Economy backups are currently unavailable. See the [Nine technical reference](https://docs.nine.ch/docs/on-demand-services/mysql/economy/#backups) for details.
:::

## Before you begin

Install [`nctl`](https://docs.nine.ch/docs/nctl/), [`jq`](https://jqlang.github.io/jq/), [`rclone`](https://rclone.org/), and [`zstd`](https://facebook.github.io/zstd/).

Authenticate with `nctl` if necessary:

```bash
nctl auth login
```

## Retrieve the latest backup

Replace the two bracketed placeholders, then run the complete block in Bash or zsh. The script shows the selected database and asks for confirmation before retrieving credentials or backup data.

```bash
#!/usr/bin/env bash

main() (
  set -euo pipefail

  if (( $# > 2 )); then
    echo "Usage: $0 [PROJECT [DATABASE]]" >&2
    exit 2
  fi

  PROJECT="${1:-}"
  DATABASE="${2:-}"

  if [[ -z "$PROJECT" ]]; then
    printf "Project: " >&2
    IFS= read -r PROJECT
  fi

  if [[ -z "$DATABASE" ]]; then
    printf "Database: " >&2
    IFS= read -r DATABASE
  fi

  if [[ -z "$PROJECT" || -z "$DATABASE" ]]; then
    echo "Project and database must not be empty." >&2
    exit 1
  fi

  DESTINATION="./${PROJECT}-${DATABASE}-latest.sql.zst"
  EXTRACTED_DESTINATION="${DESTINATION%.zst}"

  NCTL="${HOME}/vendor/nctl"
  RCLONE="/opt/local/bin/rclone"

  if [[ ! -x "$NCTL" ]]; then
    echo "nctl is not executable: $NCTL" >&2
    exit 1
  fi

  if [[ ! -x "$RCLONE" ]]; then
    echo "rclone is not executable: $RCLONE" >&2
    exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "Required command not found: jq" >&2
    exit 1
  fi

  if ! command -v zstd >/dev/null 2>&1; then
    echo "Required command not found: zstd" >&2
    exit 1
  fi

  # Capture stdout only. If nctl fails, print its human-readable stdout as an
  # error instead of passing it to jq and hiding the real failure behind a JSON
  # parse error.
  capture_nctl() {
    local output

    if ! output="$("$NCTL" "$@")"; then
      if [[ -n "$output" ]]; then
        printf '%s\n' "$output" >&2
      fi
      return 1
    fi

    printf '%s\n' "$output"
  }

  echo "Project:     $PROJECT"
  echo "Database:    $DATABASE"
  echo "Destination: $DESTINATION"
  echo "Extracted:   $EXTRACTED_DESTINATION"

  if [[ -e "$DESTINATION" ]]; then
    echo "Destination already exists; refusing to overwrite it: $DESTINATION" >&2
    exit 1
  fi

  if [[ -e "$EXTRACTED_DESTINATION" ]]; then
    echo "Extracted destination already exists; refusing to overwrite it: $EXTRACTED_DESTINATION" >&2
    exit 1
  fi

  printf "Download this database backup? [y/N] " >&2
  IFS= read -r CONFIRM
  if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Download cancelled."
    exit 0
  fi

  PROJECTS_JSON="$(capture_nctl get projects --output json)"
  PROJECT_ID="$(
    jq -er --arg project "$PROJECT" '
      [
        .[]
        | select(
            .metadata.name == $project
            or .spec.displayName == $project
          )
      ]
      | if length == 1
          then .[0].metadata.name
          else error("expected exactly one matching project")
        end
    ' <<<"$PROJECTS_JSON"
  )"

  DATABASE_JSON="$(
    capture_nctl get postgresdatabase "$DATABASE" \
      --project "$PROJECT_ID" \
      --output json
  )"
  DATABASE_INSTANCE="$(jq -er '.status.atProvider.name' <<<"$DATABASE_JSON")"

  BUCKETS_JSON="$(
    capture_nctl get bucket \
      --project "$PROJECT_ID" \
      --output json
  )"
  BUCKET="$(
    jq -ce --arg prefix "postgresdatabase-${DATABASE}-" '
      [
        .[]
        | select(
            .metadata.labels["nine.ch/controllerKind"]
            == "DatabaseBackupSchedule"
          )
        | select(.metadata.name | startswith($prefix))
      ]
      | if length == 1
          then .[0]
          else error("expected exactly one backup bucket")
        end
    ' <<<"$BUCKETS_JSON"
  )"

  BUCKET_NAME="$(jq -er '.metadata.name' <<<"$BUCKET")"
  BUCKET_ENDPOINT="$(jq -er '.status.atProvider.endpoint' <<<"$BUCKET")"

  # These variables exist only inside the main subshell and do not modify an
  # rclone configuration file or the calling shell's environment.
  export RCLONE_CONFIG_DEPLOIO_TYPE="s3"
  export RCLONE_CONFIG_DEPLOIO_PROVIDER="Other"
  export RCLONE_CONFIG_DEPLOIO_ENDPOINT="https://${BUCKET_ENDPOINT}"
  export RCLONE_CONFIG_DEPLOIO_ACCESS_KEY_ID="$(
    capture_nctl get bucketuser "$BUCKET_NAME" \
      --project "$PROJECT_ID" \
      --print-access-key
  )"
  export RCLONE_CONFIG_DEPLOIO_SECRET_ACCESS_KEY="$(
    capture_nctl get bucketuser "$BUCKET_NAME" \
      --project "$PROJECT_ID" \
      --print-secret-key
  )"

  BACKUPS_JSON="$(
    "$RCLONE" lsjson "deploio:${BUCKET_NAME}" \
      --recursive \
      --files-only \
      --s3-no-check-bucket \
      --log-level ERROR
  )"
  BACKUP_PATH="$(
    jq -er --arg instance "$DATABASE_INSTANCE" '
      [
        .[]
        | select(
            (.IsDir == false)
            and (.Path | endswith(".sql.zst"))
          )
      ] as $all
      | [$all[] | select(.Path | contains($instance))] as $matching
      | (if ($matching | length) > 0 then $matching else $all end)
      | if length == 0
          then error("no .sql.zst backup found")
          else max_by(.ModTime).Path
      [118;1:3u  end
    ' <<<"$BACKUPS_JSON"
  )"

  echo "Project API: $PROJECT_ID"
  echo "Backup:      $BACKUP_PATH"

  "$RCLONE" copyto \
    "deploio:${BUCKET_NAME}/${BACKUP_PATH}" \
    "$DESTINATION" \
    --progress \
    --s3-no-check-bucket \
    --log-level ERROR

  if [[ ! -s "$DESTINATION" ]]; then
    echo "Downloaded backup is empty: $DESTINATION" >&2
    exit 1
  fi

  zstd --test "$DESTINATION"
  zstd --decompress --keep "$DESTINATION" -o "$EXTRACTED_DESTINATION"

  echo "Downloaded:  $DESTINATION"
  echo "Extracted:   $EXTRACTED_DESTINATION"
)

main "$@"
```

::: warning Sensitive data
The resulting `.zst` or `.sql` file may contain production data. Store it securely and delete it when it is no longer needed. The subshell removes the temporary S3 credentials when it exits.
:::

## Load the backup into another database

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

::: warning Check the target
Loading a backup writes to `TARGET_DATABASE_URL`. Check it carefully and prefer a newly created, empty target database.
:::

For additional restore information, see the [Nine PostgreSQL Economy reference](https://docs.nine.ch/docs/on-demand-services/postgresql/economy/#backups).
