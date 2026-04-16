---
prev:
  text: Configuring Your Application
  link: /user-guide/configuring-your-application

next:
  text: Other dependencies
  link: /user-guide/other-dependencies
description: Comprehensive guide for creating and managing PostgreSQL and MySQL databases on Deploio including Economy and Business tiers, configuration, backups, monitoring, and troubleshooting.
---

# Configuring your Database

Deploio supports MySQL and PostgreSQL databases across two tiers, each designed for different use cases. You can find 
more information on the available databases [here](https://nine.ch/products/databases/) and technical reference on [docs.nine.ch](https://docs.nine.ch/docs/on-demand-services/).

### Choosing a tier

|                            | Economy                                 | Business                       |
|----------------------------|-----------------------------------------|--------------------------------|
| **Best for**               | Development, testing, low-traffic sites | High-traffic sites             |
| **Resources**              | Shared, multi-tenant                    | Dedicated instance             |
| **Storage**                | Up to 10 GB                             | 20 GB+ (auto-expanding)        |
| **Databases per instance** | 1                                       | Multiple                       |
| **Custom configuration**   | No                                      | Limited                        |
| **Backups**                | Daily (S3 storage)                      | Daily (configurable retention) |

### Protecting Database Access

All database instances only accept TLS-encrypted connections. Depending on the client or library, you may need to explicitly enable TLS. The TLS certificate is self-signed, so you may also need to disable certificate hostname validation.

For **Business** tier instances, you must set up SSH key authentication to access the database server directly. Pass the public key via the `--ssh-keys` flag when creating the database.
In addition, you can restrict access by IP address using the `--allowed-cidrs` flag. Access from Nine's Kubernetes products (NKE, GKE) and Deploio is already enabled by default.

## Economy tier

Databases in the Economy tier run in a logically separated tenant on a shared, multi-tenant environment managed by Nine 
— ideal for development, testing, and low-traffic applications. They start fast, making them a good fit for automated testing pipelines e.g..

> :warning: The Economy tier is currently in **Beta**. Breaking changes may still occur.

#### Packages

The package is automatically selected based on the current database size. Storage is capped at 10 GB — if you need more, 
migrate to a Business tier instance. Migration is at the moment not automated, but we're working on smoothening this
process.

| Package | Max Storage | Max Connections |
|---------|-------------|-----------------|
| S       | 1 GB        | 20              |
| M       | 5 GB        | 20              |
| L       | 10 GB       | 20              |

#### Limitations

- One database per instance (the database name matches the username)
- No dedicated resources — runs on shared infrastructure
- No custom configuration options (e.g. no extensions, no SQL mode tuning)
- No SSH access to the instance
- Storage cannot exceed 10 GB

### Creating an Economy database

:::tabs key:db
== PostgreSQL

```bash
nctl create postgresdatabase {DATABASE_NAME}
```

Optional flags:

- `--collation` — Set the collation (default: `C.UTF-8`)
- `--location` — Set the data center location

Retrieve connection details:

- **FQDN**: `nctl get postgresdatabase {DATABASE_NAME}`
- **User**: `nctl get postgresdatabase {DATABASE_NAME} --print-user`
- **Password**: `nctl get postgresdatabase {DATABASE_NAME} --print-password`

Connect to your database:

```bash
psql --host={FQDN} --dbname={USER} --username={USER}
```

== MySQL

```bash
nctl create mysqldatabase {DATABASE_NAME}
```

Optional flags:

- `--character-set` — Set the character set (default: `utf8mb4_unicode_ci` / `utf8mb4`)
- `--location` — Set the data center location

Retrieve connection details:

- **FQDN**: `nctl get mysqldatabase {DATABASE_NAME}`
- **User**: `nctl get mysqldatabase {DATABASE_NAME} --print-user`
- **Password**: `nctl get mysqldatabase {DATABASE_NAME} --print-password`

Connect to your database:

```bash
mysql -h {FQDN} -u {USER} -p
```

:::

### Backups

Backups are created daily and stored in S3-compatible object storage. 

To restore a PostgreSQL Economy backup:
1. Find the corresponding bucket for your database backup
```bash
nctl get bucket
```
2. Get the S3 credentials for the bucket user with the same name as the bucket
```
nctl get bucketuser {backup_bucket_name} --print-credentials
```

3. Download the backup using any S3-compatible client tool, e.g. `awscli`, see the [Nine technical reference](https://docs.nine.ch/docs/on-demand-services/postgresql/economy#backups) for more details

## Business tier

Business databases provide dedicated, isolated instances with their own resources — ideal for high-traffic sites. You get full user and database management, configurable backups, and automatic storage expansion.

### Database creation settings

There are a number of configurations you can apply when creating a Business database. Run `-h` for details, e.g. `nctl create mysql -h`.

#### Name

The name of the instance can be freely chosen, but must be unique. Once created, the name cannot be changed.

#### Location

Instances can be created in the following data center locations:

| Location | Data Center |
|----------|-------------|
| `nine-cz42` | ColoZüri 4.2, Altstetten, Zürich |
| `nine-es34` | NTT Zürich 1, Rümlang |

The location cannot be changed after creation.

#### Version

The database version must be selected when creating the instance and cannot be changed later. Available versions and their support periods are listed in the database-specific sections below.

#### Machine type

| Machine Type | Virtual CPU (VCPU) | RAM    | Storage Space | Monthly Fees |
|--------------|---------------------|--------|---------------|--------------|
| nine-db-xs   | 2                   | 4 GB   | 20 GB         | CHF 65       |
| nine-db-s    | 4                   | 8 GB   | 20 GB         | CHF 97       |
| nine-db-m    | 4                   | 12 GB  | 20 GB         | CHF 117      |
| nine-db-l    | 6                   | 16 GB  | 20 GB         | CHF 149      |
| nine-db-xl   | 8                   | 24 GB  | 20 GB         | CHF 201      |
| nine-db-xxl  | 10                  | 32 GB  | 20 GB         | CHF 253      |

Additional storage space per 10 GB: CHF 1.50 per month.

Machine types can be changed after creation. After an adjustment, the database instance will be restarted and will be unavailable for a few minutes.

#### Allowed IP addresses

IPv4 addresses and address ranges from which connections to the service can be established. Access from our Kubernetes products NKE (Nine Kubernetes Engine) and GKE (Google's Kubernetes Engine), as well as from deplo.io, is already enabled.

The access restriction can be adjusted at any time. Adjustments are made non-disruptively moments after the form is submitted.

We can set the allowed CIDRs by passing the `--allowed-cidrs={CIDR}` flag.

#### Backups

The backup retention period in days can be selected between 0 and 365 days by passing the `--keep-daily-backups={X}` flag.

If 0 days is selected, the backup routine will be disabled and all existing backups will be deleted. The default retention period is 10 days.

Please note that the storage space requirement increases if the local retention period is long. This may result in higher instance costs.

For more information about backing up your databases on a daily basis, accessing the backups, and how to create your own backups if needed, see the section about [backups](#backup-and-restore).

#### Accessing backups

Configure the public keys to access the database backups via SSH. The keys can be adjusted at any time.

These can be set via the `--ssh-keys` flag or the `--ssh-keys-file` flag.

### Database specific creation settings

:::tabs key:db
== PostgreSQL

#### Versions available

In the following table you can find the support period of each PostgreSQL version:

| PostgreSQL Version | Support End       |
|--------------------|-------------------|
| 17                 | November 08, 2029 |
| 16                 | November 09, 2028 |
| 15                 | November 11, 2027 |

#### Extensions

Nine provides a variety of extensions that you can activate as needed. The following extensions are available:

<details>
  <summary>Extensions</summary>

- address_standardizer
- address_standardizer_data_us
- btree_gin
- btree_gist
- citext
- cube
- dict_int
- earthdistance
- fuzzystrmatch
- hstore
- intarray
- isn
- lo
- ltree
- pg_prewarm
- pg_stat_statements
- pg_trgm
- pgcrypto
- plpgsql
- postgis
- postgis_tiger_geocoder
- postgis_topology
- seg
- tablefunc
- tcn
- tsm_system_time
- tsm_system_rows
- unaccent
- uuid-ossp
- vector

</details>

#### Collations

PostgreSQL uses ICU (International Components for Unicode) collations, which can be customized per database, schema, or column. The default collation is typically `en_US.UTF-8`.

When migrating the database, ensure your application's collation settings are compatible with your target PostgreSQL version. Different versions may handle text sorting and comparison differently, which could affect your application's behavior.

### Creating the Database

Considering the creation settings above, we run the following command to create the database server:

```
nctl create postgres {DATABASE_NAME} \
  --postgres-version={X} \
  --machine-type=nine-db-s \
  --allowed-cidrs=0.0.0.0/0 # all IP ranges \
  --ssh-keys={PUBLIC_KEY}
```

Please adjust the flags as you need.

We can now access the server using the FQDN and generated user and password. We can find this information as follows:

- **FQDN**: Run `nctl get postgres {DATABASE_NAME}`
- **User**: Run `nctl get postgres {DATABASE_NAME} --print-user`
- **Password**: Run `nctl get postgres {DATABASE_NAME} --print-password`

Now we want to create the database on the server. We can run the following command:

```
createdb -U dbadmin -h {FQDN} {DATABASE_NAME}
```

You will be prompted to enter the password.

We can check that this database was created by entering the server using `psql -U dbadmin -h {FQDN} -d postgres` and then running the command `\l` to list the databases on the server.

### Interacting with databases

##### Connecting

The connection information (FQDN, user, and password) for your instance can be found in Cockpit under Access Information. The database servers are accessible via their standard ports.

We can also find this information via the `nctl` command line tool:

- **FQDN**: Run `nctl get postgres {DATABASE_NAME}`
- **User**: Run `nctl get postgres {DATABASE_NAME} --print-user`
- **Password**: Run `nctl get postgres {DATABASE_NAME} --print-password`

The instance will only accept TLS connections. Depending on the client or library, you may need to explicitly enable TLS.

```bash
psql -h FQDN -d postgres -U dbadmin
# at first you can use the default database 'postgres' to be able to connect.
```

##### Basic commands

Creating a new database named `app_prod`:

```
postgres=> CREATE DATABASE app_prod;
```

Creating a new user named `app_prod`:

```
postgres=> CREATE USER app_prod WITH PASSWORD 'strongpassword';
```

You can also use the `--pwprompt` flag to be prompted for the password, or the `--interactive` flag to configure the user interactively. Otherwise, the password will be visible in the command and on screen.

You may also want to create a [superuser](https://www.postgresql.org/docs/current/role-attributes.html), which can be done by using the `--superuser` flag or via the interactive prompt.

You can see more information about the flags when creating a user in the [official postgres documentation](https://www.postgresql.org/docs/current/app-createuser.html).

Granting the user `app_prod` privileges to the database `app_prod`:

```
postgres=>  GRANT ALL ON app_prod TO app_prod;
```

> For granting more specified privileges, find the details in the official postgres documentation: <a href="https://www.postgresql.org/docs/16/ddl-priv.html#DDL-PRIV" target="_blank">DDL privileges</a>.

Changing the user `app_prod`'s password:

```
postgres=> ALTER USER app_prod WITH PASSWORD 'newstrongpassword';
```

Deleting the database `app_prod`:

```
postgres=> DROP DATABASE app_prod;
```

Deleting the user `app_prod`:

```
postgres=> DROP USER app_prod;
```

Use the <a href="https://www.postgresql.org/docs/16/sql-commands.html" target="_blank">official Postgres documentation</a> for additional info about user and database management.

== MySQL

#### Versions available

Nine currently provides On-Demand MySQL environments with MySQL 8 only.

#### Long Query Time

The "Long Query Time" specifies the time in seconds after which the MySQL service considers the execution of a query to be slow and logs the query.

#### Min Word Length

This value configures the minimum length of a word that MySQL will use for full text search.

Nine sets the value chosen here for both `ft_min_word_len` (MyISAM Storage Engine, Legacy) and `innodb_ft_min_token_size` (InnoDB Storage Engine).

#### Character Set

The charset is customizable. From experience, the default values `utf8mb4_unicode_ci` / `utf8mb4` cover most needs.

Before considering customizing these values, please consult the MySQL documentation: [Character Sets and Collations in MySQL](https://dev.mysql.com/doc/refman/8.0/en/charset-mysql.html).

#### Collations

MySQL 8.0 uses the `utf8mb4_0900_ai_ci` collation by default, which is based on Unicode 9.0.0. This is different from older MySQL versions which use `utf8mb4_unicode_ci` (based on Unicode 4.0.0).

When migrating between MySQL versions, ensure your application's collation settings are compatible with your target MySQL version. You may need to adjust your application's text sorting and comparison behavior accordingly.

#### Transaction Isolation

Nine recommends not making any adjustment to the selected default value unless absolutely necessary due to application requirements.

Be sure to consult the MySQL documentation in advance and familiarize yourself with the related implications: [Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html).

#### SQL Modes

The SQL Mode should also only be adjusted if the application absolutely requires it. Nine uses the default values set by Oracle for MySQL 8.

Oracle provides documentation and FAQ about SQL Modes in the following articles:

- [MySQL 8.0 FAQ: Server SQL Mode](https://dev.mysql.com/doc/refman/8.0/en/faqs-sql-modes.html)
- [Server SQL Modes](https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html)

#### Extensions

MySQL does not support extensions in the same way as PostgreSQL (via `CREATE EXTENSION`). However, many advanced features are either built into the core engine or available via optional server plugins.

You don't need to enable these manually — they are either available by default or configurable at runtime (via SQL or server settings).

> To inspect available plugins on your instance, you can run:
> ```sql
> SHOW PLUGINS;
> ```

Let us know if you need help enabling specific capabilities or configuring advanced features in your MySQL setup.

### Creating the Database

Considering the creation settings above, we run the following command to create the database server:

```
nctl create mysql {DATABASE_NAME} \
  --mysql-version={X} \
  --machine-type=nine-db-s \
  --allowed-cidrs={IP_ADDRESS}/0 \
  --ssh-keys={PUBLIC_KEY}
```

Please adjust the flags as you need.

We can now access the server using the FQDN and generated user and password. We can find this information as follows:

- **FQDN**: Run `nctl get mysql {DATABASE_NAME}`
- **User**: Run `nctl get mysql {DATABASE_NAME} --print-user`
- **Password**: Run `nctl get mysql {DATABASE_NAME} --print-password`

Now we want to create the database on the server. We can run the following commands:

1. **Connect to the server:**

    ```bash
    mysql -h {FQDN} -u dbadmin -p
    ```
    You will be prompted to enter the password.

2. **Create a new database from the MySQL prompt:**
    ```sql
    CREATE DATABASE my_app_db;
    ```

3. **List all databases to confirm:**
    ```sql
    SHOW DATABASES;
    ```

### Interacting with databases

##### Connecting

The connection information (FQDN, user, and password) for your instance can be found in Cockpit under Access Information. The database servers are accessible via their standard ports.

We can also find this information via the `nctl` command line tool:

- **FQDN**: Run `nctl get mysql {DATABASE_NAME}`
- **User**: Run `nctl get mysql {DATABASE_NAME} --print-user`
- **Password**: Run `nctl get mysql {DATABASE_NAME} --print-password`

The instance will only accept TLS connections. Depending on the client or library, you may need to explicitly enable TLS.

The TLS certificate in use is self-signed. In addition to enabling TLS transport encryption, you might need to disable certificate validation.

```bash
mysql -h FQDN -u dbadmin -p
# You will be prompted to enter the password
```

##### Basic commands

Connecting to your Database:

```
mysql -h FQDN -u dbadmin -p
```

Creating a new database named app_prod:

```
mysql> CREATE DATABASE app_prod;
```

Creating a new user named `app_prod`:

```
mysql> CREATE USER 'app_prod' IDENTIFIED BY 'strongpassword';
```

Granting the user `app_prod` privileges to the database `app_prod`:

```
mysql> GRANT ALL ON app_prod.* TO 'app_prod'@'%';
```

> For granting more specified privileges, find the details in the official MySQL documentation: <a href="https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#privileges-provided-summary" target="_blank">Summary of Available Privileges</a>.

Changing the user `app_prod`'s password:

```
mysql> ALTER USER app_prod IDENTIFIED BY 'newstrongpassword';
```

Deleting the database `app_prod`:

```
mysql> DROP DATABASE app_prod;
```

Deleting the user `app_prod`:

```
mysql> DROP USER app_prod;
```

Use the official MySQL documentation for additional info about <a href="https://dev.mysql.com/doc/refman/8.0/en/account-management-statements.html" target="_blank">user</a> and <a href="https://dev.mysql.com/doc/refman/8.0/en/tutorial.html" target="_blank">database</a> management.

:::

-----

### Monitoring for health and performance

Deploio database instances run on Nine's managed infrastructure. Nine monitors basic infrastructure-level availability, however you are responsible for observing database-level performance and load.

You can view the current status of the system [here](https://status.nine.ch/).

Nine monitors the instance with a monitoring system 24x7. In the event of a malfunction, an (on-call) technician from Nine is automatically alerted and restores proper operation as quickly as possible.

You can also view the current status of a database via the Cockpit, as well as information such as version, backup retention policy and "Allowed IP Addresses". This information can help when trying to assess and connection issues.

> ⚠️ Resource saturation (e.g., full CPU/memory/disk) is **not considered a malfunction**. You are responsible for monitoring performance and scaling your instance as needed.
>

#### What is Monitored by Nine

Nine monitors the **availability** and **infrastructure health** of the database node, such as:

- Instance accessibility (e.g. FQDN ping)
- Hardware failures
- Backup completion status
- Disk thresholds (for automatic storage expansion)

However, **application-level metrics like query latency, connection count, or CPU load** are not exposed via Cockpit today. This feature is currently WIP and will be available soon.

#### What You Can Monitor Yourself

:::tabs key:db
== PostgreSQL

To monitor your PostgreSQL database performance, you can connect via `psql` and use built-in extensions:

- `pg_stat_statements` – View expensive queries by total time
- `pg_stat_activity` – List active sessions and queries
- `pg_stat_bgwriter` – Monitor I/O activity and checkpoint behavior

Example to get top slow queries:

```sql
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 5;
```

To monitor connections:

```sql
SELECT * FROM pg_stat_activity;
```

##### Best Practices for PostgreSQL

- Enable `pg_stat_statements` at instance creation or shortly after
- Use tools like `psql`, pgAdmin, or DBeaver for live inspection
- Log slow queries from your app for long-term insights
- Regularly check backup status and instance disk growth
- Scale machine type via `nctl update` if your app outgrows the current size

== MySQL

To monitor your MySQL database performance, you can connect via `mysql` and run:

```bash
mysql -u dbadmin -p -h {FQDN}
```

Useful commands:

- View active queries:
  ```sql
  SHOW PROCESSLIST;
  ```

- View general performance stats:
  ```sql
  SHOW GLOBAL STATUS;
  ```

- Check uptime, queries per second, open connections:
  ```sql
  SHOW STATUS LIKE 'Uptime';
  SHOW STATUS LIKE 'Threads_connected';
  SHOW STATUS LIKE 'Questions';
  ```

##### Best Practices for MySQL

- Enable slow query logging at the application level
- Use tools like `mysql`, pgAdmin, or DBeaver for live inspection
- Log slow queries from your app for long-term insights
- Regularly check backup status and instance disk growth
- Scale machine type via `nctl update` if your app outgrows the current size

:::

-----

### Backup and Restore

Nine backs up Business databases daily between 02:00 and 03:00 UTC. These backups are kept locally for 10 days (configurable) and on a remote backup system for seven days.

Backups are stored in the `/home/dbadmin/backup` directory. All backups are versioned in directories with the following time scheme (example, exact timestamp will vary): `2022-11-18-0134`.

`/home/dbadmin/backup/latest` always points to the latest backup.

Backups are stored in the `customer` directory. The database schema can be found in the `structure` directory.

##### Create additional backups

Additional backups can be created by running:

:::tabs key:db
== PostgreSQL

```
dbadmin@managedvirtualmachine-xxxxxxx:~ $ sudo nine-postgresql-backup
2022-11-18T09:54:19+01:00 Dumped and compressed database 'frontend_production' in 53 seconds
2022-11-18T09:55:04+01:00 Dumped and compressed database 'frontend_staging' in 45 seconds
```

== MySQL

```
dbadmin@managedvirtualmachine-xxxxxxx:~ $ sudo nine-mysql-backup
2022-11-18T09:54:19+01:00 Dumped and compressed database 'frontend_production' in 53 seconds
2022-11-18T09:55:04+01:00 Dumped and compressed database 'frontend_staging' in 45 seconds
```

:::

##### Storage requirements of the backups

The backup routine creates compressed backups. Depending on the size of the database, this may still result in backups that require a lot of disk space.

To ensure that sufficient disk space is always available, the On Demand database environments have a mechanism that automatically monitors and performs a [disk space expansion if required](#automatic-storage-space-expansion).

##### Number of backups kept

The number of backups kept can be adjusted via Cockpit. The duration of the retention period can be freely selected between one and 365 days.

Please note that a long retention period requires more storage space, which may result in additional costs.

##### Disabling backups

To disable backups, the retention time can be adjusted to `0`.

In this case, the creation of further backups is deactivated. All backups already created will be **deleted** shortly after the adjustment.

##### Access to the created backups

Using the system user `dbadmin` you can access the created backups via an SSH connection.

SSH access for the user is controlled by storing an SSH key in Cockpit.

##### Restoring and working with the created backups

The backup routine used is the same as the one we use for our managed servers. We have described how to work with the backups as well as more information about restoring backups in the following support articles:

- <a href="https://docs.nine.ch/docs/managed-server-services/databases/postgresql-backup-and-restoration/" target="_blank">PostgreSQL Backups and Restore</a>
- <a href="https://docs.nine.ch/a/m8U4Gt5lNj" target="_blank">MySQL Backups and Restore</a>

#### Automatic storage space expansion

To provide the most robust environment possible, the available storage space is monitored at 5 minute intervals. If our monitoring detects that the available storage space falls below a threshold, an expansion of the storage quota is automatically performed.

##### Thresholds

For a total storage size below 50 GB, the threshold is 5 GB of free storage space.

For a total storage size above 50 GB, the threshold is 10% free storage space.

##### Expansion of the storage space

The expansion of the storage space is done automatically in steps of 25 GB.

##### Reduction of storage space

It is not currently possible to reduce the disk size of database instances. The only way to reduce disk usage is to download a backup of the current instance and restore it to a new instance.

##### Billing of the storage space expansion

The additional storage space is charged automatically.
