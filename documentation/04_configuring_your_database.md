---
title: Configuring your Database
---

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

# Configuring your Database

Deploio supports a variety of databases, including MySQL, MariaDB and PostgreSQL. You can find more information on the different databases available [here](https://nine.ch/products/databases/) and information about pricing [here](#machine-type).

```mdx-code-block
<Tabs>
<TabItem value="PostgreSQL">
```

#### Protecting Database Access

To protect the database you can use an SSH key. You will need to pass the public key to the `--ssh-keys` flag when creating the database and use the private key to gain access.

You can also add your IP address to the `--allowed-cidrs` flag. If you wish to allow all IP addresses, you can set this to `0.0.0.0/0`. 

#### Database creation settings

There are a number of configurations we can apply when creating our database. 

##### Name

The name of the instance can be freely chosen, but must be unique. Once created, the name cannot be changed.

##### Location

Depending on available resources, instances can be created in two locations within the "ColoZüri" data center or the "NTT" data center in Rümlang. The location cannot be changed later.

This can be set by the `--location` flag and the default is `cz41`.

##### Machine type

:::note[Note]
We recommend `nine-db-s` or larger sizings for production workloads.
:::

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

##### Allowed IP addresses

IPv4 addresses and address ranges from which connections to the service can be established. Access from our Kubernetes products NKE (Nine Kubernetes Engine) and GKE (Google's Kubernetes Engine), as well as from deplo.io, is already enabled.

The access restriction can be adjusted at any time. Adjustments are made non-disruptively moments after the form is submitted.

We can set the allowed CIDRs by passing the `--allowed-cidrs={CIDR}` flag.

##### Backup Retention Policy

The backup retention period in days can be selected between 0 and 365 days by passing the `--keep-daily-backups={X}` flag.

If 0 days is selected, the backup routine will be disabled and all existing backups will be deleted. The default retention period is 10 days.

Please note that the storage space requirement increases if the local retention period is long. This may result in higher instance costs.

For more information about backing up your databases on a daily basis, accessing the backups, and how to create your own backups if needed, see the section about [backups](#backup-and-restore).

##### SSH Public Keys

Configure the public keys to access the database backups via SSH. The keys can be adjusted at any time.

These can be set via the `--ssh-keys` flag or the ` --ssh-keys-file` flag.

##### Version

You can select your desired PostgreSQL version when creating the database instance. The version cannot be adjusted after the instance is created.

In the following table you can find the support period of each PostgreSQL version:


| PostgreSQL Version | Support End       |
|--------------------|-------------------|
| 16                 | November 09, 2028 |
| 15                 | November 11, 2027 |
| 14                 | November 12, 2026 |
| 13                 | November 13, 2025 |

##### Extensions

Nine provides a variety of extensions that you can activate as needed. The following extensions are available:

[//]: # (TODO: change this to white like the alert box)

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

</details>


#### Creating the Database

Considering the creation settings above, we run the following command to create the database server:

```
nctl create postgres {NAME} \
  --postgres-version={X} \
  --machine-type=nine-db-s \
  --allowed-cidrs={IP_ADDRESS}/0 \
  --ssh-keys={PUBLIC_KEY}
```

Please adjust the flags as you need.

We can now access the server using the FQDN and generated user and password. We can find this information as follows:

- **FQDN**: Run `nctl get postgres main`
- **User**: This is always set to `dbadmin` but you can check by running `nctl get postgres main --print-user`
- **Password**: Run `nctl get postgres main --print-password`

Now we want to create the database on the server. We can run the following command:

```
createdb -U dbadmin -h {FQDN} {database-name}
```

You will be prompted to enter the password.

We can check that this database was created by entering the server using `psql -U dbadmin -h {FQDN} -d postgres` and then running the command `\l` to list the databases on the server.

[//]: # (TODO: do we actually want to show how to create a database here? Or will this go somewhere else?)

#### Backup and Restore

Nine backs up the databases daily between 01:00 and 02:00. These backups are kept locally for 10 days (configurable) and on a remote backup system for seven days.

Backups are stored in the `/home/dbadmin/backup directory`. All backups are versioned in directories with the following time scheme (example, exact timestamp will vary): `2022-11-18-0134`.

`/home/dbadmin/backup/latest` always points to the latest backup.

Backups are stored in the customer directory. The database schema can be found in the structure directory.

##### Create additional backups

Additional backups can be created by running:

```
dbadmin@managedvirtualmachine-xxxxxxx:~ $ sudo nine-postgresql-backup
2022-11-18T09:54:19+01:00 Dumped and compressed database 'frontend_production' in 53 seconds
2022-11-18T09:55:04+01:00 Dumped and compressed database 'frontend_staging' in 45 seconds
```

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

The backup routine used is the same as the one we use for our managed servers. We have described how to work with the backups as well as more information about restoring backups in the following support article: <a href="https://docs.nine.ch/docs/managed-server-services/databases/postgresql-backup-and-restoration/" target="_blank">PostgreSQL Backups and Restore</a>

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

#### Interacting with databases

##### Connecting

The connection information (FQDN, user, and password) for your instance can be found in Cockpit under Access Information. The database servers are accessible via their standard ports.

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


#### Monitoring for health and performance.

- ...

[//]: # (TODO: fill this out - new part. Maybe some crossover with the above?)


```mdx-code-block
</TabItem>
```

```mdx-code-block
<TabItem value="MySQL">
```

#### Protecting Database Access

To protect the database you can use an SSH key. You will need to pass the public key to the `--ssh-keys` flag when creating the database and use the private key to gain access.

You can also add your IP address to the `--allowed-cidrs` flag. If you wish to allow all IP addresses, you can set this to `0.0.0.0/0`.

#### Database creation settings

There are a number of configurations we can apply when creating our database.

[//]: # (TODO: Complete for MySQL and any other options)

```mdx-code-block
</TabItem>
</Tabs>
```

