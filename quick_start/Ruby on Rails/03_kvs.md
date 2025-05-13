---
id: kvs
title: Create a Key Value Store
description: Learn how to create a key value store for your Ruby on Rails application with Deploio
displayed_sidebar: quickStartSidebar
---

# Create a Key Value Store for your Ruby on Rails application

<div class="summary">
Should you require workers or caching, you can use our Redis-compatible key-value store (KVS). 
You can see the different sizes available and pricing [here](/documentation/other_dependencies#key-value-store).
</div>

## Create the Key Value Store

:::tip
Before you create resources, ensure that the project you want to create the resources in is selected by
running `nctl auth set-project {project_name}`.
:::

In this guide, we will provide a simple example to demonstrate how to attach a key value store to your application.
Start by creating the key value store with the `create kvs` command:

```
nctl create keyvaluestore {application_name}
```

This creates the on-demand key-value store instance with name `{application_name}` owned by the currently active project.
The created store supports the latest API of Redis (Version 7). 

:::note
Due to [license changes](https://redis.io/blog/what-redis-license-change-means-for-our-managed-service-providers/) and
the associated uncertainty about the future development of Redis, Deploio will switch away from Redis to a compatible
alternative as a replacement soon.
:::

## Configuring the Key Value Store in your Rails Application

Once the store has been created, you need to retrieve the connection information, and set the environment variables
using this information.
To fetch information about the key-value store, including the fully qualified domain name (FQDN), run:

```shell-session
$ nctl get keyvaluestore {application_name}
PROJECT       NAME                  FQDN                                                    TLS     MEMORY SIZE
my-project    {application_name}    {application_name}.1234567.keyvaluestore.nineapis.ch    true    1Gi

Retrieve the password for the key-value store:

$ nctl get keyvaluestore {application_name} --print-token
...password...
```

With this information, you can construct and set the `REDIS_URL` and `REDISCLI_AUTH` environment variable as follows:

```bash
nctl update application {application_name} --env='REDIS_URL=rediss://:{PASSWORD}@{FQDN};REDISCLI_AUTH={PASSWORD}'
```

Note that you need to specify `rediss` as protocol because TLS (transport layer security) is enabled. The `REDIS_URL`
can then be used in your application to connect to the key-value store.

You can read more about configuration of the KVS instance in more detail in
the [documentation](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store).

## Next Steps

Do you need **object storage** for your application? Proceed to the next step.
