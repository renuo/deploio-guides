---
prev:
  text: Database
  link: /php/database
next:
  text: Object storage
  link: /php/object-storage
description: Guide for setting up Redis-compatible key-value stores for PHP applications supporting caching and Symfony configurations with TLS connections.
---

# Create a Key Value Store for your PHP application

::: info
Should you require workers or caching, you can use our Redis-compatible key-value store (KVS).
You can see the different sizes available and pricing [here](/user-guide/other-dependencies.md#key-value-store).
:::

## Create the Key Value Store

::: tip
Before you create resources, ensure that the project you want to create the resources in is selected by
running `nctl auth set-project {project_name}`.
:::

Create the key value store with the `create kvs` command:

```bash
nctl create kvs {KVS_NAME}
```

This creates a key-value store owned by the currently active project.
The key-value store supports the Redis 7 API.

::: info
Due to [license changes](https://redis.io/blog/what-redis-license-change-means-for-our-managed-service-providers/) and
the associated uncertainty about the future development of Redis, Deploio will switch away from Redis to a compatible
alternative as a replacement soon.
:::

## Bind the Key Value Store to your Application

Add the key-value store as a service reference to your application. By using `redis=` as the alias, Deploio will automatically inject the granular `NINE_KVS_REDIS_*` environment variables into your application.

```bash
nctl update app {APP_NAME} \
  --service redis=kvs/{KVS_NAME}
```

If the application is already running, create a new release so the injected service variables become available:

```bash
nctl update app {APP_NAME} --retry-release
```

See the [technical reference](https://docs.nine.ch/docs/deplo-io/configuration/deploio-connecting-to-services) for more info on service references, injected environment variables, and how to remove a service reference.

## Using the Key Value Store in your PHP Application

When using Symfony, you must update your configuration to construct the connection string using the granular environment variables Deploio injects. Since the reference name used in the binding step was `redis`, the placeholder name becomes `REDIS`, meaning your injected variables are prefixed with `NINE_KVS_REDIS_`.

Update your cache config file `(config/packages/cache.yaml)`:

```yaml file="config/packages/cache.yaml"
framework:
    cache:
        default_redis_provider: 'redis://%env(NINE_KVS_REDIS_USER)%:%env(NINE_KVS_REDIS_PASSWORD)%@%env(NINE_KVS_REDIS_FQDN)%:%env(NINE_KVS_REDIS_PORT)%'
```

If your Redis setup does not require an explicit username configuration, you can alternatively format the provider string like this:

```yaml file="config/packages/cache.yaml"
framework:
    cache:
        default_redis_provider: 'redis://:%env(NINE_KVS_REDIS_PASSWORD)%@%env(NINE_KVS_REDIS_FQDN)%:%env(NINE_KVS_REDIS_PORT)%'
```

If you use a native PHP Redis client (such as PHPRedis) instead of the framework configuration, you no longer need complex JSON-encoding workarounds or URL parsers to handle your connection parameters. You can initialize your connection parameters directly using the individual environment variables:

```php
<?php
$redis = new Redis();

$host = getenv('NINE_KVS_REDIS_FQDN');
$port = (int) getenv('NINE_KVS_REDIS_PORT');
$user = getenv('NINE_KVS_REDIS_USER');
$password = getenv('NINE_KVS_REDIS_PASSWORD');

$redis->connect($host, $port);

if ($password) {
    if ($user) {
        // For Redis setups leveraging modern ACL usernames
        $redis->auth(['user' => $user, 'pass' => $password]);
    } else {
        // Classic password-only authentication
        $redis->auth($password);
    }
}
```

::: tip
Because Deploio automatically handles the heavy lifting by injecting granular environment variables (like `NINE_KVS_REDIS_FQDN` and `NINE_KVS_REDIS_PASSWORD`), you do not need to manage a monolithic `REDIS_URL` string or run custom parsing scripts to separate your connection components.
:::

## Next Steps

Do you need **object storage** for your application? Proceed to the next step.
