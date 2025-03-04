---
title: Other Dependencies
---

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

# Other Dependencies

## Key-Value Store

#### Redis for caching or task queues

Should you require workers or caching, you can use Redis as a key-value store. You can see the different sizes available and pricing [here](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store).

[//]: # (TODO: should we move all that across to here? I'm confused as to whether those docs will remain...)

Due to [licence changes](https://redis.io/blog/what-redis-license-change-means-for-our-managed-service-providers/) and the associated uncertainty about the future development of Redis, we have decided to use a Redis-compatible alternative as a replacement in the near future.

#### Creating the Key-Value Store

Firstly, we create the key value store by running the `create kvs` command:

```
nctl create kvs {application_name} --project {project_name}
```

This creates the Redis instance with name `{application_name}` within the project space. We now need to retrieve the information for this created instance, and set the environment variables using this information.

Firstly, we can get the **FQDN**, and check the other details, by running:

```
nctl get keyvaluestore {application_name}
```

We will also need to get the **password** for the access by running:

```
nctl get keyvaluestore {application_name} --print-token
```

[//]: # (TODO: is this quite Rails specific? I think this should look more like the nctl kvs section)

From this we can construct and set the `REDIS_URL` and `REDISCLI_AUTH` environment variable as follows:

```
nctl update application {application_name} --env='REDIS_URL=rediss://:{PASSWORD}@{FQDN};REDISCLI_AUTH={PASSWORD}'
```

Note that we are using `rediss` as TLS is enabled.

## Object Storage

##### For static files and assets.

- ...

## Persistent Volumes

##### Define usage limits for disk storage.

- ...


Explore more advanced configurations for your dependencies.
