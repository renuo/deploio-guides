---
prev:
  text: CI/CD Integration
  link: /user-guide/ci-cd-integration
next:
  text: Monitoring and Logs
  link: /user-guide/monitoring-and-logs
---

# Troubleshooting

Should you have an issue with your application, we have a few tools and guides to help you get back on track.

## Logs

If you want to debug a runtime error, you could start by looking at the latest logs of your application.
This can be done by running the following command:

```bash
nctl logs app {application_name} --project {project_name} --follow
```

See the [Monitoring and Logs](./monitoring-and-logs.md) section for more information.

## Where does it run?

Following command prints the DNS target of the application, which is the URL where your application is running.
```bash
nctl get app {application_name} --project {project_name} --dns
```

## Which revision is live?

```bash
nctl get app {application_name} --project {project_name} --output yaml | grep revision
```

Prints the revision of the latest deployment. Use this revision to find the corresponding git commit in the git 
history.

## Database

### Access

[This guide](./configuring-your-database.md#interacting-with-databases-1) describes how you can access a database
directly from your local machine. In case you receive a connection error, make sure that your local IP address is
allow-listed in the database configuration. See the [Configuring your database](./configuring-your-database.md#protecting-database-access)
guide for more information.

### Backups

See the [Database Backups](./configuring-your-database.md#backup-and-restore) guide for instructions on how to create 
and restore database backups.

## Rollback deployments

In case you want to rollback to a previous revision, you can use the following command:
```bash
nctl update app {application_name} --project {project_name} --git-revision={git_revision}
```

## Kubernetes

In case you want to reproduce an issue with a certain build, you can use the following commands to pull the corresponding 
image and run it locally with Docker:

1. List builds
```bash
nctl get builds --application-name {application_name} --project {project_name}
```
2. Pull image for a specific build
```bash
nctl get builds {build_name} --application-name {application_name} --project {project_name} --pull-image
```

You can also see the full configuration of the build by running:
```bash
nctl get builds {build_name} --application-name {application_name} --project {project_name} --output json
```

## Deploio system status

We provide further information about the status of our system and services on our [status page](https://status.nine.ch/).

## Support

Should you have any other questions or issues, please reach out to us via the following channels.

### Slack Community

We do have an official [Deploio Slack community](https://join.slack.com/t/deploiocommunity/shared_invite/zt-20tb3k93m-O4NEUs0RjZYGQNQoih8zkA).
We'll try to answer your questions as soon as possible.

### Contact

Next to the Slack community, you can reach us via the following ways:
- Email: support@nine.ch
- Phone: +41 44 637 40 40
- Support portal: https://portal.nine.ch/

### Further documentation

In case our guides don't cover your issue or question, we provide further documentation [here](https://docs.nine.ch/docs/category/deploio-paas/).
