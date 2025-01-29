---
title: PHP
description: PHP
---

# PHP

The Deploio build environment makes use of the [Paketo PHP buildpack](https://paketo.io/docs/reference/php-reference/).

## Example App

We have a basic Symfony app in our [examples repository](https://github.com/ninech/deploio-examples#php).
You can deploy it with `nctl`:

```bash
nctl create application symfony \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=php/symfony
```

## Using extensions

As already mentioned, we are currently using the [Paketo PHP buildpack](https://paketo.io/docs/reference/php-reference/)
for providing PHP support. It includes the [Paketo php-dist buildpack](https://github.com/paketo-buildpacks/php-dist)
which provides the PHP binary distribution. The built PHP binary distribution includes quite some extensions which can
be used in your PHP application on Deploio. All of them are defined in separate yaml files per PHP version in
the [Paketo php-dist buildpack](https://github.com/paketo-buildpacks/php-dist/tree/main/dependency/actions/compile/extensions-manifests).

Currently, it is not possible to use extensions that are not defined in the above-mentioned files.

It is important to mention that none of the pre-built extensions get loaded by default (due to memory usage
optimizations)! You will either have to load them via requirements in Composer or via custom `*.ini` files. Both
approaches will be explained in the following sections.

### Loading extensions via Composer

If you are using Composer as a package manager, you can specify extensions to load through the `composer.json` file. For
example, to load the bz2, curl, and zip extensions you can use the following content:

```json
{
  "require": {
    "php": ">=8.1",
    "ext-bz2": "*",
    "ext-curl": "*",
    "ext-zip": "*"
  }
}
```

This is also documented in
the [official composer documentation](https://getcomposer.org/doc/articles/composer-platform-dependencies.md#composer-platform-dependencies).

### Loading extensions via custom .ini files

If you are not using Composer, you can load extensions via custom `*.ini` files located at `<APP-ROOT>/.php.ini.d/*.ini`
in your application source code repository. For example, to load the bz2, curl, and zip extensions you could create a
file `<APP-ROOT>/.php.ini.d/custom-extensions.ini` with the following content:

```ini
extension=bz2.so
extension=curl.so
extension=zip.so
```

### Composer Platform requirements

As the build and runtime containers are different on Deploio, you may run into issues where you cannot build a project
successfully due to platform requirements not being fulfilled by the build-time container. You can ignore these
requirements using:

```bash
--build-env=BP_COMPOSER_INSTALL_OPTIONS="--ignore-platform-reqs"
```

which will ignore all build requirements, or you can scope it to specific extensions:

```bash
--build-env=BP_COMPOSER_INSTALL_OPTIONS="--ignore-platform-req=ext-mysqli"
```

When doing this, you will see from the logs that the buildpack will still validate that the extensions you require are
available in the runtime image, but the build will no longer fail due to the build container missing extensions.

## Build env considerations

The build process offers a few environment variables to adjust it to your use case. See
the [how to](https://paketo.io/docs/howto/php/) section of the documentation for all available variables.

### Select a web server

By default, the PHP built-in web server will be used. For production use cases, we recommend using Apache or NGINX:

- **PHP Built-in Web Server**

  ```bash
  --build-env=BP_PHP_SERVER=php-server
  ```

- **Apache HTTPD Web Server**

  ```bash
  --build-env=BP_PHP_SERVER=httpd
  ```

- **NGINX Web Server**

  ```bash
  --build-env=BP_PHP_SERVER=nginx
  ```

Additionally, if required, the web server can be customized further by
providing [your own server-specific config file](https://paketo.io/docs/howto/php/#provide-your-own-web-server-configuration-file).

### Configure the web directory

Some frameworks put the `index.php` in a separate directory like `public` instead of the repository root. When the web
server is HTTPD or NGINX, the web directory defaults to `htdocs`. In any case, you can override the web directory with a
build env variable.

```bash
--build-env=BP_PHP_WEB_DIR=public
```

## Symfony

For Symfony to build without failure, the auto-scripts
currently [have to be disabled](https://github.com/paketo-buildpacks/php/issues/284):

```bash
--build-env=BP_COMPOSER_INSTALL_OPTIONS="--no-scripts -o"
```

