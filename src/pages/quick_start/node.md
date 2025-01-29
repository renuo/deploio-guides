---
title: Node
description: Node
---

# Node.js

The Deploio build environment makes use of
the [Paketo Node.js buildpack](https://paketo.io/docs/reference/nodejs-reference/).

## Example App

We have a basic Next.js app in our [examples repository](https://github.com/ninech/deploio-examples#nodejs). You can
deploy it with `nctl`:

```bash
nctl create application nextjs \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=nodejs/nextjs
```

## Build env considerations

The build process offers a few environment variables which can be used to adjust it to your use-case. 
See the [how to](https://paketo.io/docs/howto/nodejs/) section of the documentation for all available variables.

### Build an App in a Subdirectory

To specify a subdirectory to be used as the root of the app, you can use the `BP_NODE_PROJECT_PATH` build variable.

```bash
--build-env=BP_NODE_PROJECT_PATH="./node-app"
```

## Next.js

In specific scenarios, such as when utilizing the NextJS router, additional steps are essential to get your application
to build.

### NODE_ENV

To ensure the seamless build of your NextJS application, it's crucial to explicitly define the `NODE_ENV` environment
variable as `production`.

This requirement stems from an existing upstream issue that cannot be rectified.

To address this, utilize the `--build-env` and `--env` options in `nctl` as follows:

```bash
nctl create app next \
  --git-url=<url> \
  --build-env=NODE_ENV="production" \
  --env=NODE_ENV="production"
```
