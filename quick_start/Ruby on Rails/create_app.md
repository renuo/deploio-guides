---
title: Create a Rails Application
description: Learn how to deploy Ruby on Rails applications with Deploio
id: create_app
displayed_sidebar: quickStartSidebar
sidebar_position: 1
pagination_prev: null
---

[//]: # (TODO: is there a way I can show I'm in the Ruby section? Same with the documentation section. Like a title to the left?)

# Create a Rails Application

<div class="summary">
This guide covers how to deploy a Ruby on Rails application with Deploio.
It assumes you have a basic understanding of Ruby on Rails and Git.
</div>

## Prerequisites

* This quick start guide assumes you have **installed `nctl` on your laptop**. If not, please go through the instructions [here](/documentation#installing-nctl).
* You should also have an **organization and project created**, where you will create the application. If you haven't done this yet, please follow the instructions [here](/documentation#creating-an-account).
* This example also presumes that you are **using a public repository**. 
  Should you need to set up access to a private repository, you will need to create an SSH key for security. See more details [here](/documentation/code_repository_setup).
* A locally running version of Ruby, Rubygems, Bundler, and Rails

## Use an Existing Rails Application or Create a New One

In case you don't have a Rails application yet, you can create one using the Rails CLI.
We recommend following the 
[official Rails guide](https://guides.rubyonrails.org/getting_started.html#creating-your-first-rails-app)
to create a new Rails application.
We also have a basic Rails app in our [examples repository](https://github.com/ninech/deploio-examples#ruby), 
which you can also choose as a starting point.

:::warning
Right now, Deploio does not support SQLite databases. 
You will need to use PostgreSQL or MySQL if you wish to persist data.
This can be configured by passing the `--database` flag to the `rails new` command with either `postgresql` or `mysql`.
:::

After configuring your Rails application and attaching a database, you can proceed to deploy it with Deploio.
Add the `x86_64-linux` and `ruby` platforms to your Gemfile, to ensure that the correct gems are installed.

```shell
cd myapp
bundle lock --add-platform x86_64-linux --add-platform ruby
````

## Use Git to Store Your Application

Deploio requires your application to be available online in a Git repository, so that it can be cloned and deployed by
the platform. You can use any Git repository hosting service, such as GitHub, GitLab, or Bitbucket.
We describe the process of setting up a Git repository [here](/documentation/code_repository_setup). 
For demonstration purposes, we will use our sample Rails application hosted on GitHub.

## Create a Deploio Application

To create an application on Deploio, we can use the `nctl create application` command:

```bash
nctl create application rails \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=ruby/rails-basic \
  --env="SECRET_KEY_BASE=$(rails secret)"
```

Replace the name `rails` with any app name best suited for your project.

:::note
This requires the [Rails CLI](https://guides.rubyonrails.org/command_line.html) to be installed for the `SECRET_KEY_BASE`.
If you don't have it, any long random string will do (127+ chars), e.g. `openssl rand -hex 64` or
`head -c 64 /dev/urandom | xxd -p -c 0`.
:::

When you create an application, the Git repository is cloned and Deploio will attempt to detect the application type and
select the appropriate buildpack.
In this case, the Heroku Ruby buildpack will be used.
The buildpack will then attempt to detect the desired ruby version from the `Gemfile.lock` in the app source.
The full behavior of the buildpack is [documented here](https://github.com/heroku/buildpacks-ruby/blob/c8cdfd0be3a61f7b50d36cae12ec3d22f8068afc/docs/application_contract.md).

:::note
If your application requires **Node.js** either for the build or runtime, a `package.json` file must be present at the root
of the repository for the Node.js runtime to be installed.
:::

## Next Steps

The app should be running by now.
However, if you are migrating an existing application or just created a new one that requires a database, chances are
high that the current setup will not work.
In this case, we will need to set up a **database**, which is described in the next step.
