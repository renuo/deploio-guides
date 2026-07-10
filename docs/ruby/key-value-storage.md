---
prev:
  text: Database
  link: /ruby/database
next:
  text: Active Storage
  link: /ruby/active-storage
description: Guide for setting up Redis-compatible key-value stores for Rails applications to support caching and background job systems like Sidekiq.
---

# Create a Key Value Store for your Ruby on Rails application

::: info
Are you using Sidekiq? Or ActionCable with Redis? Deploio offers a managed Redis-compatible key-value store.
This guide describes how you can set it up. You can see the different tiers and pricing [here](/user-guide/other-dependencies.md#key-value-store).
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

## Configure Rails

Add the `redis` gem to your `Gemfile` if it's not already present:

```ruby
gem "redis"
```

Deploio KVS instances use self-signed TLS certificates. You need to disable certificate
verification in every Redis connection by passing `ssl_params`. Since the reference name used in the binding step was `redis`, your injected variables are prefixed with `NINE_KVS_REDIS_`.

### Sidekiq

If you're using Sidekiq, construct the Redis connection URL using your injected variables. Create or update
`config/initializers/sidekiq.rb`:

```ruby
redis_url = "redis://#{ENV['NINE_KVS_REDIS_USER']}:#{ENV['NINE_KVS_REDIS_PASSWORD']}@#{ENV['NINE_KVS_REDIS_FQDN']}:#{ENV['NINE_KVS_REDIS_PORT']}"

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
end
```

Then add a worker for Sidekiq as described in the [Background Jobs guide](./background-jobs.md):

```bash
nctl update app {APP_NAME} \
  --worker-job-command="bundle exec sidekiq -C config/sidekiq.yml" \
  --worker-job-name "sidekiq" \
  --worker-job-size micro
```

### ActionCable

To use ActionCable with Redis, construct the URL string directly in your `config/cable.yml`:

```yaml
production:
  adapter: redis
  url: redis://<%= ENV["NINE_KVS_REDIS_USER"] %>:<%= ENV["NINE_KVS_REDIS_PASSWORD"] %>@<%= ENV["NINE_KVS_REDIS_FQDN"] %>:<%= ENV["NINE_KVS_REDIS_PORT"] %>
  ssl_params:
    verify_mode: <%= OpenSSL::SSL::VERIFY_NONE %>
```

### Cache Store

To use Redis as the Rails cache store, add the following connection configuration to `config/environments/production.rb`:

```ruby
redis_url = "redis://#{ENV['NINE_KVS_REDIS_USER']}:#{ENV['NINE_KVS_REDIS_PASSWORD']}@#{ENV['NINE_KVS_REDIS_FQDN']}:#{ENV['NINE_KVS_REDIS_PORT']}"
config.cache_store = :redis_cache_store, { url: redis_url, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
```

## Verify the Connection

You can verify that your application can reach the key-value store by running a quick check
via `nctl exec`:

```bash
nctl exec app {APP_NAME} -- bundle exec rails runner \
  "r = Redis.new(host: ENV['NINE_KVS_REDIS_FQDN'], port: ENV['NINE_KVS_REDIS_PORT'], username: ENV['NINE_KVS_REDIS_USER'], password: ENV['NINE_KVS_REDIS_PASSWORD'], ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }); r.set('ping', 'pong'); puts r.get('ping')"
```

If the connection is working, this prints `pong`.

You can read more about KVS configuration in the
[technical reference](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store/).

## Next Steps

Do you need **object storage** for your application? Proceed to the next step.
