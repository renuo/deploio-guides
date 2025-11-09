---
prev: false
next: false
---

# Quick Start Guide for Go Applications

The Deploio build environment makes use of
the [Heroku Go Cloud Native Buildpack](https://github.com/heroku/buildpacks-go/).

## Example App

We have a basic Go app in our [examples repository](https://github.com/ninech/deploio-examples#go). You can deploy it
with `nctl`:

```bash
nctl create app go \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=go
```

## App Requirements

Any Go project that meets the following criteria should be buildable:

- There is a `go.mod` at the root of the project.
- The app compiles with Go 1.16 or greater.
- The app uses Go Modules for any dependency installation.

## Go version detection

The Go version is read from the `go` line in `go.mod`. This is likely correct for most apps, but a different version may
be selected using a
[build directive in `go.mod`](https://github.com/heroku/buildpacks-go/tree/main?tab=readme-ov-file#go-version).

## Multiple Binaries

The build process will build all main packages that it detects in the project. If you have multiple main packages, you
might need to define the desired app entrypoint with a [`Procfile`](https://docs.nine.ch/docs/deplo-io/configuration/deploio-procfile/).
For example, if your `main.go` file rests in a directory called `server`, the `Procfile` should look like this:

```yaml
web: server
```

This will result in the binary `server` being executed as the app entrypoint.

If you want to only build selective packages, you can use a
[directive in the `go.mod` file](https://github.com/heroku/buildpacks-go/tree/main?tab=readme-ov-file#package-installation) for that.
