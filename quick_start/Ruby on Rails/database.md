---
id: create_database
title: Create a Database
displayed_sidebar: quickStartSidebar
sidebar_position: 2
---

# Create a database for your Rails application

Should you wish to migrate a database from elsewhere, you can view this section in the documentation [here](/articles/migrating_from_other_platforms), or read [this blog](/ruby_heroku_migration_guide) which guides you through migrating a Rails project from Heroku.

[//]: # (TODO: do I talk about SSH keys etc here or just creating?)

## Create the database

You can read more about configuration of the database in the documentation. Here, we will provide a simple example.

```
nctl create postgres {NAME} \
  --postgres-version={X} \
  --machine-type=nine-db-s \
  --allowed-cidrs={IP_ADDRESS}/0 \
  --ssh-keys={PUBLIC_KEY}
```

Please adjust the flags as you need.

We can now access the server using the FQDN and generated user and password. We can find this information as follows:

- **FQDN**: Run:
  ```sh
  nctl get postgres {NAME}
  ```
- **User**: The default user is `dbadmin`, but you can verify with:
  ```sh
  nctl get postgres {NAME} --print-user
  ```
- **Password**: Retrieve it using:
  ```sh
  nctl get postgres {NAME} --print-password
  ```

Now we want to create the database on the server. We can run the following command:

```
createdb -U dbadmin \
-h {FQDN} main
```

You will be prompted to enter the password.

We can check that this database was created by entering the server using `psql -U dbadmin -h {FQDN} -d postgres` and then running the command `\l` to list the databases on the server.

## Configure Your Rails Application

In a standard Rails app, we only need to set the `DATABASE_URL` environment variable.

This can be retrieved by running the following command:

```
nctl get postgres {NAME} --print-connection-string
```

And then can be set as follows:

```
nctl update app {APP_NAME} \
--env="DATABASE_URL=postgres://username:password@fqdn:5432/name"
```

## Further Steps

##### Check Database Configuration

Rails should automatically use the `DATABASE_URL` environment variable to connect to the database. However, you may need to adjust the `database.yml` file in your Rails application to ensure that it is using the correct database and that the current configuration is appropriate.

##### Run Migrations

You can now run the migrations on your Rails application to create the tables in the database. This can be done through the [`deploio.yaml`](/articles/configuring_your_application#deploioyaml) file (which runs on deployment) or by manually running the migrations.

##### Final Checks

You should now check that your Rails application can connect to the database.

[//]: # (TODO: how can I do this? can we run rails commands like `db:version`?)


## Next Steps

Do you need a **key value store** for your application? Proceed to the next step.
