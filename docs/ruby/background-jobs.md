---
prev:
  text: Active Storage
  link: /ruby/active-storage
next:
  text: Continuous Deployment
  link: /ruby/continuous-deployment
description: Instructions for adding background worker jobs to Rails applications using Solid Queue, GoodJob, or Sidekiq, including worker creation, monitoring, and removal.
---

# Setup Background Jobs for your Rails application

Are you using SolidQueue, GoodJob or Sidekiq as your background job backend?
This guide will show you how to set it up on Deploio. 

:::tabs key:job-backend
== Solid Queue

[Solid Queue](https://github.com/rails/solid_queue) is the default Active Job backend since Rails 8.
It stores jobs in your existing PostgreSQL database, so you don't need a separate Redis instance.

### Setup

Add Solid Queue to your application:

```bash
bundle add solid_queue
bin/rails solid_queue:install
```

This generates a configuration file at `config/solid_queue.yml` and a database schema file.

### Single-database configuration

By default, Solid Queue is configured to use a separate database. On Deploio, this works with a
**Business** database (which gives you a full database server), but not with an **Economy** database
(single database).

To run Solid Queue on your existing primary database:

1. Copy the contents of `db/queue_schema.rb` into a new migration:

```bash
bin/rails generate migration CreateSolidQueueTables
```

Paste the table definitions from `db/queue_schema.rb` into the generated migration file.

2. Point Solid Queue to your primary database:

```ruby
# config/environments/production.rb
config.solid_queue.connects_to = { database: { writing: :primary } }
```

3. Run the migration:

```bash
nctl exec app {APP_NAME} -- bundle exec rails db:migrate
```

4. Delete `db/queue_schema.rb` — it is no longer needed.

### Creating the worker

```bash
nctl update app {APP_NAME} \
  --worker-job-command="bin/jobs" \
  --worker-job-name "solid-queue" \
  --worker-job-size micro
```

== GoodJob

[GoodJob](https://github.com/bensheldon/good_job) is a PostgreSQL-based backend. Like Solid Queue,
it stores jobs in your primary database, so no Redis instance is needed.

### Setup

Add GoodJob and run the installer:

```bash
bundle add good_job
bin/rails g good_job:install
bin/rails db:migrate
```

Configure your application to use GoodJob in `config/environments/production.rb`:

```ruby
config.active_job.queue_adapter = :good_job
```

### Creating the worker

```bash
nctl update app {APP_NAME} \
  --worker-job-command="bundle exec good_job start" \
  --worker-job-name "good-job" \
  --worker-job-size micro
```

== Sidekiq

[Sidekiq](https://sidekiq.org) uses Redis to store job data. If you haven't set up a key-value
store yet, follow the [Key Value Storage guide](./key-value-storage.md) first.

### Setup

Add `sidekiq` to your `Gemfile`:

```ruby
gem "sidekiq"
```

Configure Sidekiq to use `REDIS_URL` in `config/initializers/sidekiq.rb`:

```ruby
Sidekiq.configure_server do |config|
  config.redis = { url: ENV["REDIS_URL"], ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV["REDIS_URL"], ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE } }
end
```

Set Active Job to use Sidekiq in `config/environments/production.rb`:

```ruby
config.active_job.queue_adapter = :sidekiq
```

### Creating the worker

```bash
nctl update app {APP_NAME} \
  --worker-job-command="bundle exec sidekiq -C config/sidekiq.yml" \
  --worker-job-name "sidekiq" \
  --worker-job-size micro
```

:::

## Observing a Worker

The worker's logs are aggregated with the application logs. You can view all the logs using the `nctl logs` command.
If you wish to only view the logs for the worker, you can filter the logs using the `-t, --type` flag:

```bash
nctl logs app {APP_NAME} -t worker_job
```

## Removing a Worker

Should you wish to remove a worker from a running application, you can use the `nctl update app` command:

```bash
nctl update app {APP_NAME} --delete-worker-job={worker_job_name}
```

## Next Steps

Do you need to **configure Continuous Deployment**? Proceed to the [next step](./continuous-deployment.md).
