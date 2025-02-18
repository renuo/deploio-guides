---
id: cd
title: Configure Continuous Deployment
description: Learn how to configure the CD for your Rails application.
displayed_sidebar: quickStartSidebar
sidebar_position: 6
pagination_next: null
---

# Configure the CD for Your Rails Application

<div class="summary">
Modern application workflows typically involve some sort of continuous integration and continuous deployment (CI/CD) process. This guide will help you set up a continuous deployment pipeline for your Rails application, independent of the CI/CD tool you choose.
</div>

:::tip Preliminary Information
If you do not intend to have a CI pipeline and still want to have your application deployed automatically, you can
specify a branch to pull from using the `nctl` api
(`nctl update application {application_name} --git-revision=my-branch`).
Deploio will regularly check for changes in the specified branch and deploy the application if changes are detected.
:::

## Prerequisites

Before you begin, you need to have the following:

- A Rails application under version control with Git and a remote repository on GitHub, GitLab, Bitbucket, or any other
  Git hosting service.
- A running Deploio Rails application. If you haven't deployed your Rails application yet, follow
  the [Create a Rails Application](./create_app.md) guide.
- A CI/CD tool like GitHub Actions, GitLab CI/CD, or CircleCI that is able to run bash scripts. Ideally, a CI pipeline
  already exists that executes your tests so that we can deploy the application after the tests pass.

## Create a Service Account

:::tip
Before you create resources, ensure that the project you want to create the resources in is selected by
running `nctl auth set-project {project_name}`. Alternatively, you can specify the project in every command using the
`--project` flag.
:::

To avoid having to store your personal credentials in your CI/CD pipeline, you should create an API service
account (ASA) that only has permissions within a project. You can create a new service account using the `nctl` CLI:

```bash
nctl create apiserviceaccount {asa_name}
```

After the service account is created, you will be able to query the service account's credentials using the following
command:

```bash
nctl get apiserviceaccounts {asa_name} --print-token
```

## Configure the CD Pipeline

Since the CD pipeline is highly dependent on the platform you are using, we will provide a general example of how you
can configure the CD pipeline.

### Prerequisites

To be able to run the deploy script, the following environment variables need to be set:

- `DEPLOIO_APP_NAME`: The name of the Rails application in Deploio.
- `DEPLOIO_PROJECT`: The name of the project in Deploio.
- `NCTL_API_TOKEN`: The API token of the service account you created in the previous step.
- `NCTL_ORGANIZATION`: The organization name in Deploio.

The latter two environment variables are used to authenticate the `nctl` CLI. Since the API token is sensitive, it is
recommended to **store it as a secret** in your CI/CD tool.

### Deploy Script

The following script can be used in any CI/CD tool that is based on Debian/Ubuntu

```bash
echo "deb [trusted=yes] https://repo.nine.ch/deb/ /" | sudo tee /etc/apt/sources.list.d/repo.nine.ch.list
sudo apt-get update && sudo apt-get install nctl
nctl auth login
nctl update app $DEPLOIO_APP_NAME \
  --project $DEPLOIO_PROJECT \
  --git-revision=$(git rev-parse HEAD) \
  --skip-repo-access-check
```

The first step in the script adds the `nine.ch` Debian repository to the system, and the second step installs the `nctl` CLI. In case you are using a different operating system, you need to
adjust the installation command accordingly. You can find instructions on how to install the `nctl` CLI in
the [CLI documentation](https://github.com/ninech/nctl?tab=readme-ov-file#setup).

In the third step, the script authenticates the `nctl` CLI using the API token.

Finally, the script updates the git-revision of the application and thus tells Deploio to fetch the latest version of
your application from your specified git repository.

:::warning
In this example, we are using the git revision of the current commit to deploy the application. This works in most
cases, but you might want to adjust this to your needs. For example, in a production environment, you might want to
ensure that the deployment can only be updated from a specific branch or tag.
:::

### Caveats

The script provided above is a rather basic example of how you can deploy your Rails application and thus has some
flaws:

- It does not check if the deployment was successful and thus CD might fail silently.
- It immediately terminates after the git revision was updated. This might be a problem if you want to run additional
  commands after the deployment was successful.

To circumvent these issues, you might want to add a check that waits for the deployment to finish and then check its
status. A more sophisticated approach including an example of a status check script in Ruby can be found in
our [blog post on how to migrate a Rails application from Heroku to Deploio.](/ruby_heroku_migration_guide#configure-ci). This Ruby script can be adapted for your preferred language and setup.

### Troubleshooting

If you encounter issues when running the `nctl auth login` command such as it running indefinitely, most likely the
`NCTL_API_TOKEN` is not set correctly. Ensure that the token is set correctly and that it is available to the script.
Also, double check that the service account was created within the correct project and that the project is set correctly
in the `DEPLOIO_PROJECT` environment variable.
