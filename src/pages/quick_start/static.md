---
title: Quick Start Guide for Static Sites
description: Learn how to deploy static sites with Deploio
---

# Quick Start Guide for Static Sites

If you have a site with purely static content,
Deploio makes use of a combination of buildpacks to deploy a web server to serve your static files.

Static sites are detected by looking for these files in your git repo:

* `index.html`
* `public/index.html`

## Example Apps

We have two static sites in our [examples repository](https://github.com/ninech/deploio-examples#static).
You can deploy them with `nctl`:

* just a plain `index.html`:
  ```bash
  nctl create application static-html \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=static/html
  ```
* a frontend react app built with `npm`:
  ```bash
  nctl create application static-react \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=static/react
  ```

## Build env considerations

To override the automatically detected paths mentioned above, you can specify the build env variable
`BP_STATIC_WEBROOT=<directory>` to any directory within your Git repository.

## NPM Frontend

If you have Node modules that need to be installed during the build step,
Deploio will detect this using the `package.json` file and run `npm`.
In this case, the resulting files will end up in the directory `build`, and it will serve the artifacts from there.
