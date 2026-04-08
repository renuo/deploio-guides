---
prev:
  text: Configuring Your Database
  link: /user-guide/configuring-your-database
next:
  text: Network & Deployment
  link: /user-guide/network-and-deployment
description: Guide for setting up Redis-compatible key-value stores, object storage, and persistent volumes as dependencies for Deploio applications.
---

# Other Dependencies

This guide covers how to setup a Redis-compatible key-value store and S3-compatible object storage
These dependencies can be used for caching, task queues or to store static files and assets.

## Key-Value Store

#### Redis for caching or task queues

Should you require workers or caching, you can use Redis as a key-value store. You can see the different sizes available and pricing [here](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store/).

[//]: # (TODO: should we move all that across to here? I'm confused as to whether those docs will remain...)

Due to [licence changes](https://redis.io/blog/what-redis-license-change-means-for-our-managed-service-providers/) and the associated uncertainty about the future development of Redis, we have decided to use a Redis-compatible alternative as a replacement in the near future.

#### Creating the Key-Value Store

Firstly, we create the key value store by running the `create kvs` command:

```
nctl create kvs {application_name} --project {project_name}
```

This creates the Redis instance with name `{application_name}` within the project space. We now need to retrieve the information for this created instance, and set the environment variables using this information.

::: info
`kvs` is short for `keyvaluestore`. `nctl` also works if you use the long name `nctl create keyvaluestore my-kvs ...`.
:::

Firstly, we can get the **FQDN**, and check the other details, by running:

```
nctl get kvs {application_name}
```

We will also need to get the **password** for the access by running:

```
nctl get kvs {application_name} --print-token
```

From this we can construct and set the `REDIS_URL` and `REDISCLI_AUTH` environment variable as follows:

```
nctl update app {application_name} --env='REDIS_URL=rediss://:{PASSWORD}@{FQDN};REDISCLI_AUTH={PASSWORD}'
```

Note that we are using `rediss` as TLS is enabled.

## Object Storage

**Deploio doesn't give you a disk to store files permanently.**
It's because real hard disk storage is difficult to scale horizontally.
So the [12factor](https://12factor.net/backing-services) industry best practice
has been for quite some time to use cloud storage, most famously Amazon S3.
We call this "object storage".

::: info
If you absolutely need a real persistent and backed-up disk,
consider using a [Nine CloudVM](https://nine.ch/products/root-cloud-server/)
or [bring your own server hardware](https://nine.ch/de/produkte/colocation/) instead.
:::

#### Setup bucket and user

Following command creates a bucket named `{bucket_name}` in the project space:
```
nctl create bucket {bucket_name} --project {project_name} --location nine-es34
```

Nine has has multiple [datacenter locations](https://docs.nine.ch/docs/managed-kubernetes/nke/nine-kubernetes-engine#locations).
`nine-es34` is the default for Deploio.

In order to access the bucket, we need to create user with access to it.

```
nctl create bucketuser --location=nine-es34 {bucketuser_name}
```

Afterwards you can retrieve the access key and secret key for this user by running
```
nctl get bucketuser {bucketuser_name} --print-credentials
```

#### Connecting

The created bucket is S3-compatible, meaning you can use any S3 client to connect your application to it, 
such as the AWS CLI or the `boto3` Python library. In addition, if you want to connect manually to the bucket, we've
documented a list of possible tools and their required configuration in this [guide](https://docs.nine.ch/docs/object-storage/object-storage-client-tools).

#### Encryption

Object storage files are encrypted at rest on disk.
