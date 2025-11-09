---
prev:
  text: Security
  link: /user-guide/security
next:
  text: Our Stack
  link: /user-guide/our-stack
---

# Migrating from Other Platforms

With Deploio, it is extremely easy to migrate an application, and all resources, from other providers. In this section we will provide information on how to migrate environment variables, databases, as well as how to adapt the DNS records and CI workflows.

Most examples will focus on migrating from Heroku, however this can be adapted should you be migrating from another provider.

## Retrieving and restoring databases

When migrating your application to Deploio, you'll need to migrate your database as well, if you have one. The process generally involves three main steps:

1. Create a new database instance on Deploio
2. Export your data from the source platform
3. Import the data into your Deploio database

### 1. Create a Database on Deploio

First, you'll need to create a new database instance on Deploio. You can do this using the `nctl` command line tool (or in the Cockpit).

For more details on database configuration options when creating a database, see the [Configuring your Database page](/user-guide/configuring-your-database)

### 2. Export Data from Source Platform

The method for exporting your database will depend on your source platform. Here are some common approaches:

#### PostgreSQL Databases

For PostgreSQL databases, you can use `pg_dump` to create a backup:

```bash
pg_dump -h {SOURCE_HOST} -U {USERNAME} -d {DATABASE_NAME} > backup.dump
```

#### MySQL Databases

For MySQL databases, you can use `mysqldump`:

```bash
mysqldump -h {SOURCE_HOST} -u {USERNAME} -p {DATABASE_NAME} > backup.sql
```

#### Platform-Specific Examples

Some platforms provide their own tools for database exports:

**Heroku Example:**
```bash
# Capture a backup
heroku pg:backups:capture -a {APP_NAME}

# Download the backup
heroku pg:backups:download -a {APP_NAME}
```

**AWS RDS Example:**
```bash
# Using AWS CLI to create a snapshot
aws rds create-db-snapshot \
    --db-instance-identifier {INSTANCE_ID} \
    --db-snapshot-identifier {SNAPSHOT_NAME}
```

### 3. Import Data to Deploio

Once you have your database backup file (e.g. `backup.dump` or `backup.sql`), you can import it into your Deploio database:

#### PostgreSQL

```bash
pg_restore \
  -U dbadmin \
  -h {DEPLOIO_FQDN} \
  -d {DATABASE_NAME} \
  -c -v backup.dump \
  --no-owner --no-acl
```

::: info
The `--no-owner` and `--no-acl` flags are important when restoring to Deploio:
- `--no-owner`: Ensures all objects are owned by the user performing the restore (dbadmin) rather than the original owner
- `--no-acl`: Prevents the restoration of access control lists (ACLs) from the source database, which might cause issues with access to the database.
:::

#### MySQL

```bash
mysql -h {DEPLOIO_FQDN} -u dbadmin -p {DATABASE_NAME} < backup.sql
```

### 4. Update Application Configuration

After the migration is complete, update your application's database connection string:

```bash
nctl update app {APP_NAME} \
  --env="DATABASE_URL=$(nctl get postgres {DATABASE_NAME} --print-connection-string)/{DATABASE_NAME}"
```

This can also be done in the Cockpit.

### Best Practices

- Always create a backup of your source database before starting the migration
- Test the migration process in a staging environment first
- Consider the size of your database and plan for appropriate downtime / maintenance window
- Verify data integrity after the migration
- Update any database-specific configurations in your application

### Troubleshooting

If you encounter issues during the migration:

- Check the database connection settings
- Verify that your IP address is allowed in the `allowed-cidrs`
- Ensure you have the correct database version
- Check the database logs for any errors
- Verify that your backup file is not corrupted

For more detailed information about database configuration and management on Deploio, see the [database configuration guide](/user-guide/configuring-your-database)

## Retrieving environment variables

Below is an example of a shell script that you can use for retrieving environment variables. Depending on the platform you are migrating from, and whether they have a comprehensive CLI infrastructure, this could be adapted for your case.

In the below example, you would need to replace the `heroku_project` variable with your project name. The output will be a list of environment variables from the project which can then be passed when creating the application using the `nctl` command line. The [Heroku cli](https://devcenter.heroku.com/articles/heroku-cli) and [`jq` command line utility](https://jqlang.github.io/jq/) have to be installed.

`env-migration.sh`:
```shell
set -e

# Function to convert JSON to --env='KEY=VALUE;KEY=VALUE;...' format
convert_json_to_env() {
    local json_input="$1"
    # Process the JSON input and format it accordingly
    echo "--env='"$(echo "$json_input" | jq -r 'to_entries | map("\(.key)=\(.value|tostring)") | join(";")')"'"
}

# Fetching JSON input from Heroku config
heroku_project="heroku_project"
json_input=$(heroku config -a $heroku_project -j)
echo "$json_input"

# Check if json_input is empty
if [ -z "$json_input" ]; then
    echo "Error: Could not fetch Heroku config or config is empty."
    exit 1
fi

# Converting JSON to --env='KEY=VALUE;KEY=VALUE;...' format
env_arguments=$(convert_json_to_env "$json_input")

# Print the result
echo "$env_arguments"
```

The script can also be adapted as required, for example we could use the below **grep** to to avoid setting environment variables that start with `HEROKU`.

```
jq 'to_entries | map(select(.key | startswith("HEROKU") | not)) | map("\(.key)=\(.value)") | join(";")
```

Once you are happy with the script, you can then simply run `bash env-migration.sh` and the output will look something like this:

```
{
"ADMIN_EMAIL": "admin@admin.ch",
"ADMIN_PASSWORD": "password"
}
--env='ADMIN_EMAIL=admin@damin.ch;ADMIN_PASSWORD=password'
```

The second output can now be passed when creating the application. We can just keep these at hand for when we create the application, or, if the application is already created, we can update using the below command:

```
nctl update app gifcoins --env='ADMIN_EMAIL=admin@damin.ch;ADMIN_PASSWORD=password'
```

**Disclaimer:**

Please be aware that this is just an example of how to automate retrieving the environment variables. The user should make sure that they understand the script, which environment variables that they require, and thoroughly check the output.

## Updating DNS records

Given that we now have a new url for the application, we will need to update the DNS records to point to the new application running on Deploio.

##### An example using Cloudflare

Below we go through an example of adapting this where we use Cloudflare to manage our DNS records..

[//]: # (TODO: show an example with some images)

##### Considerations

It may be that you need to disable the "proxy mode"...

[//]: # (TODO: show an example with some images)

## Adapting deployment workflows for Deploio

Currently, when we link the GitHub repository and target revision for the application, the application will automatically re-deploy on branch changes.

If this is sufficient, the application can remain with this setup pointing to a static branch.

##### Integrating to the CI

On the other hand, should you wish to integrate the deployment process to the CI, allowing the test suite to run before deployment, we can adapt the process to do so.

[//]: # (TODO: add from migration guide)

## How to guides

Please see a list below of "how to" guides for migrating to Deploio:


