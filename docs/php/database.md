---
prev:
  text: Quick start
  link: /php/quick-start
next:
  text: Key/Value storage
  link: /php/key-value-storage
---

# Create a Database for Your PHP Application

::: info
In this guide, we will show you how to create a database for your PHP application using Deploio.
You can see more information on databases [here](/user-guide/configuring-your-database.md).

Should you wish to migrate an already existing database from elsewhere, you can view this section in the
documentation [here](/user-guide/migrating-from-other-platforms.md).
:::

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

To create a Postgres database server for your PHP application, you can use the `nctl create` command like this:

```bash
nctl create postgres {NAME} \
  --postgres-version=16 \
  --machine-type=nine-db-s
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

## Access to the Database

By default, your database is only accessible from applications running in Deploio. If you want to access the database
from your local machine or some other location, you need to configure network exceptions with the `--allowed-cidrs`
option. To allow all IPs, you would use the following parameter:

```bash
nctl update postgres {NAME} --allowed-cidrs="0.0.0.0/0"
```

To only allow specific IPs, you can give a list of IPs with subnet mask:

```bash
nctl update postgres {NAME} --allowed-cidrs="203.0.113.1/32,..."
```

For more information on IP filtering and using an SSH key, see the [Database documentation](/user-guide/configuring-your-database.md).

## Configure Your PHP Application

To connect your PHP application to the database, you need to set the `DATABASE_URL` environment variable.
You can retrieve the value of this environment variable by running:

```bash
nctl get postgres {NAME} --print-connection-string
```

> **Note:** The connection string will look something like this: `postgres://dbadmin:password@{FQDN}`.
> Append the database name, version and charset to the end of this string to create the full connection string:
> `postgres://dbadmin:password@{FQDN}/my-database?version={VERSION}&charset=utf8`.
>
> If you are not sure about the database version, you find the version in the GUI or in the full service definition:
> ```bash
> nctl get postgres {NAME} --output=yaml | grep version
> ```

To configure the `DATABASE_URL` environment variable in your application, run:

```bash
nctl update app {APP_NAME} \
--env="DATABASE_URL=$(nctl get postgres {NAME} --print-connection-string)/my-database?version=16&charset=utf8"
```

Where `my-database` is the name of the database you want to create.

## Create the database

To create a database on the database server, start an interactive shell in your web application with:

```bash
nctl exec app {APP_NAME}
```

In that shell, run the following command to create the database:

```bash
bin/console doctrine:database:create
```

You can verify that this database was created by logging into the database using `psql -U dbadmin -h {FQDN} -d postgres`
and then running the command `\l` to list the databases on the server.

> **Alternative:** If you do not use Doctrine or otherwise want to do something differently, make sure that your IP is allowed to connect
> to the database and then use a Postgres client from your machine to create the database. E.g. with the Postgres CLI:
>
> ```bash
> createdb -U dbadmin -h {FQDN} my-database
> ```
>
> You will be asked for the password.

### Troubleshooting

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

== MySQL

To create a MySQL database server for your PHP application, you can use the `nctl create` command like this:

```bash
nctl create mysql {NAME} \
  --character-set-collation=utf8mb4_unicode_ci \
  --machine-type=nine-db-s
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

For more setup commands, visit the
[Nine MySQL documentation](https://docs.nine.ch/docs/on-demand-databases/on-demand-databases-mysql/#basic-commands).

## Access to the Database

By default, your database is only accessible from applications running in Deploio. If you want to access the database
from your local machine or some other location, you need to configure network exceptions with the `--allowed-cidrs`
option. To allow all IPs, you would use the following parameter:

```bash
nctl update mysql {NAME} --allowed-cidrs="0.0.0.0/0"
```

To only allow specific IPs, you can give a list of IPs with subnet mask:

```bash
nctl update mysql {NAME} --allowed-cidrs="203.0.113.1/32,..."
```

For more information on IP filtering and using an SSH key, see the [Database documentation](/user-guide/configuring-your-database.md).

## Configure Your PHP Application

To connect your PHP application to the database, you need to set the `DATABASE_URL` environment variable.
You can retrieve the value of this environment variable by running:

```bash
nctl get mysql {NAME} --print-connection-string
```

> **Note:** The connection string will look something like this: `mysql://dbadmin:password@{FQDN}`.
> Append the database name to the end of this string to create the full connection string.

Thus, you can set the `DATABASE_URL` environment variable as follows:

```bash
nctl update app {APP_NAME} \
--env="DATABASE_URL=$(nctl get mysql {NAME} --print-connection-string)/my_database?version=9"
```

Where `my_database` is the name of the database you want to create.

## Create the database

To create a database on the database server, start an interactive shell in your web application with:

```bash
nctl exec app {APP_NAME}
```

In that shell, run the following command to create the database:

```bash
bin/console doctrine:database:create
```

You can verify that this database was created by logging into the database using `psql -U dbadmin -h {FQDN} -d postgres`
and then running the command `\l` to list the databases on the server.

> **Alternative:** If you do not use Doctrine or otherwise want to do something differently, make sure that your IP is allowed to connect
> to the database and then use a MySQL client from your machine to create the database. E.g. with the MySQL CLI:
>
> ```bash
> mysql -h {FQDN} -u dbadmin -p
> ```
>
> You will be prompted to enter the password. Once connected, you can create the database:
>
> ```sql
> CREATE DATABASE my_database;
> ```
>
> To check that the database was created, you can run the query `SHOW DATABASES;`.
>
> **Warning:** Currently, Deploio supports **MySQL version 8**. If you have MySQL version 9 installed on your local machine,
> you probably lack the `mysql_native_password` plugin as it has been removed in MySQL 9.
> Hence, you would need to install an older version of the client
> (e.g. `brew install mysql-client@8.4` and then `/opt/homebrew/opt/mysql-client@8.4/bin/mysql -h ...` on macOS using Homebrew).

### Troubleshooting

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

:::

## Using the Database in your PHP Application

When using Symfony, make sure that your application is reading the `DATABASE_URL` DSN:

```php file="config/packages/doctrine.yaml"
doctrine:
    dbal:
        url: '%env(resolve:DATABASE_URL)%'
```

If you use Doctrine DBAL without the Symfony configuration, you can use its `DsnParser` to parse the `DATABASE_URL`:

```php
<?php
use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Tools\DsnParser;

//..
$dsnParser = new DsnParser();
$connectionParams = $dsnParser->parse(getenv('DATABASE_URL'));

$conn = DriverManager::getConnection($connectionParams);
```

If your application needs something else than the connection string, set the necessary variables for your requirements.

::: tip
If you need separate fields for your connection and don't want to use a parser like the Doctrine `DsnParser`, you can
JSON encode the connection parameters and set that as environment variable (manually copying the settings from the
connection string you got from Deploio):

```bash
nctl update app {APP_NAME} \
--env='DATABASE={"user": "{USER}", "password": "{PASS}", "host": "{HOST}", "dbname": "my_database"}'
```

In PHP, you then `json_decode` the variable:
```php
$parameters = json_decode(getenv('DATABASE'), true, JSON_THROW_ON_ERROR);
$conn = new mysqli($parameters['host'], $parameters['user'], $parameters['password'], $parameters['dbname']);
```
:::

### Run Migrations

Doctrine provides the [doctrine/migrations](https://www.doctrine-project.org/projects/doctrine-migrations/en/3.9/index.html)
package to manage database schema migrations.
To run the migrations, specify a deploy job in your [`deploio.yaml`](/user-guide/configuring-your-application.md#deploioyaml)
or run the migrations manually:

```bash
nctl exec app {APP_NAME} bin/console doctrine:migrations:migrate
```

If you did not get any errors during the migration, you should now have a healthy connection to your database and be able
to interact with it through your Symfony application.

## Next Steps

Do you need a Redis-compatible **key value store** for your application?
Proceed to the next step.
