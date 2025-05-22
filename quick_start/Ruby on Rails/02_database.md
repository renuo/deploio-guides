---
id: create_database
title: Create a Database for Your Rails Application
description: Learn how to create a database for your Ruby on Rails application with Deploio
displayed_sidebar: quickStartSidebar
---

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

# Create a database for your Rails application

<div class="summary">
In this guide, we will show you how to create a database for your Ruby on Rails application using Deploio.
You can see more information on databases [here](/documentation/configuring_your_database).

Should you wish to migrate an already existing database from elsewhere, you can view this section in the
documentation [here](/documentation/migrating_from_other_platforms), or read [this blog](/ruby_heroku_migration_guide) which
guides you through migrating a Rails project from Heroku.
</div>

[//]: # (TODO: do I talk about SSH keys etc here or just creating?)

## Create the database

:::tip
To ensure the database resource gets allocated to the correct project, you should switch to the correct project context:

```bash
nctl auth set-project my-project
```

Alternatively, you can specify the project name with the `-p, --project` flag in the following commands.
:::

```mdx-code-block
<Tabs>
<TabItem value="PostgreSQL">
```

To create a postgres database server for your Rails application, you can use the `nctl create` command like this:

```bash
nctl create postgres {NAME} \
  --postgres-version=15 \
  --machine-type=nine-db-s \
  --allowed-cidrs="203.0.113.1/32,..." \
  --ssh-keys-file=my-key.pub
```

Further details on the flags can be found in the manual by running `nctl create postgres --help`.

You can now access the server using the **fully-qualified domain name (FQDN)** and generated user and password. 
You can find this information as follows:

```shell-session
$ nctl get postgres {NAME}
PROJECT       NAME      FQDN                                   LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.1234567.postgres.nineapis.ch    nine-cz41    nine-db-s

$ nctl get postgres {NAME} --print-user
dbadmin

$ nctl get postgres {NAME} --print-password
...password...
```

To create a database on the server, create an interactive shell in your web application with:

```bash
nctl exec app {APP_NAME}
```

In that shell, run the following command to create the database:

```bash
createdb -U dbadmin -h {FQDN} my-database
```

You will be asked for the password.

You can verify that this database was created by logging into the server using `psql -U dbadmin -h {FQDN} -d postgres`
and then running the command `\l` to list the databases on the server.

## Configure Your Rails Application

To connect your Rails application to the database, you need to set the `DATABASE_URL` environment variable.
You can retrieve the value of this environment variable by running:

```bash
nctl get postgres {NAME} --print-connection-string
```

:::note
The connection string will look something like this: `postgres://dbadmin:password@{FQDN}`.
Append the database name to the end of this string to create the full connection string.
:::

To configure the `DATABASE_URL` environment variable in your application, run:

```bash
nctl update app {APP_NAME} \
--env="DATABASE_URL=$(nctl get postgres {NAME} --print-connection-string)/my-database"
```

Where `my-database` is the name of the database you created.

## Troubleshooting

If you encounter any issues when **connecting to the database**, check that your IP address was correctly added to the 
allowed CIDRs. You can do this by running:

```bash
nctl get postgres {NAME} -o yaml
```

and then search for the `allowedCIDRs` field.
To add your current IP address, you could use the following command:

```bash
nctl update postgres {NAME} --allowed-cidrs "$(curl -s ipinfo.io/ip)/32"
```

Also, ensure that your current **client version is compatible with the database version**. 
You can find the currently used version in the YAML output of `nctl get` by searching for the `version` field.

```mdx-code-block
</TabItem>
<TabItem value="MySQL">
```

To create a MySQL database server for your Rails application, you can use the `nctl create` command like this:

```bash
nctl create mysql {NAME} \
  --character-set-collation=utf8mb4_unicode_ci \
  --machine-type=nine-db-s \
  --allowed-cidrs="203.0.113.1/32,..." \
  --ssh-keys-file=my-key.pub
```

Further details on the flags can be found in the manual by running `nctl create mysql --help`.
Note that currently, only MySQL 8 databases are supported.

You can now access the server using the **fully-qualified domain name (FQDN)** and generated user and password.
You can find this information as follows:

```shell-session
$ nctl get mysql {NAME}
PROJECT       NAME      FQDN                                LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.1234567.mysql.nineapis.ch    nine-cz41    nine-db-s

$ nctl get mysql {NAME} --print-user
dbadmin

$ nctl get mysql {NAME} --print-password
...password...
```

To create a database on the server, create an interactive shell in your web application with:

```bash
nctl exec app {APP_NAME}
```

In that shell, run the following command to create the database:

```bash
mysql -h {FQDN} -u dbadmin -p
```

:::warning
Currently, Deploio supports **MySQL version 8**. If you have MySQL version 9 installed on your local machine,
you probably lack the `mysql_native_password` plugin as it has been removed in MySQL 9.
Hence, you would need to install an older version of the client

(e.g. `brew install mysql-client@8.4` and then `/opt/homebrew/opt/mysql-client@8.4/bin/mysql -h ...` on macOS using Homebrew).
:::

You will be prompted to enter the password. Once connected, you can create the database:

```sql
CREATE DATABASE my_database;
```

To check that the database was created, you can run the command `SHOW DATABASES;`.

For more setup commands, visit the
[official MySQL documentation](https://docs.nine.ch/docs/on-demand-databases/on-demand-databases-mysql/#basic-commands).

## Configure Your Rails Application

To connect your Rails application to the database, you need to set the `DATABASE_URL` environment variable.
You can retrieve the value of this environment variable by running:

```bash
nctl get mysql {NAME} --print-connection-string
```

:::note
The connection string will look something like this: `mysql://dbadmin:password@{FQDN}`.
Append the database name to the end of this string to create the full connection string.
:::

Thus, you can set the `DATABASE_URL` environment variable as follows:

```bash
nctl update app {APP_NAME} \
--env="DATABASE_URL=$(nctl get mysql {NAME} --print-connection-string)/my_database"
```

Where `my_database` is the name of the database you created.

## Troubleshooting

If you encounter any issues when **connecting to the database**, check that your IP address was correctly added to the
allowed CIDRs. You can do this by running:

```bash
nctl get mysql {NAME} -o yaml
```

and then search for the `allowedCIDRs` field.
To add your current IP address, you could use the following command:

```bash
nctl update mysql {NAME} --allowed-cidrs "$(curl -s ipinfo.io/ip)/32"
```

Also, ensure that your current **client version is compatible with the database version**.
You can find the currently used version in the YAML output of `nctl get` by searching for the `version` field.

```mdx-code-block
</TabItem>
</Tabs>
```

## Further Steps

##### Check Database Configuration

Rails should automatically use the `DATABASE_URL` environment variable to connect to the database. However, you may need
to adjust the `database.yml` file in your Rails application to ensure that it is using the correct database and that the
current configuration is appropriate.

##### Run Migrations

You can now run the migrations on your Rails application to create the tables in the database. 
This can be done through the [`deploio.yaml`](/documentation/configuring_your_application#deploioyaml) file by specifying a deploy job or by
manually running the migrations:

```bash
nctl exec app {APP_NAME} rails db:migrate
```

If you did not get any errors during the migration, you should now have a healthy connection to your database and be able
to interact with it through your Rails application.

## Next Steps

Do you need a Redis-compatible **key value store** for your application (e.g. for running Sidekiq)? 
Proceed to the next step.

