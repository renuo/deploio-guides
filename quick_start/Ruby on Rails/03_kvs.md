---
id: kvs
title: Create a Key Value Store
description: Learn how to create a key value store for your Ruby on Rails application with Deploio
displayed_sidebar: quickStartSidebar
---

# Create a Key Value Store for your Rails application

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
Firstly, we create the key value store by running the `create kvs` command:

```
nctl create keyvaluestore {application_name}
```

This creates the on-demand key-value store instance with name `{application_name}` within the currently active project
space. The created store supports the latest API of Redis (Version 7). Due
to [license changes](https://redis.io/blog/what-redis-license-change-means-for-our-managed-service-providers/) and the associated uncertainty about the future development of Redis,
we have decided to use a Redis-compatible alternative as a replacement soon.
We now need to retrieve the information for
this created instance, and set the environment variables using this information.

After creating the key-value store, we can retrieve some information about it by running:

```shell-session
Retrieve the key-value store information, 
including the fully qualified domain name (FQDN):

$ nctl get keyvaluestore {application_name}
PROJECT       NAME                  FQDN                                                    TLS     MEMORY SIZE
my-project    {application_name}    {application_name}.1234567.keyvaluestore.nineapis.ch    true    1Gi

Retrieve the password for the key-value store:

$ nctl get keyvaluestore {application_name} --print-token
...password...
```

From this we can construct and set the `REDIS_URL` and `REDISCLI_AUTH` environment variable as follows:

```bash
nctl update application {application_name} --env='REDIS_URL=rediss://:{PASSWORD}@{FQDN};REDISCLI_AUTH={PASSWORD}'
```

Note that we are using `rediss` as TLS is enabled. The `REDIS_URL` can then be used in your application to connect to
the key-value store.

You can read more about configuration of the KVS instance in more detail in
the [documentation](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store).

## Next Steps

Do you need **object storage** for your application? Proceed to [the next step.](./object_storage.md)
