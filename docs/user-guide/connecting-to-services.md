---
prev:
  text: Configuring Your Application
  link: /user-guide/configuring-your-application
next:
  text: Configuring Your Database
  link: /user-guide/configuring-your-database
description: Guide to connecting Deploio applications to on-demand services using service references and managed environment variables.
---

# Connecting to Services

Deploio applications often need more than the code itself. If your app depends on a database, a key-value store, or search, you can connect it to an on-demand service through a service reference and let Deploio manage the credentials for you.

::: warning Beta
This feature is currently in beta and is available through `nctl` only. Cockpit support is not yet implemented.
:::

## How it works

When you add a service reference to an application, Nine automatically creates and manages an encrypted ServiceConnection in the target service project.

At runtime, Nine injects the connection details as environment variables into every instance of the application. You do not need to configure networking manually.

## Supported services

You can reference the following service types from a Deploio application:

- [Key-Value Store](https://docs.nine.ch/docs/on-demand-services/key-value-store)
- [MySQL](https://docs.nine.ch/docs/on-demand-services/mysql/)
- [PostgreSQL](https://docs.nine.ch/docs/on-demand-services/postgresql/)
- [OpenSearch](https://docs.nine.ch/docs/on-demand-services/opensearch)

## Add a service reference

Each service reference needs a destination service.

Use `--service` with the format `name=kind/target-name`.

For a new application:

```bash
nctl create application my-app \
  --git-url=https://github.com/example/app.git \
  --service cache=keyvaluestore/my-kvs