---
title: Configuring Your Application
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

### 2. Cockpit (GUI)

The Deploio Cockpit provides a user-friendly interface for configuring your application.

Once the application is created, you can go to the Application page, and use the tabs, and the edit page to configure the application.

The following tabs are available for configuration:

#### Application Tabs

| Tab | Description |
|-----|-------------|
| **Git** | Configure the git repository URL and authentication details for your application |
| **Hosts** | Manage deployment hosts and view DNS configuration records (TXT and CNAME) for your domain registrar |
| **Configuration** | Manage environment variables, build variables, and basic application settings (auth, port, replicas, size). Shows the source of each setting (default or `deploio.yaml`) |
| **Static Egress** | Configure static IP addresses for outbound traffic. [Learn more about static egress](https://docs.nine.ch/docs/managed-kubernetes/nke/static-egress-nke) |
| **Jobs** | View worker and scheduled jobs. For configuration, use [CLI or deploio.yaml](#worker-jobs) |
| **Dockerfile Build** | View build options for Dockerfile-based applications. Configure using `--dockerfile-path` and `--dockerfile-build-context` flags. [Learn more about Dockerfile builds](https://docs.nine.ch/docs/deplo-io/dockerfile-build/) |
| **Logs** | Access real-time application logs |
| **Builds** | Monitor build status and history |
| **Releases** | Track application releases and their status |

#### Edit page

You can also use the `edit` button on the top right of the page to edit the application. 

![Edit button demonstration](/img/edit_button.gif)

Here you can **add** deploy jobs, worker jobs, scheduled jobs, as well as the basic configuration for your application (port, replicas, size, basic auth, etc).

### 3. deploio.yaml

<!-- TODO: add more details here -->

A Git-tracked configuration file that can be stored alongside your application code:

```yaml
# deploio.yaml
size: micro
port: 8080
replicas: 1
env:
  - name: DATABASE_URL
    value: "postgres://user:password@host/db"
workerJobs:
  - name: sidekiq-worker
    command: "bundle exec sidekiq"
    size: standard-2
deployJob:
  - name: migrate
    command: bundle exec rake db:migrate
    retries: 3
    timeout: 5m
```

### 4. Procfile

<!-- TODO: more details to be added here I think... see Davids comments -->

A `Procfile` in your application's root directory declares the processes that make up your application:

```bash
# Procfile
web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq
```
## Configuration Topics

### Environment Variables

Environment variables allow you to customize your application's behavior between environments (e.g. development, staging production) without changing code.

#### Build Variables

Build variables are available **only during the build phase** (i.e., when the container is being created using the Dockerfile or buildpack). They are not available at runtime. 

#### Runtime Variables

Runtime variables are loaded **every time your application boots up**, making them suitable for configuring behavior, authentication, credentials, and other per-environment or per-deploy settings.

These are useful for setting up database connection strings, API keys, and other sensitive information that should not be hard-coded into your application.

#### Configuring Environment Variables

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="nctl" label="nctl">

Environment variables can be configured using the `nctl` CLI tool. In particular, you can use the `--build-env` and `--env` flags to set build and runtime variables, respectively, in the format `--env=KEY=VALUE;...`. Environment variables can be set up during app creation, or when updating the app.

For a brand-new application:

```bash
# Build variables (only during build phase)
nctl create app my-app --build-env=NODE_ENV:"production"

# Runtime variables (loaded at boot)
nctl create app my-app --env=DATABASE_URL:"postgres://user:password@host/db"
```

For an existing application:

```bash
# Build variables (only during build phase)
nctl update app my-app --build-env=NODE_ENV:"production"

# Runtime variables (loaded at boot)
nctl update app my-app --env=DATABASE_URL:"postgres://user:password@host/db"
```

If you are coming from Heroku, you can use the script [here](12_migrating_from_other_platforms.md#retrieving-environment-variables) to retrieve your environment variables in the format required by Deploio.

</TabItem>
<TabItem value="cockpit" label="Cockpit">

You can also configure environment variables in the Cockpit. This is useful for quickly setting up environment variables for your application, and viewing the current environment variables in a more user-friendly way.

You can navigate to your Application page, and then either click on the **Configuration** tab, or the **Edit** button on the top right of the page.

<!-- TODO: insert gif -->

In both cases, the environment variables are split into two sections: **Environment Variables** and **Build Environment Variables**.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

Environment variables can also be configured in the `deploio.yaml` file.

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

</TabItem>
<TabItem value="procfile" label="Procfile">

Environment variables cannot be configured in the Procfile. Please use one of the other methods instead.

</TabItem>
</Tabs>

### Web Application Configuration

There are a number of configuration options for your web application.

#### Basic Authentication

Protect non-production environments with HTTP Basic Auth.

<Tabs>
<TabItem value="nctl" label="nctl">

Basic authentication can be enabled using the `nctl` CLI tool.

```bash
# Enable basic auth
nctl create app my-app --basic-auth

# Get credentials
nctl get app my-app --basic-auth-credentials

# Rotate credentials
nctl update app my-app --change-basic-auth-password
```

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your Application page and click the **Edit** button. Under **Basic Configuration**, you can enable/disable basic authentication.

<!-- TODO: how do I view the credentials from the Cockpit? -->

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
# Enable basic authentication
enableBasicAuth: true
```

</TabItem>
<TabItem value="procfile" label="Procfile">

Basic authentication cannot be configured in the Procfile. Use one of the other methods instead.

</TabItem>
</Tabs>

<!-- TODO: check the below - seems crazy -->
:::note[Note]
Basic authentication credentials can not be edited. Deploio ensures that secure credentials are created and used.
:::

#### Port Configuration

Configure which port your application listens on. Deploio automatically sets a `$PORT` runtime environment variable that your application can use.

<Tabs>
<TabItem value="nctl" label="nctl">

Set the port using the `--port` flag:

```bash
# Set port during app creation
nctl create app my-app --port=3000

# Update port for existing app
nctl update app my-app --port=3000
```

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your Application page and click the **Edit** button. 

Under **Configuration**, you can set the port number.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
# Set the port
port: 3000
```

</TabItem>
<TabItem value="procfile" label="Procfile">

<!-- TODO: do I even need this? What if I don't have `-p` here and just set it through Deploio? -->

The Procfile can use the `$PORT` runtime environment variable that Deploio automatically sets:

```bash
web: bundle exec puma -p $PORT
```

:::note[Note]
The `$PORT` environment variable is automatically set by Deploio at runtime. You don't need to configure it manually.
:::

</TabItem>
</Tabs>

#### Replicas

Configure how many instances of your application should run.

<Tabs>
<TabItem value="nctl" label="nctl">

Set the number of replicas using the `--replicas` flag:

```bash
# Set replicas during app creation
nctl create app my-app --replicas=3

# Update replicas for existing app
nctl update app my-app --replicas=3
```

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your Application page and click the **Edit** button. 

Under **Configuration**, you can set the number of replicas.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
# Set the number of replicas
replicas: 3
```

</TabItem>
<TabItem value="procfile" label="Procfile">

Replicas cannot be configured in the Procfile. Use one of the other methods instead.

</TabItem>
</Tabs>

#### Size

Configure the compute resources allocated to your application. You can view the available sizes and more information [here](04_configuring_your_database.md#machine-type).

<Tabs>
<TabItem value="nctl" label="nctl">

Set the size using the `--size` flag:

```bash
# Set size during app creation
nctl create app my-app --size=standard-2

# Update size for existing app
nctl update app my-app --size=standard-2
```

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your Application page and click the **Edit** button. 

Under **Configuration**, you can select the size from the dropdown menu.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
# Set the size
size: standard-2
```

</TabItem>
<TabItem value="procfile" label="Procfile">

Size cannot be configured in the Procfile. Use one of the other methods instead.

</TabItem>
</Tabs>

### Deployment Jobs

Deployment jobs are a way to run a command before a new release is deployed. This is useful for running database migrations, or other setup tasks. The deployment will only continue if the job finished successfully.

We will see how to configure the extra options using each method, but here is an overview of the options:


| Option                 | Description                                                                                                     | Default   | Limits            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | --------- | ----------------- |
| `--deploy-job-name`    | Name of the deploy job. The deployment will only continue if the job finished successfully.                     | "release" | -                 |
| `--deploy-job-command` | Command to execute before a new release gets deployed. No deploy job will be executed if this is not specified. | -         | -                 |
| `--deploy-job-retries` | How many times the job will be restarted on failure.                                                            | 3         | Max: 5            |
| `--deploy-job-timeout` | Timeout of the job.                                                                                             | 5m        | Min: 1m, Max: 30m |

<Tabs>
<TabItem value="nctl" label="nctl">

```bash
# Create a deployment job (you can also run update app with the same command for an existing app)
nctl create app my-app \
  --deploy-job-name="migrate" \
  --deploy-job-command="rake db:migrate" \
  --deploy-job-retries=3 \
  --deploy-job-timeout=5m
```

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your **Application** page and click the **Edit** button.

Under **Jobs**, you can enable a new **Deploy Job**. This requires a command, which will be executed by a bash shell before a new release is deployed. You also need to specify the number of retries and a timeout.

You can view the jobs in the **Jobs** tab, however configuration must be done via the above, or using another method.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
deployJob:
  name: "database-migration"
  command: "rake db:prepare"
  retries: 3
  timeout: 5m
```

</TabItem>
<TabItem value="procfile" label="Procfile">

Deployment jobs cannot be configured in the Procfile. Use one of the other methods instead.

</TabItem>
</Tabs>

### Worker Jobs

Worker jobs are background processes that run alongside your main application using a job system (sometimes called message queue or job queue). They are useful for handling tasks like processing queues, sending emails, or running scheduled tasks. Worker jobs share the app's image and environment but have a different entry point, e.g., for task scheduling.

:::note[Setting up Worker Jobs]
To set up a worker job, you need to configure both:

- The worker process in your **Procfile** that starts the actual worker server (like Sidekiq, Resque, etc.)
- The **`workerJobs`** configuration in the application configuration (using the Cockpit, `deploio.yaml`, or `nctl`), that tells Deploio which jobs to run.

For example, for setting up Sidekiq:

```bash
# Procfile - starts the Sidekiq server
web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq -e production -C config/sidekiq.yml
```

```yaml
# deploio.yaml - configures how Deploio manages the worker
workerJobs:
  - name: "sidekiq-worker"
    command: "bundle exec sidekiq -e production -C config/sidekiq.yml"
    size: "standard-2"
```

The `Procfile` starts the worker process, and the `workerJobs` configuration ensures it's properly managed by Deploio (resources, monitoring, restarts, etc.).
:::

We will see how to configure the extra options using each method, but here is an overview of the options:


| Option                 | Description                            | Default | Limits                                                             |
| ---------------------- | -------------------------------------- | ------- | ------------------------------------------------------------------ |
| `--worker-job-name`    | Name of the worker job.                | -       | -                                                                  |
| `--worker-job-command` | Command to execute for the worker job. | -       | -                                                                  |
| `--worker-job-size`    | Size of the worker job.                | "micro" | See[available sizes](04_configuring_your_database.md#machine-type) |

<!-- TODO: where do we have sizes for workers? maybe not in here? we should add -->

<Tabs>
<TabItem value="nctl" label="nctl">

```bash
# Create a worker job (works for both create and update app)
nctl create app my-app \
  --worker-job-name="sidekiq" \
  --worker-job-command="bundle exec sidekiq" \
  --worker-job-size="standard-2"
```

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your **Application** page and click the **Edit** button.

Under **Jobs**, you can create multiple **Worker Jobs**. Each job requires a name, a command, and the size of the worker to run the job.

You can view the jobs in the **Jobs** tab, however configuration must be done via the above, or using another method.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
workerJobs:
  - name: "sidekiq"
    command: "bundle exec sidekiq"
    size: "standard-2"
```

</TabItem>
<TabItem value="procfile" label="Procfile">

<!-- TODO: look further into this -->

```bash
# Define worker processes
web: bundle exec puma
worker: bundle exec sidekiq
```

</TabItem>
</Tabs>

### Scheduled Jobs

<Tabs>
<TabItem value="nctl" label="nctl">

```bash
# Create a scheduled job (works for both create and update app)
nctl create app my-app \
  --scheduled-job-command="bundle exec rails runner" \
  --scheduled-job-name=scheduled-1 \
  --scheduled-job-size=micro \
  --scheduled-job-schedule="* * * * *"  
```

These are scheduled using cron syntax. You can see more information about the syntax [here](https://crontab.guru/).

</TabItem>
<TabItem value="cockpit" label="Cockpit">

Navigate to your **Application** page and click the **Edit** button.

Under **Jobs**, you can create multiple **Scheduled Jobs**. Each job requires a name, a command, a sheduel, and the size of the worker to run the job. You can also specify the retries and timeout for the job.

You can view the jobs in the **Jobs** tab, however configuration must be done via the above, or using another method.

</TabItem>
<TabItem value="yaml" label="deploio.yaml">

```yaml
scheduledJobs:
  - command: sleep 60; date
    name: scheduled-1
    retries: 0
    schedule: "*/5 * * * *"
    size: micro
    timeout: 5m0s
```

</TabItem>
<TabItem value="procfile" label="Procfile">

Scheduled jobs cannot be configured in the Procfile. Use one of the other methods instead.

</TabItem>
</Tabs>
