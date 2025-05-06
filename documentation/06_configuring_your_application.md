---
title: Configuring Your Application
---

# Configuring Your Application

Your application isn't just about the code — it’s also about how it runs. This section covers the essential configurations that define its behavior, from environment variables and deployment files, to worker processes and background jobs. 

Here, you'll learn how to set up and fine-tune your app’s internal mechanics to ensure smooth operation.

## Environment Variables

Environment variables allow you to customize your application's behavior between environments (e.g. development, staging, production) without changing code.

#### Build Variables

Build variables are available **only during the build phase** (i.e., when the container is being created using the Dockerfile or buildpack). They are not available at runtime. 

These are useful for tools like Webpack, Babel, or asset precompilation that may require certain environment variables to be set during the build process.

The environment variables can be set in the Cockpit under **Application → Configuration**, and then under the **Build Environment Variables** section.

These can also be set via the CLI using the `--build-env` flag in the format `--build-env=KEY=VALUE;...`. This can be set during app creation, or when updating the app.

For a brand-new application:

```bash
nctl create app my-app --project my-project \
  --build-env=NODE_ENV:"production";SENTRY_AUTH_TOKEN:"xyz123"
```

For an existing application:

```bash
nctl update app my-app --project my-project \
  --build-env=NODE_ENV:"production";SENTRY_AUTH_TOKEN:"xyz123"
```

##### Runtime Variables

Runtime variables are loaded **every time your application boots up**, making them suitable for configuring behavior, authentication, credentials, and other per-environment or per-deploy settings.

These are useful for setting up database connection strings, API keys, and other sensitive information that should not be hard-coded into your application.

The environment variables can be set in the Cockpit under **Application → Configuration**, and then under the **Environment Variables** section.

These can also be set via the CLI using the `--env` flag in the format `--env=KEY=VALUE;...`. This can be set during app creation, or when updating the app, similarly to the above.

For a brand-new application:

```bash
nctl create app my-app --project my-project \
  --env=DATABASE_URL:"postgres://user:password@host/db";REDIS_URL:"redis://host";SECRET_KEY_BASE:"abc123"
```

For an existing application:

```bash
nctl update app my-app --project my-project \
  --env=DATABASE_URL:"postgres://user:password@host/db";REDIS_URL:"redis://host";SECRET_KEY_BASE:"abc123"
```

## Configuration Files

##### Procfile

Used to declare and configure the processes that make up your application. This is where you define how your application's processes should run, including web servers, background workers, and other processes.

This will differ from project to project, however an example could be:
```bash
web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq
```

> Each line in the Procfile defines a process type and the command to run it. The process type is used by Deploio to manage and scale your application.

##### deploio.yaml

A Git-tracked configuration file used to configure your application. It can be stored alongside your application code, and will be read by the build system when building the application.

You can use this file to: 

- Set application configuration (e.g. size, port, replicas)
- Define environment variables
- Enable basic authentication
- Set up deploy jobs
- Define background jobs (workers)
- Define scheduled jobs (cron jobs)

Any settings specified directly in the application configuration takes precedence over this file. 

```yaml
# Application size (micro, mini, standard-1, standard-2)
size: micro
# Port the app is listening on.
port: 8080
## Sets the amount of replicas of the running app.
replicas: 1
# Env variables which are passed to the app at runtime.
env:
  - name: RESPONSE_TEXT
    value: "Hello from a Go Deploio app!"
# enables basic authentication for the application
enableBasicAuth: true
# A job that runs before a new release gets deployed.
deployJob:
  name: "hello-go"
  command: echo "Hello from a Go Deploio app!
# A job that runs in the background non-stop.
workerJobs:
  - name: sidekiq-worker
    command: "bundle exec sidekiq -e production -C config/sidekiq.yml"
    size: standard-2
# A job that is set to run at specific times.
scheduledJobs:
  - name: "daily-backup"
    schedule: "0 3 * * *"
    command: /app/backup.sh
```

You can read more information in the [Nine documentation](https://docs.nine.ch/docs/deplo-io/configuration/deploio-configuration-layers#git-configuration-via-yaml-file) and view the fields that can be used in the `.deploio.yaml` in the [API docs](https://docs.nine.ch/api/#tag/ProjectConfig/operation/createAppsNineChV1alpha1NamespacedProjectConfig).

## Web Applications

##### Basic Authentication

Protect non-production environments (like staging) with HTTP Basic Auth, configurable directly in the Cockpit and built in to Deploio.

You can enable basic authentication using the `--basic-auth` flag:

```bash
nctl create app my-app --basic-auth
```

or disable with:

```bash
nctl update app my-app --basic-auth=false
```

Once enabled, you can use the `--basic-auth-credentials` flag to show the username and password for your application:

```bash
nctl get app my-app --basic-auth-credentials
```

To rotate the credentials for basic authentication you can use:

```bash
nctl update app my-app --change-basic-auth-password
```

##### Routing

In most cases, you do not need to change the default port that Deploio chooses for your application. The chosen port will be injected as the env variable `$PORT` to the application at **runtime**. So in any case, for compiled languages you have to make sure the app is listening on the port defined in that env variable. For other languages such as Ruby, PHP, Node.js or Python this will be automatically taken care of.

However, you can change this by using the `--port` flag when creating or updating your application, or by defining this in the `deploio.yaml` file:

```yaml
web:
  port: 3000
```

This tells Deploio to expose your app's internal port 3000 to the outside world.

## Worker Jobs

##### Job systems

You can run background tasks for your application using a job system. Deploio supports a variety of job systems, including:

- **Sidekiq**: A popular background job processing library for Ruby applications.
- **Resque**: A Redis-backed library for creating background jobs.
- **Delayed Job**: A simple background job processing library for Ruby.
- **RabbitMQ**: A message broker that can be used for background job processing.
- **Celery**: A distributed task queue for Python applications.
- **Bull**: A Redis-based queue system for Node.js applications.
- **RQ**: A simple Python library for queueing jobs and processing them in the background with workers.
- **Beanstalkd**: A simple, fast work queue.
- **Kue**: A priority job queue for Node.js backed by Redis.
- **and many more**

These can be configured in the `deploio.yaml` file, as highlighted earlier in the [deploio.yaml section](#deploioyaml).

```yaml
You need to define them in the `Procfile`, or you can use the `deploio.yaml` file.

[//]: # (TODO: show example here)

## Deployment Jobs

##### Setup

Deployment jobs are scripts that run during app deploys. They are useful for running database migrations, clearing caches, or any other tasks that needs to run **before** a new release gets deployed.

You can specify a deploy job when creating an application by using various related flags on the `nctl create` or `nctl update` command:

```bash
--deploy-job-command="rake db:prepare"       Command to execute before a new release gets deployed. No deploy job will be executed
                                             if this is not specified.
--deploy-job-name="release"                  Name of the deploy job. The deployment will only continue if the job finished successfully.
--deploy-job-retries=3                       How many times the job will be restarted on failure. Default is 3 and maximum 5.
--deploy-job-timeout=5m                      Timeout of the job. Default is 5m, minimum is 1 minute and maximum is 30 minutes.

$ nctl create app --deploy-job-command="rake db:prepare"
```

These could also be defined in the `deploio.yaml` file:

```yaml
deployJob:
  - name: migrate
    command: bundle exec rake db:migrate
    retries: 3
    timeout: 5m
```

:::note[Note]
The rollout of the release only continues if the deploy jobs are finished successfully
:::

##### Monitoring

[//]: # (TODO: test this)

You can view the status of a deploy job using:

```bash
nctl get releases my-app --project my-project -o yaml
```

This will output the status of the release, including the status of the deploy job and any error that may have occurred.

```bash
[...]
status:
  atProvider:
    deployJobStatus:
      exitTime: 2023-07-18T11:01:47Z
      name: name
      reason: backoffLimitExceeded
      startTime: 2023-07-18T11:00:58Z
      status: failed
    releaseStatus: failure
```

## Other Flags

Many configuration flags have been referenced in this guide. We would recommend that you read through the available flags and their usages by running `nctl create app -h`. This way you can decide what configuration you need to set before creating your application.
