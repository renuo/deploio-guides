---
id: kvs
title: Create a Key Value Store
displayed_sidebar: rubySidebar
sidebar_position: 3
---

# Create a Key Value Store for your Rails application

Should you require workers or caching, you can use Redis as a key-value store. You can see the different sizes available and pricing [here](/documentation/dependencies_and_addons#key-value-store).

## Create the Key Value Store

You can read more about configuration of the Redis instance in the documentation. Here, we will provide a simple example.

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

From this we can construct and set the `REDIS_URL` and `REDISCLI_AUTH` environment variable as follows:

```
nctl update application {application_name} --env='REDIS_URL=rediss://:{PASSWORD}@{FQDN};REDISCLI_AUTH={PASSWORD}'
```

Note that we are using `rediss` as TLS is enabled.


## Next Steps

Do you need **object storage** for your application? Proceed to the next step.
