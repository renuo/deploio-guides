---
title: Quick Start Guide for Ruby on Rails Applications
description: Learn how to deploy Ruby on Rails applications with Deploio
---

# Quick Start Guide for Ruby on Rails Applications

The Deploio build environment makes use of the [Ruby Heroku Cloud Native Buildpack](https://github.com/heroku/buildpacks-ruby/).

## Example App

We have a basic Rails app in our [examples repository](https://github.com/ninech/deploio-examples#python).
You can deploy it with `nctl`.
This requires the `rails` command to be installed for the `SECRET_KEY_BASE`. If you don't have it, any long random string will do (127+ chars).

```bash
nctl create application rails \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=ruby/rails-basic \
  --env=SECRET_KEY_BASE=$(rails secret)
```

## Build env considerations

The full behavior of the buildpack is [documented here](https://github.com/heroku/buildpacks-ruby/blob/c8cdfd0be3a61f7b50d36cae12ec3d22f8068afc/docs/application_contract.md).

### Ruby Version Detection

The buildpack will attempt to detect the desired ruby version from the `Gemfile.lock` in the app source.

### Node.js Runtime

The Node.js runtime will only be installed if there is a package.json file present at the root of the repository.


