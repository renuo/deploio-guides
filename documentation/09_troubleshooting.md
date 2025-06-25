---
title: Troubleshooting
---

# Troubleshooting

Should you have an emergency with your application, we have a few tools and guides to help you get back on track.

##### Activity logs
### Activity logs

##### Where does it run? DNS
You can view the logs via `nctl` or the Cockpit. To view **all** logs of an application, including logs from all of the components listed below, you can run:

```bash
nctl logs app {APP_NAME}
```

You can also add the `--follow` or `-f` flag to tail the logs for the application.

To get more lines, add the `--lines` or `-l` flag e.g. `-l 1000`.

To go further back in time, use to `--since` or `-s` flag. Durations can be specified using 1s (1 second), 1m (1 minute) and 1h (1 hour) e.g. `-s 48h`.

##### There are various components of Deploio that can emit logs:

<details>
<summary>Build Logs</summary>

These are logs produced by the build process. Useful if there's an issue with building your app.

You can view all build logs of an application using:
```bash
nctl logs app {APP_NAME} --type build
```

Alternatively, you can view the logs of a specific build using:
```bash
nctl logs build {BUILD_NAME}
```
</details>

<details>
<summary>App Logs</summary>

These logs contain what the application replicas are outputting to stdout/stderr during runtime.

You can view only the main application using:
```bash
nctl logs app {APP_NAME} --type app
```
</details>

<details>
<summary>Worker Job Logs</summary>

These logs contain what the worker job is outputting to stdout/stderr during runtime.

You can view all worker job logs of an application using:
```bash
nctl logs app {APP_NAME} --type worker_job
```
</details>

<details>
<summary>Deploy Job Logs</summary>

These logs contain what the deploy job is outputting to stdout/stderr during runtime.

You can view all deploy job logs of an application using:
```bash
nctl logs app {APP_NAME} --type deploy_job
```
</details>

<details>
<summary>Scheduled Job Logs</summary>

These logs contain what the scheduled job is outputting to stdout/stderr during runtime.

You can view all scheduled job logs of an application using:
```bash
nctl logs app {APP_NAME} --type scheduled_job
```
</details>

### DNS Records

Should you experience issues with connectivity or domain resolution, you can check the DNS records for your application. This will help you verify that your domain is correctly pointing to the right IP addresses and services.

You can check the allowed hosts and configuration of your app by running:

```bash
nctl get app {APP_NAME}
```

See more information and configuration guidance in the [networking section](07_networking_and_deployment.md).

### Configuring git

Should you encounter issues with git, for example changes not being visible after deployment, you should check the configuration of your git remotes.

You can use various `nctl` commands to troubleshoot, or view the **Git** tab on the Cockpit to view the URL, revision and sub path.

[//]: # (TODO: how do I get the url, subpath and revision via nctl?)

- **Check URL and subpath**:
```bash
nctl ...
```

- **Check current revision**: 
```bash
nctl ...
```

- **List recent build and releases**:
```bash
nctl get builds --project {PROJECT_NAME}
nctl get releases --project {PROJECT_NAME}
```

- **Check the logs**:

See [section above](#activity-logs).

### Database backups

##### Configuring the backup policy

Should you have issues with the database, such as connection problems or data loss, you can check the database backups, and rollback to a previous version if needed. You can view more on how backups are managed [here](04_configuring_your_database.md#backup-and-restore).

Nine creates daily backups of databases based on the backup configuration for your application - see [here](04_configuring_your_database.md#backup).

#### Restoring backups

There are a number of steps and considerations when restoring a database. The backup routine used is the same as the one we use for our managed servers. We have described how to work with the backups as well as more information about restoring backups in the following support articles:

- <a href="https://docs.nine.ch/docs/managed-server-services/databases/postgresql-backup-and-restoration/" target="_blank">PostgreSQL Backups and Restore</a>
- <a href="https://docs.nine.ch/a/m8U4Gt5lNj" target="_blank">MySQL Backups and Restore</a>

### Rollback deployments

If a deployment fails, your application will automatically rollback to the last successful deployment. However, if you need to manually rollback to a previous version, you can do so using the `nctl` command line tool.

You can do this via the `nctl` command:

...

[//]: # (TODO: how?!)

### Using Kubernetes

A benefit of [our stack](13_our_stack.md) is that with Kubernetes you can actually download the Kubernetes images and the config YAML files. This allows you to inspect the configuration and even run your application locally if needed.

To do this...

[//]: # (TODO: add instructions for downloading kubernetes image)

### Support

Should you need extra support, we are here to help!

##### Deploio Status

For platform-wide issues, incidents and upcoming maintenance, please view our [status page](https://status.nine.ch/).

##### Nine documentation

For comprehensive guides and support articles for Nine's products, please visit [docs.nine
ch](https://docs.nine.ch/).

There are also support channels available via this page, including email, a support portal and a phone number.

##### Join the Slack workspace

Please join the [Slack Deploio Community](https://join.slack.com/t/deploiocommunity/shared_invite/zt-20tb3k93m-O4NEUs0RjZYGQNQoih8zkA) where you can ask questions, share experiences and get help from other users and the Nine team.
