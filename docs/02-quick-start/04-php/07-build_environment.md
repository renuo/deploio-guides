---
title: The PHP build environment
description: Learn how chose customize the build environment for your PHP applications with Deploio
id: php_build_env
---

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

# Build Environment

The build process offers a few environment variables to adjust it to your use case. See
the [how to](https://paketo.io/docs/howto/php/) section of the documentation for all available variables.

## Configure the web directory

To avoid exposing project files over the web, it is best practice to use a subfolder of your application as web root.
A typical location for this is the directory `public`. Set `BP_PHP_WEB_DIR` to your web root directory:

```bash
--build-env=BP_PHP_WEB_DIR=public
```

When the web server is Apache HTTPD or NGINX, the web directory defaults to `htdocs`.

## Selecting a Web Server

By default, the PHP built-in web server will be used. For production use cases, we recommend using Apache HTTPD or NGINX:

```mdx-code-block
<Tabs>
<TabItem value="PHP Built-in Web Server">
```

```bash
--build-env=BP_PHP_SERVER=php-server
```

```mdx-code-block
</TabItem>
<TabItem value="Apache HTTPD Web Server">
```

```bash
--build-env=BP_PHP_SERVER=httpd
```

```mdx-code-block
</TabItem>
<TabItem value="NGINX Web Server">
```

```bash
--build-env=BP_PHP_SERVER=nginx
```

```mdx-code-block
</TabItem>
</Tabs>
```

Additionally, if required, the web server can be customized further by
providing [your own server-specific config file](https://paketo.io/docs/howto/php/#provide-your-own-web-server-configuration-file).


## Next Steps

In the next step, we will set up a Symfony project and then configure various storage options for it.
