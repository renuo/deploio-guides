# Metabase

A quick guide to deploying a self-hosted Metabase instance on Deploio and connecting it to PostgreSQL or MySQL databases.

## Before you start

Metabase needs a persistent application database to store its users, dashboards, configuration, etc.
::: tip
Use a Deploio PostgreSQL database for this. Do not rely on Metabase's embedded H2 database for a production deployment.
:::

::: warning
Metabase is a Java application and needs at least **1 GB of memory**. Allocate more if you expect substantial usage or larger workloads.
:::

## 1. Create the Metabase application database

Create a PostgreSQL database in Deploio. See [Configuring your database](../user-guide/configuring-your-database.md) for details. In the Deploio Cockpit, open the database's **Access** section and note its FQDN, database name, username, password, and port.

## 2. Deploy Metabase

Create an application in Deploio using the official Metabase container image. If your deployment uses a Dockerfile, commit it to a Git repository or subdirectory configured as the application's source. For example, the [Metabase Deploio Repository](https://github.com/Stiwyy/metabase-deploio) includes a Metabase Dockerfile.

Configure these environment variables on the application. Use the credentials for the Database created in step 1:

| Environment Variables      | Value                                        |
|----------------------------|-----------------------------------------|
| MB_DB_DBNAME               | Database name                           |
| MB_DB_HOST                 | FQDN from **access**                    |
| MB_DB_PASS                 | Database password                       |
| MB_DB_PORT                 | Port (5432)                             |
| MB_DB_TYPE                 | postgres                                |
| MB_DB_USER                 | Database User (same as name)            |

## 3. Add a data source in Metabase

### PostgreSQL Database Setup

1. In Metabase, open **Admin settings → Databases** and select **Add database**.
2. Select **PostgreSQL** and enter a display name.
3. In the Deploio Cockpit, open the PostgreSQL database you want to connect and go to **Access**. Use its FQDN as the host, along with its database name, username, password, and port (usually `5432`).
4. Enable **Use a secure connection (SSL)** and save the connection.
5. Verify that Metabase can connect.

### MySQL Database Setup

1. In Metabase, open **Admin settings → Databases** and select **Add database**.
2. Select **MySQL** and enter a display name.
3. In the Deploio Cockpit, open the MySQL database and go to **Access**. Use its FQDN as the host, along with its database name, username, password, and port (usually `3306`).
4. Enable **Use a secure connection (SSL)** and provide the server CA certificate from **Access → Certificate Authority**.
5. Open advanced options and add `disableSslHostnameVerification=true` under **Additional JDBC connection string options**. Use this only if required.
6. Save the connection and verify that Metabase can connect.
