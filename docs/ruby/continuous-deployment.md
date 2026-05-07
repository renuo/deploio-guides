---
prev:
  text: Background jobs
  link: /ruby/background-jobs
next: false
description: Guide for setting up continuous deployment pipelines for Rails applications using API service accounts, nctl CLI automation, and deployment status monitoring.
---

# Configure Continuous Deployment for Your Rails Application

There are two ways to automatically deploy your Rails application on Deploio:

1. **Polling** — Deploio polls your repository for changes (every minute) and deploys automatically.
2. **CI/CD pipeline** — Your CI pipeline tells Deploio to deploy a specific commit after tests pass.

## Option 1: Polling

This is the simplest approach. Point your application at a branch, and Deploio will regularly check
for new commits and redeploy when it detects changes:

```bash
nctl update app {APP_NAME} --git-revision=main
```

No CI/CD setup is required. This is a good option for staging environments or projects that don't
have a CI pipeline yet.

::: warning
With branch tracking, Deploio deploys every push to the branch. This would start the deployment process
immediately, before your tests have passed.
:::

## Option 2: CI/CD Pipeline

In this approach, your CI pipeline runs tests first and then triggers a deploy by updating the
application's git revision to a specific commit SHA. This gives you full control over what gets
deployed.

### Prerequisites

- A Rails application under version control with a remote repository on GitHub, GitLab, Bitbucket, or any other
  [Git hosting service](/user-guide/code-repository-setup.md)
- A running Deploio Rails application. If you haven't deployed yet, follow
  the [Quick Start guide](quick-start.md).
- A CI/CD tool like GitHub Actions, GitLab CI/CD, or CircleCI

### Create a Service Account

::: tip
Before you create resources, ensure that the project you want to create the resources in is selected by
running `nctl auth set-project {project_name}`. Alternatively, you can specify the project in every command using the
`--project` flag.
:::

To avoid storing your personal credentials in your CI/CD pipeline, create an API service
account (ASA) that only has permissions within a project:

```bash
nctl create apiserviceaccount {ASA_NAME}
```

Retrieve the token:

```bash
nctl get apiserviceaccounts {ASA_NAME} --print-token
```

### Configure CI/CD Environment Variables

Set the following environment variables in your CI/CD tool:

- `DEPLOIO_APP_NAME`: The name of your application in Deploio.
- `DEPLOIO_PROJECT`: The name of the project in Deploio.
- `NCTL_API_TOKEN`: The API token from the service account above.
- `NCTL_ORGANIZATION`: Your organization name in Deploio.

`NCTL_API_TOKEN` and `NCTL_ORGANIZATION` are used to authenticate the `nctl` CLI.
Since the API token is sensitive, **store it as a secret** in your CI/CD tool.

### Deploy Script

The following script can be used in any CI/CD tool that runs on Debian/Ubuntu:

```bash
echo "deb [trusted=yes] https://repo.nine.ch/deb/ /" | sudo tee /etc/apt/sources.list.d/repo.nine.ch.list
sudo apt-get update && sudo apt-get install nctl
nctl auth login
nctl update app $DEPLOIO_APP_NAME \
  --project $DEPLOIO_PROJECT \
  --git-revision=$(git rev-parse HEAD) \
  --skip-repo-access-check
```

The script installs the `nctl` CLI, authenticates using the API token, and updates the git revision
to the current commit. This tells Deploio to fetch and build that exact commit.

If you are using a different operating system, adjust the installation step accordingly. See the
[nctl setup instructions](https://github.com/ninech/nctl?tab=readme-ov-file#setup).

::: warning
This example deploys the current commit. In a production environment, you may want to restrict
deployments to a specific branch or tag.
:::

### Caveats

The deploy script above is minimal and has some limitations:

- It does not check if the deployment was successful — CD might fail silently.
- It terminates immediately after updating the git revision, before the deploy finishes.

::: info
A blocking mode for `nctl update app` is on the roadmap. Once available, the command will wait until
the deployment finishes and exit with a non-zero status on failure, removing the need for a separate
status check.
:::

In the meantime, for a more robust setup that waits for the deployment to finish and checks its
status, see the [deployment feedback guide](/user-guide/ci-cd-integration.md#deployment-feedback-on-the-ci),
which includes an example status check script in Ruby.

### Troubleshooting

If `nctl auth login` runs indefinitely, the `NCTL_API_TOKEN` is most likely not set correctly.
Ensure that the token is available to the script and that the service account was created within the
correct project.

## Next Steps

Now that your application is live and deploying automatically, you'll want to keep an eye on it.
Head over to the [Monitoring and Logs](/user-guide/monitoring-and-logs.md) guide to learn how to
observe your application's logs and metrics.
