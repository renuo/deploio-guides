---
prev:
  text: Quick start
  link: /ruby/quick-start
next:
  text: Key/Value storage
  link: /ruby/key-value-storage
description: Instructions for creating and configuring PostgreSQL or MySQL databases for Rails applications including connection setup, migrations, and troubleshooting.
---

# Create a database for your Rails application

::: info
In this guide, we will show you how to create a database for your Ruby on Rails application using Deploio. You can see more information on databases [here](/user-guide/configuring-your-database.md).

Should you wish to migrate an already existing database from elsewhere, you can view this section in the documentation [here](/user-guide/migrating-from-other-platforms.md).
:::

## Choose a tier

Deploio offers two database tiers. See the [database guide](/user-guide/configuring-your-database.md) for full details.

|                            | Economy                                 | Business                       |
|----------------------------|-----------------------------------------|--------------------------------|
| **Best for**               | Development, testing, low-traffic sites | Production, high-traffic sites |
| **Databases per instance** | 1                                       | Multiple                       |
| **Storage**                | Up to 10 GB                             | 20 GB+ (auto-expanding)        |
| **Resources**              | Shared (multi-tenant)                   | Dedicated instance             |

## Create the database

::: tip
To ensure the database resource gets allocated to the correct project, you should switch to the correct project context:

```bash
nctl auth set-project my-project
```

Alternatively, you can specify the project name with the `-p, --project` flag in the following commands.
:::

:::tabs key:db
== PostgreSQL

#### Economy

Create a PostgreSQL database:

```bash
nctl create postgresdatabase {NAME}
```

Add the database as a service reference to your application:

```bash
nctl update app {APP_NAME} \
  --service db=postgresdatabase/{NAME}
```

If the application is already running, create a new release so the injected service variables become available:

```bash
nctl update app {APP_NAME} --retry-release
```

The following environment variables have been injected into your application:

| Variable | Description |
| :--- | :--- |
| `NINE_PGDB_<NAME>_FQDN` | Hostname. Uses private networking DNS when private networking is configured; otherwise the public hostname. |
| `NINE_PGDB_<NAME>_PORT` | Port `(always 5432)`. |
| `NINE_PGDB_<NAME>_USER` | Database name (same as the name assigned at creation). |
| `NINE_PGDB_<NAME>_PASSWORD` | Password. |
| `NINE_PGDB_<NAME>_CA_CERT` | CA certificate. Only injected when a CA certificate is present. |
| `NINE_PGDB_<NAME>_DSN` | Full PostgreSQL connection URI `(postgres://user:pass@host:port/dbname)`. |

Where `<NAME>` is the reference name you assigned in `--service <name>=..`, uppercased with non-alphanumeric characters replaced by `_`. For example, the previously used reference name `db` becomes `DB`.

See the [technical reference](https://docs.nine.ch/docs/deplo-io/configuration/deploio-connecting-to-services) for more info on service references.

#### Business

To create a Postgres database server for your Ruby application, you can use the `nctl create` command like this:

```bash
nctl create postgres {NAME} \
  --postgres-version=17 \
  --machine-type=nine-db-xs \
  --location=nine-cz42
```

Retrieve the connection details:

```bash
$ nctl get postgres {NAME}
PROJECT       NAME      FQDN                                   LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.postgres.nineapis.ch    nine-cz41    nine-db-xs

$ nctl get postgres {NAME} --print-user
dbadmin

$ nctl get postgres {NAME} --print-password
...password...
```

## Access to the server

By default, your database server is only accessible from applications running in Deploio. If you want to access the database server
from your local machine or some other location, you need to configure network exceptions with the `--allowed-cidrs`
option. To allow all IPs, you would use the following parameter:

```bash
nctl update postgres {NAME} --allowed-cidrs="0.0.0.0/0"
```

To only allow specific IPs, you can give a list of IPs with subnet mask:

```bash
nctl update postgres {NAME} --allowed-cidrs="203.0.113.1/32,..."
```

You can also allow your own IP using the following parameter:

```bash
nctl update postgres {NAME} --allowed-cidrs="$(curl -s ipinfo.io/ip)/32"
```

For more information on IP filtering and using an SSH key, see the [Database documentation](/user-guide/configuring-your-database.md).

## Configure Your Rails Application

Add the database server as a service reference to your application:

```bash
nctl update app {APP_NAME} \
  --service db=postgres/{NAME}
```

If the application is already running, create a new release so the injected service variables become available:

```bash
nctl update app {APP_NAME} --retry-release
```

The following environment variables have been injected into your application:

| Variable | Description |
| :--- | :--- |
| `NINE_PG_<NAME>_FQDN` | Hostname. Uses private networking DNS when private networking is configured; otherwise the public hostname. |
| `NINE_PG_<NAME>_PORT` | Port `(always 5432)`. |
| `NINE_PG_<NAME>_USER` | Username. |
| `NINE_PG_<NAME>_PASSWORD` | Password. |
| `NINE_PG_<NAME>_CA_CERT` | CA certificate. Only injected when a CA certificate is present. |
| `NINE_PG_<NAME>_DSN` | Full PostgreSQL connection URI (`postgres://user:pass@host:port/dbname`). |

Where `<NAME>` is the reference name you assigned in `--service <name>=..`, uppercased with non-alphanumeric characters replaced by `_`. For example, the previously used reference name `db` becomes `DB`.

See the [technical reference](https://docs.nine.ch/docs/deplo-io/configuration/deploio-connecting-to-services) for more info on service references.

## Create the database

To create a database on the database server, start an interactive shell in your web application with:

```bash
nctl exec app {APP_NAME}
```

In that shell, run the following command to create the database:

```bash
createdb -U dbadmin -h {FQDN} my-database
```


1. You will be asked for the password. You can verify the database was created by connecting with

`psql -U dbadmin -h {FQDN} -d postgres` and running the following SQL query:

```sql
SELECT datname FROM pg_database;
```

#### Troubleshooting

If you encounter any issues when **connecting to a Business database**, check that your IP address
was correctly added to the allowed CIDRs:

```bash
nctl get postgres {NAME} -o yaml
```

Search for the `allowedCIDRs` field. To add your current IP address:

```bash
nctl update postgres {NAME} --allowed-cidrs "$(curl -s ipinfo.io/ip)/32"
```

Also, ensure that your current **client version is compatible with the database version**.
You can find the currently used version in the YAML output of `nctl get` by searching for the `version` field.

== MySQL

#### Economy

Create a MySQL database:

```bash
nctl create mysqldatabase {NAME}
```

Add the database as a service reference to your application:

```bash
nctl update app {APP_NAME} \
  --service db=mysqldatabase/{NAME}
```

If the application is already running, create a new release so the injected service variables become available:

```bash
nctl update app {APP_NAME} --retry-release
```

The following environment variables have been injected into your application:

| Variable | Description |
| :--- | :--- |
| `NINE_MYSQLDB_<NAME>_FQDN` | Hostname. Uses private networking DNS when private networking is configured; otherwise the public hostname. |
| `NINE_MYSQLDB_<NAME>_PORT` | Port `(always 3306)`. |
| `NINE_MYSQLDB_<NAME>_USER` | Username (same as the database name assigned at creation). |
| `NINE_MYSQLDB_<NAME>_PASSWORD` | Password. |
| `NINE_MYSQLDB_<NAME>_CA_CERT` | CA certificate. Only injected when a CA certificate is present. |

Where `<NAME>` is the reference name you assigned in `--service <name>=..`, uppercased with non-alphanumeric characters replaced by `_`. For example, the previously used reference name `db` becomes `DB`.

See the [technical reference](https://docs.nine.ch/docs/deplo-io/configuration/deploio-connecting-to-services) for more info on service references.

#### Business

To create a MySQL database server for your Ruby application, you can use the `nctl create` command like this:

```bash
nctl create mysql {NAME} \
  --character-set-collation=utf8mb4_unicode_ci \
  --machine-type=nine-db-xs \
  --location=nine-cz42
```

Further details on the flags can be found by running `nctl create mysql --help`.
Note that currently, only MySQL 8 databases are supported.

Retrieve the connection details:

```bash
$ nctl get mysql {NAME}
PROJECT       NAME      FQDN                                LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.1234567.mysql.nineapis.ch    nine-cz41    nine-db-xs

$ nctl get mysql {NAME} --print-user
dbadmin

$ nctl get mysql {NAME} --print-password
...password...
```

## Access to the server

By default, your database server is only accessible from applications running in Deploio. If you want to access the database server
from your local machine or some other location, you need to configure network exceptions with the `--allowed-cidrs`
option. To allow all IPs, you would use the following parameter:

```bash
nctl update mysql {NAME} --allowed-cidrs="0.0.0.0/0"
```

To only allow specific IPs, you can give a list of IPs with subnet mask:

```bash
nctl update mysql {NAME} --allowed-cidrs="203.0.113.1/32,..."
```

You can also allow your own IP using the following parameter:

```bash
nctl update mysql {NAME} --allowed-cidrs="$(curl -s ipinfo.io/ip)/32"
```

For more information on IP filtering and using an SSH key, see the [Database documentation](/user-guide/configuring-your-database.md).

## Configure your Rails application

Add the database as a service reference to your application:

```bash
nctl update app {APP_NAME} \
  --service db=mysql/{NAME}
```

If the application is already running, create a new release so the injected service variables become available:

```bash
nctl update app {APP_NAME} --retry-release
```

The following environment variables have been injected into your application:

| Variable | Description |
| :--- | :--- |
| `NINE_MYSQL_<NAME>_FQDN` | Hostname. Uses private networking DNS when private networking is configured; otherwise the public hostname. |
| `NINE_MYSQL_<NAME>_PORT` | Port `(always 3306)`. |
| `NINE_MYSQL_<NAME>_USER` | Username (same as the database name assigned at creation). |
| `NINE_MYSQL_<NAME>_PASSWORD` | Password. |
| `NINE_MYSQL_<NAME>_CA_CERT` | CA certificate. Only injected when a CA certificate is present. |

Where `<NAME>` is the reference name you assigned in `--service <name>=..`, uppercased with non-alphanumeric characters replaced by `_`. For example, the previously used reference name `db` becomes `DB`.

See the [technical reference](https://docs.nine.ch/docs/deplo-io/configuration/deploio-connecting-to-services) for more info on service references.

## Create the database

To create a database on the database server, make sure that your local machine's IP address is allowed to connect to the database server. Then, use a MySQL client directly from your **local machine** to create the database.

```bash
mysql -h {FQDN} -u dbadmin -p --ssl-mode=REQUIRED
```

You will be prompted to enter your database admin password.

> **Warning:** Deploio supports **MySQL version 8**. If you have MySQL 9 installed locally, you
> may lack the `mysql_native_password` plugin. Install an older client instead
> (e.g. `brew install mysql-client@8.4`).

Once connected, create the database:

```sql
CREATE DATABASE my_database;
```

Verify with `SHOW DATABASES;`.

#### Troubleshooting

If you encounter any issues when **connecting to a Business database**, check that your IP address
was correctly added to the allowed CIDRs:

```bash
nctl get mysql {NAME} -o yaml
```

Search for the `allowedCIDRs` field. To add your current IP address:

```bash
nctl update mysql {NAME} --allowed-cidrs "$(curl -s ipinfo.io/ip)/32"
```

Also, ensure that your current **client version is compatible with the database version**. You can find the currently used version in the YAML output of `nctl get` by searching for the `version` field.

:::

## Further Steps

##### Check Database Configuration

You need to adjust the `database.yml` file in your Rails application to ensure that it is using the correct database. If this file does not exist in your `config/` directory (common in modern Rails 7+ apps), create it manually. Here is an example configuration:

```yaml
default: &default
  adapter: postgresql # Change to 'mysql2' if using MySQL
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: project_name_development

test:
  <<: *default
  database: project_name_test

production:
  <<: *default
  # For PostgreSQL Tiers (Business or Economy)
  url: "<%= ENV['NINE_PG_DB_DSN'] || ENV['NINE_PGDB_DB_DSN'] %>"

  # For MySQL Tiers (Business or Economy)
  # Un-comment the lines below if you are using MySQL instead of PostgreSQL:
  # host: "<%= ENV['NINE_MYSQL_DB_FQDN'] || ENV['NINE_MYSQLDB_DB_FQDN'] %>"
  # port: "<%= ENV['NINE_MYSQL_DB_PORT'] || ENV['NINE_MYSQLDB_DB_PORT'] %>"
  # username: "<%= ENV['NINE_MYSQL_DB_USER'] || ENV['NINE_MYSQLDB_DB_USER'] %>"
  # password: "<%= ENV['NINE_MYSQL_DB_PASSWORD'] || ENV['NINE_MYSQLDB_DB_PASSWORD'] %>"
  # database: my_database
```

To verify that Rails can connect to the database, open a shell in your app and run a quick query via the Rails runner:

```bash
nctl exec app {APP_NAME} -- bundle exec rails runner "puts ActiveRecord::Base.connection.execute('SELECT 1').first"
```

If the connection is working, this prints `{"?column?"=>"1"}` (PostgreSQL) or `{"1"=>1}` (MySQL). If it fails, double-check your custom NINE_ environment variables and database.yml settings.

##### Run Migrations

You can now run the database migrations to create the tables in the database.
This can be done through the [`.deploio.yaml`](/user-guide/configuring-your-application.md#_3-deploio-yaml) file by specifying 
a deploy job:

```yaml
deployJob:
  name: db-migrations
  command: bundle exec rails db:migrate
  retries: 0
  timeout: 5m
```

or by manually running the migrations:

```bash
nctl exec app {APP_NAME} bundle exec rails db:migrate
```

If you did not get any errors during the migration, you should now have a healthy connection to your database and be able
to interact with it through your Rails application.

## Next Steps

Do you need a Redis-compatible **key value store** for your application (e.g. for running Sidekiq)?
Proceed to the next step.
