---
title: Create an Application
description: Learn how to deploy Docker apps on Deploio
id: create_app
displayed_sidebar: dockerSidebar
sidebar_position: 1
---

# Quick Start Guide for Docker Apps (Beta)

With Dockerfile builds, Deploio can build any app that can be built using a Dockerfile.

## Example App

We have a basic Dockerfile app in our [examples repository](https://github.com/ninech/deploio-examples#dockerfile).
You can deploy it with [nctl](https://docs.nine.ch/a/85XH6A9bN2):

```bash
nctl create application dockerfile-rust \
--git-url=https://github.com/ninech/deploio-examples \
--git-sub-path=dockerfile/rust \
--dockerfile
```

## Configuring the Dockerfile to use

By default, the `Dockerfile` in your repository root will be used.
To use any other file, you can use the flag `--dockerfile-path` to specify a `Dockerfile` at a different location.

```bash
--dockerfile-path="path/to/Dockerfile"
```

## Configuring the Docker build context

By default, the build context will be set to your repository root.
To use another directory, you can use the flag `--dockerfile-build-context` to specify a different location.

```bash
--dockerfile-build-context="path/to/build/context/"
```

## Ensuring your Dockerfile App releases successfully

The Deploio runtime will use the `ENTRYPOINT` and `CMD` specified in the `Dockerfile` to start your application.

To serve traffic to your app, the runtime expects it to listen on a TCP socket at `0.0.0.0:$PORT`.
The port defaults to `8080` if not specified but can be configured to any valid port number in the app definition.
The app health will be checked by a TCP probe to the configured port and traffic only flows to the app once the probe is successful.
If the TCP probe fails at any point of the lifecycle, the runtime will restart the app.
Also, if the app exits for any reason, it will be automatically restarted.

## Image Size Recommendation

Images built with Deploio's Dockerfile build should not exceed 2 GiB uncompressed.
There's a hard limit at 10 GiB for the whole build environment but with an image size of more than 2 GiB,
the system won't be able to cache all the layers anymore, and you'll notice degraded building performance.

## Build Arguments

You can pass [Dockerfile build arguments](https://docs.docker.com/build/building/variables/#build-arguments)
via the `--build-env` flag of `nctl`.
For example, to define a `ARG` named `APP_VERSION` with a value of `"v0.0.1"` you can use the following format:

```bash
--build-env=APP_VERSION=v0.0.1
```

## Best Practices

Any best practices that apply to Dockerfiles in general will also apply to Dockerfile builds on Deploio.

* Try to minimize your image size for faster builds, faster releases and decreased attack surface.
* Use [multi-stage builds](https://docs.docker.com/build/building/multi-stage/) for compiled languages whenever possible.
