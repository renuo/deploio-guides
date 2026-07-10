---
prev:
  text: Quick start
  link: /php/quick-start
next:
  text: Key/Value storage
  link: /php/key-value-storage
description: Instructions for creating and configuring PostgreSQL or MySQL databases for PHP applications including Doctrine integration, migrations, and connection troubleshooting.
---

# Create a Database for Your PHP Application

::: info
In this guide, we will show you how to create a database for your PHP application using Deploio.
You can see more information on databases [here](/user-guide/configuring-your-database.md).

Should you wish to migrate an already existing database from elsewhere, you can view this section in the
documentation [here](/user-guide/migrating-from-other-platforms.md).
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

To create a Postgres database server for your PHP application, you can use the `nctl create` command like this:

```bash
nctl create postgres {NAME} \
  --postgres-version=16 \
  --machine-type=nine-db-s \
  --location=nine-cz42
```

Further details on the flags can be found in the manual by running `nctl create postgres --help`.

You can now access the server using the **fully-qualified domain name (FQDN)** and generated user and password.
Retrieve this information by running:

```bash
$ nctl get postgres {NAME}
PROJECT       NAME      FQDN                                   LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.1234567.postgres.nineapis.ch    nine-cz41    nine-db-s

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

## Configure Your PHP Application

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
bin/console doctrine:database:create
```

You can verify that this database was created by logging into the database server using `psql -U dbadmin -h {FQDN} -d postgres`
and then running the command `\l` to list the databases on the server.

> **Alternative:** If you do not use Doctrine or otherwise want to do something differently, make sure that your IP is allowed to connect
> to the database server and then use a Postgres client to create the database. E.g. with the Postgres CLI:
>
> Connect to the database server:
>
> ```bash
> psql -U dbadmin -h {FQDN} -d postgres
> ```
>
> You will be prompted to enter the password. Once connected, you can create the database:
>
> ```sql
> CREATE DATABASE my_database;
> ```
>
> Verify the database was created:
>
>```sql
> SELECT datname FROM pg_database;
>```


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

To create a MySQL database server for your PHP application, you can use the `nctl create` command like this:

```bash
nctl create mysql {NAME} \
  --character-set-collation=utf8mb4_unicode_ci \
  --machine-type=nine-db-s \
  --location=nine-cz42
```

Further details on the flags can be found in the manual by running `nctl create mysql --help`.
Note that currently, only MySQL 8 databases are supported.

You can now access the server using the **fully-qualified domain name (FQDN)** and the generated user and password.
Retrieve this information by running:

```bash
$ nctl get mysql {NAME}
PROJECT       NAME      FQDN                                LOCATION     MACHINE TYPE
my-project    {NAME}    {NAME}.1234567.mysql.nineapis.ch    nine-cz41    nine-db-s

$ nctl get mysql {NAME} --print-user
dbadmin

$ nctl get mysql {NAME} --print-password
...password...
```

For more setup commands, visit the
[Nine MySQL documentation](https://docs.nine.ch/docs/on-demand-databases/on-demand-databases-mysql/).

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

## Configure Your PHP Application

Add the database server as a service reference to your application:

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

To create a database on the database server, start an interactive shell in your web application with:

```bash
nctl exec app {APP_NAME}
```

In that shell, run the following command to create the database:

```bash
bin/console doctrine:database:create
```

You can verify that this database was created by logging into the database server from your local machine (using `mysql -h {FQDN} -u dbadmin -p --ssl-mode=REQUIRED`)
and then running the command `SHOW DATABASES;` to list the databases on the server.

> **Alternative:** If you do not use Doctrine or otherwise want to do something differently, make sure that your IP is allowed to connect
> to the database server and then use a MySQL client from **your machine** to create the database. E.g. with the MySQL CLI:
>
> Connect to the database server:
>
> ```bash
> mysql -h {FQDN} -u dbadmin -p --ssl-mode=REQUIRED
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

When using Symfony, you must update your configuration to check for the specific environment variables Deploio injects based on your database type and tier. Since the reference name `db` becomes `DB`, you configure your application as follows.

Update your doctrine config file based on your database type and tier (`config/packages/doctrine.yaml`):

For PostgreSQL Business:

```php file="config/packages/doctrine.yaml"
doctrine:
    dbal:
        url: '%env(resolve:NINE_PG_DB_DSN)%'
```

For PostgreSQL Economy:

```php file="config/packages/doctrine.yaml"
doctrine:
    dbal:
        url: '%env(resolve:NINE_PGDB_DB_DSN)%'
```

For MySQL Business:

```php file="config/packages/doctrine.yaml"
doctrine:
    dbal:
        driver: 'pdo_mysql'
        host: '%env(resolve:NINE_MYSQL_DB_FQDN)%'
        port: '%env(resolve:NINE_MYSQL_DB_PORT)%'
        user: '%env(resolve:NINE_MYSQL_DB_USER)%'
        password: '%env(resolve:NINE_MYSQL_DB_PASSWORD)%'
        dbname: 'my_database'
        charset: utf8mb4
        options:
            !php/const:PDO::MYSQL_ATTR_SSL_CA: '%env(resolve:NINE_MYSQL_DB_CA_CERT)%'
```

For MySQL Economy:

```php file="config/packages/doctrine.yaml"
doctrine:
    dbal:
        driver: 'pdo_mysql'
        host: '%env(resolve:NINE_MYSQLDB_DB_FQDN)%'
        port: '%env(resolve:NINE_MYSQLDB_DB_PORT)%'
        user: '%env(resolve:NINE_MYSQLDB_DB_USER)%'
        password: '%env(resolve:NINE_MYSQLDB_DB_PASSWORD)%'
        dbname: 'my_database'
        charset: utf8mb4
```

If you use Doctrine DBAL without the Symfony configuration, you no longer need a parser for MySQL, as Deploio provides the exact fields you need natively. You can dynamically detect which database and tier is attached:

```php
<?php
use Doctrine\DBAL\DriverManager;

// Detect PostgreSQL (Business or Economy)
$pgDsn = getenv('NINE_PG_DB_DSN') ?: getenv('NINE_PGDB_DB_DSN');

if ($pgDsn) {
    $connectionParams = ['url' => $pgDsn];
} else {
    // Detect MySQL (Business or Economy)
    $connectionParams = [
        'dbname' => 'my_database', // Update this with your actual database name
        'user' => getenv('NINE_MYSQL_DB_USER') ?: getenv('NINE_MYSQLDB_DB_USER'),
        'password' => getenv('NINE_MYSQL_DB_PASSWORD') ?: getenv('NINE_MYSQLDB_DB_PASSWORD'),
        'host' => getenv('NINE_MYSQL_DB_FQDN') ?: getenv('NINE_MYSQLDB_DB_FQDN'),
        'port' => getenv('NINE_MYSQL_DB_PORT') ?: getenv('NINE_MYSQLDB_DB_PORT'),
        'driver' => 'pdo_mysql',
    ];
}

$conn = DriverManager::getConnection($connectionParams);
```

::: Tip
Because Deploio now automatically injects granular variables (like NINE_MYSQL_DB_USER and NINE_MYSQL_DB_PASSWORD), you no longer need complex JSON-encoding workarounds to parse connection strings into separate fields for MySQL databases. You can pass these environment variables directly into native PHP PDO or mysqli instances if you choose not to use Doctrine.
:::

### Run Migrations

Doctrine provides the [doctrine/migrations](https://www.doctrine-project.org/projects/doctrine-migrations/en/3.9/index.html)
package to manage database schema migrations.
To run the migrations, specify a deploy job in your [`deploio.yaml`](/user-guide/configuring-your-application.md#_3-deploio-yaml)
or run the migrations manually:

```bash
nctl exec app {APP_NAME} bin/console doctrine:migrations:migrate
```

If you did not get any errors during the migration, you should now have a healthy connection to your database and be able to interact with it through your Symfony application.

## Next Steps

Do you need a Redis-compatible **key value store** for your application?
Proceed to the next step.
