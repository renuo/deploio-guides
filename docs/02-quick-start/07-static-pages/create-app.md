---
title: Create an Application
description: Learn how to deploy static sites with Deploio
id: create_app
sidebar_position: 1
pagination_prev: null
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
  nctl create app static-html \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=static/html
  ```
* a frontend react app built with `npm`:
  ```bash
  nctl create app static-react \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=static/react
  ```

## Web server root

If you need to modify the location of static files served by the web server, you can set 
the build environment variable `BP_STATIC_WEBROOT=<directory>`.

`BP_STATIC_WEBROOT` defaults to `build`.
So per default Deploio serves your app from `/workspace/build`.

[Vite](https://vite.dev/) for example builds into `dist`.
So you need to set `BP_STATIC_WEBROOT=dist` which ends up in `/workspace/dist` being served by Deploio's _nginx_.



## NPM Frontend

If you have Node modules that need to be installed during the build step,
Deploio will detect this using the `package.json` file and run `npm`.
In this case, the resulting files will end up in the directory `build`, and it will serve the artifacts from there.
