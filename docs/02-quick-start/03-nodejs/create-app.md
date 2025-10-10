---
title: Node.js Quick Start Guide
sidebar_label: Create a Node Application
description: Learn how to deploy a Node.js applications with Deploio
id: create_app
pagination_prev: null
pagination_next: null
---

# Quick Start Guide for Node.js Applications

<div class="summary">
With our support for the [Paketo Node.js buildpack](https://paketo.io/docs/reference/nodejs-reference/),
you can deploy any Node.js application with Deploio. In this guide, we will use a simple Next.js application as an example.
</div>

## Prerequisites

* This quick start guide assumes you have **installed `nctl` on your computer**. If not, please go through the
  instructions [here](/user-guide/getting_started#installing-nctl).
* You should also have an **organization and project created**, where you will create the application. If you haven't
  done this yet, please follow the instructions [here](/user-guide/getting_started#creating-an-account).
* This example also presumes that you are **using a public repository**.
  Should you need to set up access to a private repository, you will need to create an SSH key for security. See more
  details [here](/user-guide/code_repository_setup).

## Use An Existing Application or Create a New One

:::info
In this guide, we will use a **Next.js** application for demonstration purposes. However, you can use **any Node.js
application** you prefer since the workflow remains the same.
:::

In case you don't have a Next.js application yet, you can create one using the Next.js CLI.
We recommend following the [official Next.js guide](https://nextjs.org/docs/app/getting-started/installation) to create
a new Next.js application. 
If you want to learn the process,
we also provide a basic Next.js app in our [examples repository](https://github.com/ninech/deploio-examples#nodejs). 

## Use Git to Store Your Application

Deploio requires your application to be **available online** in a Git repository, so that it can be cloned and deployed
by
the platform. You can use any Git repository hosting service, such as GitHub, GitLab, or Bitbucket. We describe the
process of setting up a Git repository [here](/user-guide/code_repository_setup). For demonstration purposes, we will
use our sample Next.js application hosted on GitHub.

## Create a Deploio Application

:::info
Ensure that the **correct project is selected** before creating an application. If you've just created a new project,
it's
already selected. However, if you want to switch to a different project, you can use the `nctl auth set-project`
command.
:::

To create an application on Deploio, we can use the `nctl create app` command:

```bash
nctl create app nextjs \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=nodejs/nextjs \
  --build-env=NODE_ENV="production" \
  --env=NODE_ENV="production"
```

This command creates a new application on Deploio using
the [Node.js buildpack](https://paketo.io/docs/reference/nodejs-reference/). The `--git-url` flag specifies the URL of
the Git repository where the application is stored. The optional `--git-sub-path` flag specifies the subdirectory in the
Git repository where the application is located. Finally, the `--env` flag and `--build-env` flag sets the `NODE_ENV`
environment variable to `production`.

:::warning
To ensure the seamless build of your Next.js application, it's crucial to explicitly define the `NODE_ENV` environment
variable as `production`.

This requirement stems from an existing upstream issue that cannot be rectified.
:::

:::tip
Should your project be stored in a private Git repository, you will need to set up an SSH key that allows Deploio to
access the repository. Afterwards, you can use the `--git-ssh-private-key` flag or the `--git-ssh-private-key-from-file`
flag to specify the SSH key to use.
You can find more information on how to do this [here](/user-guide/code_repository_setup).
:::

After creating the application, Deploio will immediately start cloning your application and attempt to build it by
running `npm install` and `npm run build` (or `yarn install` and `yarn build` if you're using Yarn).
The Node version is detected by first looking into `package.json` and then into the `engines` field. Should the Node
version not be specified in the `package.json` file, the buildpack will fall back to the version specified in the
`.nvmrc` file.

## Build env considerations

The build process offers a few environment variables which can be used to adjust it to your use-case.
See the [how to](https://paketo.io/docs/howto/nodejs/) section of the buildpack documentation for all available
variables.

If you need to add custom environment variables to your application, ensure that they're available during the
build by using the `--build-env` flag when updating your application with `nctl update app`.

### Build an App in a Subdirectory

To specify a subdirectory to be used as the root of the app, you can use the `BP_NODE_PROJECT_PATH` build variable.

```bash
nctl update app {application_name} \
  --build-env=BP_NODE_PROJECT_PATH="./node-app"
```

## Process customization

The Node.js buildpack determines a start command automatically for your app based on the contents of the `package.json`
file. However, if you wish to customise the start command, you can do so by declaring a `Procfile` in the root of your
app:

```yaml title="Procfile"
web: node my-custom-start.js
```
