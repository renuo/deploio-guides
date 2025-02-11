---
title: Create an Application
description: Learn how to deploy Ruby on Rails applications with Deploio
id: create_app
displayed_sidebar: quickStartSidebar
sidebar_position: 1
pagination_prev: null
---

[//]: # (TODO: is there a way I can show I'm in the Ruby section? Same with the documentation section. Like a title to the left?)

# Create a Rails Application

The Deploio build environment makes use of the [Ruby Heroku Cloud Native Buildpack](https://github.com/heroku/buildpacks-ruby/).

## Prerequisites

This quick start guide assumes you have **installed `nctl` on your laptop**. If not, please go through the instructions [here](/documentation#installing-nctl). 

You should also have an **organization and project created**, where you will create the application.

This example also presumes that you are **using a public repository**. Should you need to set up access to a private repository, you will need to create an SSH key for security. See more details [here](/documentation/code_repository_setup).

## Example App

We have a basic Rails app in our [examples repository](https://github.com/ninech/deploio-examples#ruby).
You can deploy it with `nctl`.
This requires the `rails` command to be installed for the `SECRET_KEY_BASE`. If you don't have it, any long random string will do (127+ chars).

```bash
nctl create application rails \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=ruby/rails-basic \
  --env=SECRET_KEY_BASE=$(rails secret)
```

## Build environment considerations

The full behavior of the buildpack is [documented here](https://github.com/heroku/buildpacks-ruby/blob/c8cdfd0be3a61f7b50d36cae12ec3d22f8068afc/docs/application_contract.md).

##### Ruby Version Detection

The buildpack will attempt to detect the desired ruby version from the `Gemfile.lock` in the app source.

##### Node.js Runtime

The Node.js runtime will only be installed if there is a package.json file present at the root of the repository.

## Next Steps

Do you need a **database** for your application? Proceed to the next step.
