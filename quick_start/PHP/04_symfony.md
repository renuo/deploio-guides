---
title: Create a Symfony Application
description: Learn how to deploy Symfony applications on Deploio
id: create_symfony_app
displayed_sidebar: quickStartSidebar
---

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

# Setting up a Symfony Application

In the previous steps, we have explained the basics of how to set up a PHP application on Deploio. In this step, you
will install a Symfony application. This allows us to demonstrate the various storage options in the further steps. 

## Example App

We have a basic Symfony app in our [examples repository](https://github.com/ninech/deploio-examples#php).
You can deploy it with `nctl`:

```bash
nctl create app symfony \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=php/symfony \
  --env="APP_SECRET=$()echo $RANDOM | md5sum | head -c 16)" \
  --build-env=BP_PHP_SERVER=nginx \
  --build-env=BP_PHP_WEB_DIR=public \
  --build-env=BP_COMPOSER_INSTALL_OPTIONS="--ignore-platform-reqs --no-scripts -o"
```

### Configure the Application Secret

Symfony needs an `APP_SECRET` variable to be defined to a secret value. This is used for security relevant functionality.
While it could be read from a `.env` file, it is more secure to set it as an environment variable.
We set it to an initial value when creating the application. Unless when compromised, the secret should not be changed
anymore later on, otherwise existing user sessions will become invalid.

### Configure the Web Directory

To avoid exposing random project files to the web, Symfony uses the directory `public` as web root, therefore we need to
configure the container to use that directory.

```bash
--build-env=BP_PHP_WEB_DIR=public
```

### Composer Options

Symfony uses PHP extensions that are not available on the build system. Additionally, the auto-scripts currently
[have to be disabled](https://github.com/paketo-buildpacks/php/issues/284):

```bash
--build-env=BP_COMPOSER_INSTALL_OPTIONS="--ignore-platform-reqs --no-scripts -o"
```
