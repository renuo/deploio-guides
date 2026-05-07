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

Retrieve the connection details:

```bash
$ nctl get postgresdatabase {NAME} --print-connection-string
postgres://user:password@{NAME}.1234567.postgres.nineapis.ch/{NAME}
```

Set the `DATABASE_URL` environment variable:

```bash
nctl update app {APP_NAME} \
  --env="DATABASE_URL=$(nctl get postgresdatabase {NAME} --print-connection-string)"
```

No further database creation is needed — the database is ready to use immediately.

#### Business

Create a PostgreSQL database server:

```bash
nctl create postgres {NAME} \
  --postgres-version=17 \
  --machine-type=nine-db-xs \
  --allowed-cidrs="203.0.113.1/32,..." \
  --ssh-keys-file=my-key.pub
```

Retrieve the connection details:

```bash
$ nctl get postgres {NAME}
PROJECT       NAME      FQDN                                   LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.1234567.postgres.nineapis.ch    nine-cz41    nine-db-xs

$ nctl get postgres {NAME} --print-user
dbadmin

$ nctl get postgres {NAME} --print-password
...password...
```

With a Business database, you get a full server and need to create the database yourself.
Open a shell in your application:

```bash
nctl exec app {APP_NAME}
```

Then create the database:

```bash
createdb -U dbadmin -h {FQDN} my-database
```

You will be asked for the password. You can verify the database was created by connecting with
`psql -U dbadmin -h {FQDN} -d postgres` and running `\l`.

> **Alternative:** You can use `rails db:create` after setting `DATABASE_URL` instead. The database
> server must be created first with `nctl create postgres`.

Set the `DATABASE_URL` environment variable:

```bash
nctl update app {APP_NAME} \
  --env="DATABASE_URL=$(nctl get postgres {NAME} --print-connection-string)/my-database"
```

Where `my-database` is the name of the database you created.

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

This creates a single database. Retrieve the connection details:

```bash
$ nctl get mysqldatabase {NAME} --print-user
$ nctl get mysqldatabase {NAME} --print-password
$ nctl get mysqldatabase {NAME}
```

Set the `DATABASE_URL` environment variable:

```bash
nctl update app {APP_NAME} \
  --env="DATABASE_URL=mysql2://{USER}:{PASSWORD}@{FQDN}/{NAME}"
```

No further database creation is needed — the database is ready to use immediately.

#### Business

Create a MySQL database server:

```bash
nctl create mysql {NAME} \
  --character-set-collation=utf8mb4_unicode_ci \
  --machine-type=nine-db-xs \
  --allowed-cidrs="203.0.113.1/32,..." \
  --ssh-keys-file=my-key.pub
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

With a Business database, you get a full server and need to create the database yourself.
Open a shell in your application:

```bash
nctl exec app {APP_NAME}
```

Connect to MySQL:

```bash
mysql -h {FQDN} -u dbadmin -p
```

> **Warning:** Deploio supports **MySQL version 8**. If you have MySQL 9 installed locally, you
> may lack the `mysql_native_password` plugin. Install an older client instead
> (e.g. `brew install mysql-client@8.4`).

Once connected, create the database:

```sql
CREATE DATABASE my_database;
```

Verify with `SHOW DATABASES;`.

> **Alternative:** You can use `rails db:create` after setting `DATABASE_URL` instead. The database
> server must be created first with `nctl create mysql`.

Set the `DATABASE_URL` environment variable:

```bash
nctl update app {APP_NAME} \
  --env="DATABASE_URL=$(nctl get mysql {NAME} --print-connection-string)/my_database"
```

Where `my_database` is the name of the database you created.

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

Rails should automatically use the `DATABASE_URL` environment variable to connect to the database. However, you may need
to adjust the `database.yml` file in your Rails application to ensure that it is using the correct database and that the
current configuration is appropriate. Here is an example configuration:

```yaml
default: &default
  adapter: postgresql
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
  url: <%= ENV['DATABASE_URL'] %>
```

To verify that Rails can connect to the database, open a shell in your app and run a quick query via the Rails runner:

```bash
nctl exec app {APP_NAME} -- bundle exec rails runner "puts ActiveRecord::Base.connection.execute('SELECT 1').first"
```

If the connection is working, this prints `{"?column?"=>"1"}` (PostgreSQL) or `{"1"=>1}` (MySQL). If it fails, double-check your `DATABASE_URL` and `database.yml` settings.

##### Run Migrations

You can now run the database migrations to create the tables in the database.
This can be done through the [`.deploio.yaml`](/user-guide/configuring-your-application.md#deploioyaml) file by specifying 
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
