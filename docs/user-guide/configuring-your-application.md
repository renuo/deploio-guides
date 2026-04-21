---
prev:
  text: Code Repository Setup
  link: /user-guide/code-repository-setup
next:
  text: Configuring Your Database
  link: /user-guide/configuring-your-database
description: Complete reference for configuring applications on Deploio including environment variables, deploio.yaml, Procfile, worker jobs, deploy jobs, and resource sizing.
---

# Configuring Your Application

Your application isn't just about the code — it's also about how it runs. This section covers the essential configurations that define its behaviour, from environment variables and deployment files, to worker processes and background jobs.

Here, you'll learn how to set up and fine-tune your app's internal mechanics to ensure
smooth operation.

## Configuration Methods

Deploio provides multiple ways to configure your application:

### 1. nctl (CLI)

Using the `nctl` CLI tool, you can configure your application through commands. This is ideal for automation and scripting, for example retrieving environment variables from your current platform, and applying them at application creation.

```bash
# Example: Creating an app with configuration
nctl create app my-app --project my-project \
  --env=DATABASE_URL:"postgres://user:password@host/db" \
  --build-env=NODE_ENV:"production" \
  --port=3000 \
  --basic-auth
```

::: info
`app` is short for `application`. `nctl` also works if you use the long name `nctl create application my-app ...`.
:::

### 2. Cockpit (GUI)

The Deploio Cockpit provides a user-friendly interface for configuring your application.

Once the application is created, you can go to the Application page, and use the tabs, and the edit page to configure the application.

The following tabs are available for configuration:

#### Application Tabs


| Tab                  | Description                                                                                                                                                                                                                 |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Git**              | Configure the git repository URL and authentication details for your application                                                                                                                                            |
| **Hosts**            | Manage deployment hosts and view DNS configuration records (TXT and CNAME) for your domain registrar                                                                                                                        |
| **Configuration**    | Manage environment variables, build variables, and basic application settings (auth, port, replicas, size). Shows the source of each setting (default or `.deploio.yaml`)                                                     |
| **Static Egress**    | Configure static IP addresses for outbound traffic.[Learn more about static egress](https://docs.nine.ch/docs/managed-kubernetes/nke/static-egress-nke/)                                                                    |
| **Jobs**             | View worker and scheduled jobs. For configuration, use [CLI or deploio.yaml](#worker-jobs)                                                                                                                                   |
| **Dockerfile Build** | View build options for Dockerfile-based applications. Configure using `--dockerfile-path` and `--dockerfile-build-context` flags. [Learn more about Dockerfile builds](https://docs.nine.ch/docs/deplo-io/dockerfile-build/) |
| **Logs**             | Access real-time application logs                                                                                                                                                                                           |
| **Metrics**          | Access app container metrics (memory & CPU usage)                                                                                                                                                                   |
| **Builds**           | Monitor build status and history                                                                                                                                                                                            |
| **Releases**         | Track application releases and their status                                                                                                                                                                                 |

#### Edit page

You can also use the `edit` button on the top right of the page to edit the application.

![Edit button demonstration](/img/edit_button.gif)

Here you can **add** a deploy job, worker jobs, scheduled jobs, as well as the basic configuration for your application (port, replicas, size, basic auth, etc).

### 3. `.deploio.yaml`

A Git-tracked configuration file that can be stored alongside your application code.
It will be read by the build system when building the application.

This allows you to have all the configuration in one YAML file, and not have to use the CLI or Cockpit to configure your application.

The `.deploio.yaml` file specifies the default values. If you overwrite a setting in the admin GUI or command line, they take precedence over the defaults from the file.

You can use this file to:

- [Define default environment variables](#environment-variables)
- [Enable basic authentication](#basic-authentication)
- [Set application configuration (e.g. size, port, replicas)](#web-application-configuration)
- [Set up a deploy job](#deploy-job)
- [Define background jobs (workers)](#worker-jobs)
- [Define scheduled jobs (cron jobs)](#scheduled-jobs)

Below is an example of a `.deploio.yaml` file. You can see an up-to-date list of fields that can be used in the [API docs](https://docs.nine.ch/api/#tag/ProjectConfig/operation/createAppsNineChV1alpha1NamespacedProjectConfig).

```yaml
# Application size (micro, mini, standard-1, standard-2, standard-4)
size: micro
# Port the app is listening on.
port: 8080
## Sets the amount of replicas of the running app.
replicas: 1
# Env variables which are passed to the app at runtime.
env:
  - name: RESPONSE_TEXT
    value: "Hello from a Deploio app!"
# enables basic authentication for the application - recommended to protect applications that are not yet productive
enableBasicAuth: true
# A job that runs before a new release gets deployed.
deployJob:
  name: "hello"
  command: echo "Hello from a Deploio app!
# A job that runs in the background non-stop.
workerJobs:
  - name: "sidekiq-worker"
    command: "bundle exec sidekiq -e production -C config/sidekiq.yml"
# A job that is set to run at specific times.
scheduledJobs:
  - name: "daily-backup"
    schedule: "0 3 * * *"
    command: /app/backup.sh
```

### 4. Procfile

::: warning Procfile Limitations
Deploio only supports the `web` process type in Procfile. The `worker` and `release` process types are not supported. We strongly recommend using `.deploio.yaml` instead, which provides full support for all process types including:
- Web processes
- Worker jobs
- Deploy jobs
- Scheduled jobs

For local development, you can use `Procfile.dev` to maintain your development environment configuration.
:::

A Procfile is a simple text file that specifies the commands that should be executed to start your application. Each line in the Procfile follows the format:

```
<process type>: <command>
```

#### Process Types

- `web`: The main web process that handles HTTP requests. This is the only process type supported in Procfile.
- `worker`: Not supported in Procfile. Use `.deploio.yaml` to configure worker jobs instead.
- `release`: Not supported in Procfile. Use `.deploio.yaml` to configure deploy jobs instead.

#### Example

```
web: bundle exec puma -C config/puma.rb
```

A number of configuration options use the cron syntax. You can see more information about the syntax [here](https://crontab.guru/).

### 5. project.toml

Deploio supports the [`project.toml`](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/use-project-toml/) file to configure buildpacks (both the _Paketo_ and _Heroku_ ones). This file is part of the Cloud Native Buildpacks specification and allows you to control which files are included or excluded during the build process.

This is useful when your repository contains files that would cause Deploio to auto-detect an unwanted buildpack. For example, if Node.js is only used for development purposes (linting, formatting) but not in production, you can exclude `package.json` and `package-lock.json` to prevent Deploio from adding the Node.js buildpack:

```toml
[_]
schema-version = "0.2"

[io.buildpacks]
exclude = [
  "/package-lock.json",
  "/package.json",
]
```

See the [Cloud Native Buildpacks documentation](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/use-project-toml/) for the full list of available options.

## Configuration Topics

### Process Failure Handling

Deploio automatically handles process failures for both web and worker processes:

- If a process crashes or becomes unreachable on its specified port, Deploio will automatically attempt to restart it
- A back-off strategy is implemented, which increases the time between restart attempts until it eventually gives up
- This applies to both web and worker processes

### Environment Variables

Environment variables allow you to customize your application's behavior between environments (e.g. development, staging, production) without changing code.

#### Build Variables

Build variables are available **only during the build phase** (i.e., when the container is being created using the Dockerfile or buildpack). They are not available at runtime.

These are useful for tools like Webpack, Babel, or asset precompilation that may require certain environment variables to be set during the build process.

#### Runtime Variables

Runtime variables are loaded **every time your application boots up**, making them suitable for configuring behavior, authentication, credentials, and other per-environment or per-deploy settings.

These are useful for setting up database connection strings, API keys, and other sensitive information that should not be hard-coded into your application.

#### Configuring Environment Variables

:::tabs key:config
== nctl

Environment variables can be configured using the `nctl` CLI tool. In particular, you can use the `--build-env` and `--env` flags to set build and runtime variables, respectively, in the format `--env=KEY=VALUE;...`. Environment variables can be set up during app creation, or when updating the app.

For a brand-new application:

```bash
# Build variables (only during build phase)
nctl create app my-app --build-env=NODE_ENV:"production";SENTRY_AUTH_TOKEN:"xyz123"

# Runtime variables (loaded at boot)
nctl create app my-app --env=DATABASE_URL:"postgres://user:password@host/db";REDIS_URL:"redis://host";SECRET_KEY_BASE:"abc123"
```

For an existing application:

```bash
# Build variables (only during build phase)
nctl update app my-app --build-env=NODE_ENV:"production";SENTRY_AUTH_TOKEN:"xyz123"

# Runtime variables (loaded at boot)
nctl update app my-app --env=DATABASE_URL:"postgres://user:password@host/db";REDIS_URL:"redis://host";SECRET_KEY_BASE:"abc123"
```

If you are coming from Heroku, you can use the script [here](migrating-from-other-platforms.md#retrieving-environment-variables) to retrieve your environment variables in the format required by Deploio.

== Cockpit

You can also configure environment variables in the Cockpit. This is useful for quickly setting up environment variables for your application, and viewing the current environment variables in a more user-friendly way.

You can navigate to your **Application** page, and then either click on the **Configuration** tab, or the **Edit** button on the top right of the page.

In both cases, the environment variables are split into two sections: **Environment Variables** and **Build Environment Variables**.

Here you can add, edit, or delete environment variables, as well as edit in a YAML format.

== .deploio.yaml

Environment variables can also be configured in the `.deploio.yaml` file. However, the settings specified directly in the application configuration will take precedence over the settings in the `.deploio.yaml` file.

```yaml
# Build variables
buildEnv:
  - name: NODE_ENV
    value: "production"

# Runtime variables
env:
  - name: DATABASE_URL
    value: "postgres://user:password@host/db"
```

== Procfile

Environment variables cannot be configured in the Procfile. Please use one of the other methods instead.

:::

### Basic Authentication

Protect non-production environments (like staging) with HTTP Basic Auth, configurable directly in the Cockpit and built in to Deploio.

::: info Basic Auth Implementation
Basic auth credentials are generated and managed by Deploio's controllers. The password is stored as a Kubernetes secret and referenced by the ingress configuration. You cannot set the password manually, but you can rotate it as frequently as needed using the `--change-basic-auth-password` command.
:::

:::tabs key:config
== nctl

Basic authentication can be enabled using the `nctl` CLI tool.

```bash
# Enable basic auth (you can also run update app with the same command)
nctl create app my-app --basic-auth

# Get credentials
nctl get app my-app --basic-auth-credentials

# Rotate credentials
nctl update app my-app --change-basic-auth-password
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Configuration**, you can enable/disable basic authentication.

Once enabled, you can also get the credentials by clicking the **Show** button on the **Application** page.

== .deploio.yaml

As noted previously, any configuration set in the Cockpit or `nctl` will take precedence over the configuration in `.deploio.yaml`.

```yaml
# Enable basic authentication
enableBasicAuth: true
```

== Procfile

Basic authentication cannot be configured in the Procfile. Use one of the other methods instead.

:::

### Web Application Configuration

There are a number of configuration options for your web application.

#### Port Configuration

Your application needs to expose a TCP/IP port to handle HTTP requests. The port configuration works as follows:

1. **Application Level**:
   - Your application will use a default port (e.g., in Rails this is port 3000 for Puma or 8080 for the buildpack default)
   - You can configure this in your application (e.g., in Rails you can set this in `config/puma.rb`)
   - If configured, the application will use this port
   - If not configured, the application will use the `PORT` environment variable

2. **Deploio Level**:
   - You can only configure the `PORT` environment variable
   - This can be done either via `--port` in nctl or through runtime environment variables in Cockpit
   - The actual port your application listens on internally is determined by your application's configuration

3. **External Access**:
   - All Deploio applications are accessible externally only on port 443 (HTTPS)
   - This is handled by Deploio's ingress-nginx layer
   - The ingress layer routes traffic based on the HTTP host header to the correct internal service
   - No other external ports are supported

::: info Port Configuration Best Practices
The recommended approach is to let your application use its default port (e.g., 3000 for Rails/Puma) and configure the `PORT` environment variable in Deploio if you need to change it. The internal port configuration is abstracted away from end users, as all external access is handled through HTTPS on port 443.
:::

:::tabs key:config
== nctl

Set the internal port using the `--port` flag:

```bash
# Set port during app creation
nctl create app my-app --port=3000

# Update port for existing app
nctl update app my-app --port=3000
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Configuration**, you can set the port number.

== .deploio.yaml

```yaml
# Set the internal port
port: 3000
```

== Procfile

Port cannot be configured in the Procfile. Use one of the other methods instead.

:::

#### Replicas

Configure how many instances of your application should run.

:::tabs key:config
== nctl

Set the number of replicas using the `--replicas` flag:

```bash
# Set replicas during app creation
nctl create app my-app --replicas=3

# Update replicas for existing app
nctl update app my-app --replicas=3
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Configuration**, you can set the number of replicas.

== .deploio.yaml

```yaml
# Set the number of replicas
replicas: 3
```

== Procfile

Replicas cannot be configured in the Procfile. Use one of the other methods instead.

:::

#### Size

Configure the compute resources allocated to your application. You can view the available sizes and more information [here](#resource-sizing).

:::tabs key:config
== nctl

Set the size using the `--size` flag:

```bash
# Set size during app creation
nctl create app my-app --size=standard-2

# Update size for existing app
nctl update app my-app --size=standard-2
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Configuration**, you can select the size from the dropdown menu.

== .deploio.yaml

```yaml
# Set the size
size: standard-2
```

== Procfile

Size cannot be configured in the Procfile. Use one of the other methods instead.

:::

### Resource Sizing

Each Deploio app, along with its corresponding jobs (for example, deploy or worker job), receives a standard amount of resources (RAM, CPU and Ephemeral Storage) when it is run. These resources are assigned individually and are not shared. If the app's or job's resource usage exceeds its standard limit, Nine reserves the right to terminate the app.

Every replica will get the documented amount of resources. Meaning, the amount of resources is not shared between replicas.

#### Available Sizes

| Size       | Standard RAM | CPU     | Ephemeral Storage |
|------------|--------------|---------|-------------------|
| micro      | 256 MiB      | ⅛ Core  | 2 GiB             |
| mini       | 512 MiB      | ¼ Core  | 2 GiB             |
| standard-1 | 1 GiB        | ½ Core  | 2 GiB             |
| standard-2 | 2 GiB        | ¾ Core  | 2 GiB             |
| standard-4 | 4 GiB        | 1 ½ Core | 2 GiB             |

Prices for each Deploio instance size can be found on the [pricing page](https://deplo.io/pricing).

### Deploy Job

A Deploy Job is a way to run a command before a new release is deployed. This is useful for running database migrations, or other setup tasks. The deployment will only continue if the job finished successfully.

::: info Where Deploy Jobs Run
Deploy jobs run on the same server as your application, using the same resources and environment. They are executed during the deployment process, before the new version of your application is started. This means they share the same compute resources (CPU, memory) as defined by your application's size.
:::

#### Configuration

We will see how to configure the extra options using each method, but here is an overview of the options:

| Option                 | Description                                                                                                     | Default    | Limits            |
|------------------------|-----------------------------------------------------------------------------------------------------------------|------------|-------------------|
| `--deploy-job-name`    | Name of the deploy job. The deployment will only continue if the job finished successfully.                     | (required) | -                 |
| `--deploy-job-command` | Command to execute before a new release gets deployed. No deploy job will be executed if this is not specified. | (required) | -                 |
| `--deploy-job-retries` | How many times the job will be restarted on failure.                                                            | 3          | Max: 5            |
| `--deploy-job-timeout` | Timeout of the job.                                                                                             | 5m         | Min: 1m, Max: 30m |

:::tabs key:config
== nctl

```bash
# Create a deploy job (you can also run update app with the same command for an existing app)
nctl create app my-app \
  --deploy-job-name="migrate" \
  --deploy-job-command="rake db:migrate" \
  --deploy-job-retries=3 \
  --deploy-job-timeout=5m
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Jobs**, you can enable a new **Deploy Job**. This requires a command, which will be executed by a bash shell before a new release is deployed. You also need to specify the number of retries and a timeout.

== .deploio.yaml

```yaml
deployJob:
  name: "database-migration"
  command: "rake db:prepare"
  retries: 3
  timeout: 5m
```

== Procfile

Deploy job cannot be configured in the Procfile. Use one of the other methods instead.

:::

#### Monitoring

:::tabs key:config
== nctl

If a deploy job fails, the associated release will be set to failed and the previous release will continue to run if there was one to begin with. To see the detailed status of a deploy job you can get the full release:

```bash
$ nctl get releases my-app -o yaml
[...]
status:
  atProvider:
    deployJobStatus:
      exitTime: 2023-07-18T11:01:47Z
      name: my-app-deploy-job
      reason: backoffLimitExceeded
      startTime: 2023-07-18T11:00:58Z
      status: failed
    releaseStatus: failure
```

At the bottom of the release you can see the status and it will show in detail when and how a deploy job failed. In addition to the status, the deploy job's log will be written to the normal app log and can be accessed using the `nctl logs app` command.

== Cockpit

You can view the **Deploy Job** in the **Jobs** tab. In this tab, you can view the configuration and the status of the job.

== .deploio.yaml

Deploy jobs can only be monitored in the Cockpit or via the `nctl` command.

== Procfile

Deploy jobs can only be monitored in the Cockpit or via the `nctl` command.

:::

### Worker Jobs

Worker jobs are background processes that run alongside your main application using a job system (sometimes called message queue or job queue). They are useful for handling tasks like processing queues, sending emails, or running scheduled tasks. Worker jobs share the app's image and environment but have a different entry point, e.g., for task scheduling.

::: info Where Worker Jobs Run
Worker jobs run on their own dedicated server, separate from your main application. This means they can be scaled independently and have their own resource allocation. You can configure the size of each worker job to match its resource needs, which can be different from your main application's size. See the [Resource Sizing](#resource-sizing) section for available sizes and their specifications.
:::

#### Configuration

We will see how to configure the extra options using each method, but here is an overview of the options:

| Option                 | Description                            | Default    | Limits                                                      |
|------------------------|----------------------------------------|------------|-------------------------------------------------------------|
| `--worker-job-name`    | Name of the worker job.                | (required) | -                                                           |
| `--worker-job-command` | Command to execute for the worker job. | (required) | -                                                           |
| `--worker-job-size`    | Size of the worker job.                | "micro"    | See [Resource Sizing](#resource-sizing) for available sizes |

:::tabs key:config
== nctl

```bash
# Create a worker job (works for both create and update app)
nctl create app my-app \
  --worker-job-name="sidekiq" \
  --worker-job-command="bundle exec sidekiq" \
  --worker-job-size="standard-2"
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Jobs**, you can create multiple **Worker Jobs**. Each job requires a name, a command, and the size of the worker to run the job.

== .deploio.yaml

```yaml
workerJobs:
  - name: "sidekiq"
    command: "bundle exec sidekiq"
    size: "standard-2"
```

== Procfile

Worker jobs cannot be configured in the Procfile. Use one of the other methods instead.

:::

#### Monitoring

:::tabs key:config
== nctl

The simplest way to view the status of a worker job with `nctl` is to use the `-o stats` command:

```bash
$ nctl get app my-app -o stats
```

Additionally, the logs of the worker jobs can be accessed by viewing the app logs using the `nctl logs app` command.

== Cockpit

You can view the **Worker Jobs** in the **Jobs** tab. In this tab, you can view the configuration and the status of the jobs.

== .deploio.yaml

Worker jobs can only be monitored in the Cockpit or via the `nctl` command.

== Procfile

Worker jobs can only be monitored in the Cockpit or via the `nctl` command.

:::

### Scheduled Jobs

Scheduled jobs are commands that run at regular intervals based on a predefined schedule. They are useful for tasks like database cleanup, sending reports, or any other recurring tasks.

::: info Where Scheduled Jobs Run
Scheduled jobs run on their own dedicated server, similar to worker jobs. Each scheduled job can be configured with its own size to match its resource requirements. The jobs are executed according to their schedule, and each execution runs in an isolated environment to prevent interference with other jobs or your main application. See the [Resource Sizing](#resource-sizing) section for available sizes and their specifications.
:::

#### Configuration

We will see how to configure the extra options using each method, but here is an overview of the options:

| Option                     | Description                               | Default                    | Limits                                                      |
|----------------------------|-------------------------------------------|----------------------------|-------------------------------------------------------------|
| `--scheduled-job-name`     | Name of the scheduled job.                | (required)                 | -                                                           |
| `--scheduled-job-command`  | Command to execute for the scheduled job. | (required)                 | -                                                           |
| `--scheduled-job-schedule` | Cron schedule for the job.                | `* * * * *` (every minute) | -                                                           |
| `--scheduled-job-size`     | Size of the scheduled job.                | "micro"                    | See [Resource Sizing](#resource-sizing) for available sizes |

:::tabs key:config
== nctl

```bash
# Create a scheduled job (works for both create and update app)
nctl create app my-app \
  --scheduled-job-command="bundle exec rails runner" \
  --scheduled-job-name=scheduled-1 \
  --scheduled-job-size=micro \
  --scheduled-job-schedule="* * * * *"
```

== Cockpit

Navigate to your **Application** page and click the **Edit** button.

Under **Jobs**, you can create multiple **Scheduled Jobs**. Each job requires a name, a command, a schedule, and the size of the worker to run the job. You can also specify the retries and timeout for the job.

== .deploio.yaml

```yaml
scheduledJobs:
  - command: sleep 60; date
    name: scheduled-1
    retries: 0
    schedule: "*/5 * * * *"
    size: micro
    timeout: 5m0s
```

== Procfile

Scheduled jobs cannot be configured in the Procfile. Use one of the other methods instead.

:::

#### Monitoring

If a scheduled job fails, the associated release will NOT be set to failed and continue running.

:::tabs key:config
== nctl

To see the detailed status of a scheduled job you can get the full release:

```bash
$ nctl get releases my-app -o yaml
[...]
status:
  atProvider:
    scheduledJobStatus:
    - name: scheduled-1
      replicaObservation:
      - replicaName: go-scheduled-scheduled-1-29038220
        status: succeeded
```

At the bottom of the release you can see the status and it will show in detail the status of the scheduled job. In addition to the status, the scheduled job's log will be written to the normal app log and can be accessed using the `nctl logs app` command.

== Cockpit

You can view the **Scheduled Jobs** in the **Jobs** tab. In this tab, you can view the configuration and the status of the jobs.

In addition to the status, the scheduled job's log will be written to the normal app log and can be viewed in the **Logs** tab.

== .deploio.yaml

Scheduled jobs can only be monitored in the Cockpit or via the `nctl` command.

== Procfile

Scheduled jobs can only be monitored in the Cockpit or via the `nctl` command.

:::
