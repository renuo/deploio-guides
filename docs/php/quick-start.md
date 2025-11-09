---
prev: false
next:
  text: Database
  link: /php/database
---

# Quick Start Guide for PHP Applications

::: info
This guide covers how to deploy a plain PHP application with Deploio.
It assumes you have a basic understanding of PHP and Git.
:::

The Deploio build environment makes use of the [Paketo PHP buildpack](https://paketo.io/docs/reference/php-reference/).

## Prerequisites

* This quick start guide assumes you have **installed `nctl` on your laptop**. If not, please go through the instructions [here](/user-guide/getting-started#installing-nctl).
* You should also have an **organization and project created**, where you will create the application. If you haven't done this yet, please follow the instructions [here](/user-guide/getting-started#setting-up-your-first-project).
* This example also presumes that you are **using a public repository**.
  Should you need to set up access to a private repository, you will need to create an SSH key for security. See more details [here](/user-guide/code-repository-setup).

## Use an Existing PHP Application or Create a New One

If you do not have a PHP application you want to experiment with, we provide a plain PHP app in our [examples repository](https://github.com/ninech/deploio-examples#php).

## Use Git to Store Your Application

Deploio requires your application to be available online in a Git repository, so that it can be cloned and deployed by
the platform. You can use any Git repository hosting service, such as GitHub, GitLab, or Bitbucket.
We describe the process of setting up a Git repository [here](/user-guide/code-repository-setup).
For demonstration purposes, we will use our sample PHP application hosted on GitHub.

## Create a Deploio Application

To create an application on Deploio, you can use the `nctl create app` command:

```bash
nctl create app plain-php \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=php/plain \
  --build-env=BP_PHP_WEB_DIR=public \
  --build-env=BP_COMPOSER_INSTALL_OPTIONS="--ignore-platform-reqs"
```

Replace the name `plain-php` with any app name best suited for your project.

::: info
Beyond the `--git-url` argument that specifies what git repository to deploy, you need to specify a couple of `nctl`
options. We will explain those in the next steps.
:::

When you create an application, the Git repository is cloned and Deploio will attempt to detect the application type and
select the appropriate buildpack.
In this case, the [Paketo PHP buildpack](https://paketo.io/docs/reference/php-reference/) will be used.
The buildpack will then attempt to detect the desired PHP version from the `composer.json` in the app source.

::: info
If your application requires **Node.js** either for the build or runtime, a `package.json` file must be present at the root
of the repository for the Node.js runtime to be installed.
:::

## Next Steps

The app should be running by now. In the next couple of steps, we explain the various options used when creating the
application. Later we will set up a Symfony application and look into how to create databases and other storages.
