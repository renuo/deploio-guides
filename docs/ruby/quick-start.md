---
prev: false
next:
  text: Database
  link: /ruby/database
description: Step-by-step guide for deploying Ruby on Rails applications on Deploio using Heroku buildpacks with nctl CLI and Git repositories.
---

# Create a Rails Application

::: info
This guide covers how to deploy a Ruby on Rails application with Deploio. It assumes you have a basic understanding of Ruby on Rails and Git.
:::

## Prerequisites

* This quick start guide assumes you have **installed `nctl` on your laptop**. If not, please go through the instructions [here](/user-guide/getting-started.md#installing-nctl).
* You should also have an **organization and project created**, where you will create the application. If you haven't done this yet, please follow the instructions [here](/user-guide/getting-started.md#setting-up-your-first-project).
* A locally running version of Ruby, Rubygems, Bundler, and Rails

## Setup Rails app

In case you don't have a Rails application yet, you can create one using the Rails CLI.
We recommend following the
[official Rails guide](https://guides.rubyonrails.org/getting_started.html#creating-your-first-rails-app)
to create a new Rails application.
We also have a basic Rails app in our [examples repository](https://github.com/ninech/deploio-examples#ruby-on-rails),
which you can also choose as a starting point.

::: warning
Right now, Deploio does not support SQLite databases. You will need to use PostgreSQL or MySQL if you wish to persist data. This can be configured by passing the `--database` flag to the `rails new` command with either `postgresql` or `mysql`.
:::

Add the `x86_64-linux` and `ruby` platforms to your Gemfile, to ensure that the correct gems are installed on the platform:

```shell
cd myapp
bundle lock --add-platform x86_64-linux --add-platform ruby
```

## Setup Git

Deploio requires your application to be available online in a Git repository, so that it can be cloned and deployed by
the platform. You can use any Git repository hosting service, such as GitHub, GitLab, or Bitbucket.
We describe the process of setting up a Git repository [here](/user-guide/code-repository-setup.md).
For demonstration purposes, we will use our sample Rails application hosted on GitHub.

::: info
This example presumes that you are **using a public repository**.
Should you need to set up access to a private repository, you will need to create an SSH key for security. See more details [here](/user-guide/code-repository-setup.md).
:::

## Create Deploio app

At Renuo, we use the following naming convention for new projects:

| | Example value |
|---|---|
| project name | `gifcoins2` |
| staging app name | `develop` |
| production app name | `main` |

Each project contains two apps, one for staging and one for production. For example, the staging app is created with `nctl create app develop --project=gifcoins2` and accessed via `nctl exec app develop --project=gifcoins2`.

::: warning
The app name you choose **cannot be changed later**.
:::

::: info
The following app creation command requires the [Rails CLI](https://guides.rubyonrails.org/command_line.html) to generate `SECRET_KEY_BASE`. If you don't have it, any long random string will do (127+ chars), e.g. `openssl rand -hex 64` or `head -c 64 /dev/urandom | xxd -p -c 0`.
:::

Replace `MY_RAILS_APP_NAME` with your chosen app name and run:

```bash
nctl create app MY_RAILS_APP_NAME \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=ruby/rails-basic \
  --env="SECRET_KEY_BASE=$(rails secret)"
```

You can pass multiple environment variables by separating them with `;`. Run `nctl create app --help` to see all available options.

When you create an application, the Git repository is cloned and Deploio will attempt to detect the application type and
select the appropriate buildpack.
In this case, the Heroku Ruby buildpack will be used.
The buildpack will then attempt to detect the desired ruby version from the `Gemfile.lock` in the app source.
The full behavior of the buildpack is [documented here](https://github.com/heroku/buildpacks-ruby/blob/c8cdfd0be3a61f7b50d36cae12ec3d22f8068afc/docs/application_contract.md).

::: info
If your application requires **Node.js** either for the build or runtime, a `package.json` file must be present at the root of the repository for the Node.js runtime to be installed.
:::

## Next Steps

The app should be running by now.
If your application requires a database, it will likely fail at this point because the database connection is not yet configured. You can check your app configuration with:

```bash
nctl get app MY_RAILS_APP_NAME --project=MY_PROJECT_NAME -o yaml
```

You can also open an interactive shell to inspect or debug:

```bash
nctl exec app MY_RAILS_APP_NAME --project=MY_PROJECT_NAME
```

The next step is to set up a [**database**](/ruby/database.md) for your application.
