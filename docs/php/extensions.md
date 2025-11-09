---
prev:
  text: Build environment
  link: /php/build-environment
next:
  text: Symfony
  link: /php/symfony
---

# Using Extensions

PHP extensions need to be installed into the server running PHP. This needs to be done before your container is started.

As mentioned in the introduction, Deploio uses the [Paketo PHP buildpack](https://paketo.io/docs/reference/php-reference/)
for providing PHP support. This includes the [Paketo php-dist buildpack](https://github.com/paketo-buildpacks/php-dist)
which provides the PHP binary distribution. The built PHP binary distribution includes a number of extensions which can
be used in your PHP application on Deploio. All of them are defined in separate yaml files per PHP version in
the [Paketo php-dist buildpack](https://github.com/paketo-buildpacks/php-dist/tree/main/dependency/actions/compile/extensions-manifests).

If you need extensions that are not defined in the above-mentioned files, you will need to [provide your own Dockerfile](../docker/quick-start.md).

Be aware that none of the pre-built extensions get loaded by default (due to memory usage optimizations). You have to
specify the extensions your application needs either in the requirements section of your composer.json or with `*.ini`
files. Both approaches will be explained in the following sections.

## Loading Extensions via Composer

If you are using [Composer](https://getcomposer.org/) as a package manager, you should specify your necessary extensions
in the `require` section of your `composer.json` file. For example, to load the curl, gd and zip extensions, specify:

```json title="composer.json"
{
  "require": {
    "php": "^8.1",
    "ext-curl": "*",
    "ext-gd": "*",
    "ext-zip": "*"
  }
}
```

It is best practice to declare all required PHP Extensions in composer.json, see also the
[official composer documentation](https://getcomposer.org/doc/articles/composer-platform-dependencies.md#composer-platform-dependencies).

## Loading extensions via custom .ini files

If you are not using Composer, you need to provide custom `*.ini` files to load extensions. The files need to be located
at `<APP-ROOT>/.php.ini.d/*.ini` in your application source code repository. For example, to load the curl, gd and zip
extensions, you could create a file `<APP-ROOT>/.php.ini.d/custom-extensions.ini` with the following content:

```ini title="/.php.ini.d/custom-extensions.ini"
extension=curl.so
extension=gd.so
extension=zip.so
```

## Composer Platform requirements

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

When doing this, you will see from the logs that the buildpack still validates that the extensions you require are
available in the runtime image, but the build will no longer fail due to the build container missing extensions.


## Next Steps

In the next step, we will look at some more options to configure how your application needs to be run.
