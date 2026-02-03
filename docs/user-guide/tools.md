---
prev:
  text: Our Stack
  link: /user-guide/our-stack
next: false
---

# Tools

In this guide, we'll introduce you to the tools that you can use to manage your Deploio resources. This section is
divided into two categories:
- Official tools (actively maintained by Deploio)
- Community tools (created and maintained by the community)

## Official

### CLI

Our `nctl` CLI seamlessly integrates Deploio into your workflows. You can use it to manage applications, databases,
and more from the command line. Follow [the Getting Started guide](/user-guide/getting-started.md#installing-nctl) 
to set it up.

Compared to the [Deploio GUI](#gui-cockpit), the CLI interface is more flexible and allows you to 
automate your workflows. In addition, the interface is more stable, making it a great choice for power users.

### API

`nctl` is basically a wrapper around the [Nine Self Service API](https://docs.nine.ch/api/). If you're looking for a more
programmatic interface, you can of course also call the API directly.

#### Using kubectl

Nine's API is based on Kubernetes, meaning that you can use `kubectl` to manage your Deploio applications as well. 
This is especially useful if you're already familiar with Kubernetes and want to use its powerful features.
Have a look at [this example](https://docs.nine.ch/api/#section/Introduction/Creating-a-resource-with-curl) showing
how an object storage bucket can be created using `kubectl`.

#### Create your own GUI

Need a GUI tailored to your specific workflow? Our API provides all the necessary endpoints to build a custom interface
for managing your Deploio resources. Have a look at the [API documentation](https://docs.nine.ch/api/) for more details.

### GUI (Cockpit)

The [Deploio cockpit](https://cockpit.nine.ch) is a web-based interface that allows you to manage your Deploio resources. 
It's built on top of the Nine Self Service API and provides a simple and intuitive user interface. It's ideal for quick
tasks or when automation isn't required.

## Community

This section contains tools created and maintained by the community. Feel free to contribute to them by opening a PR
[here](https://github.com/renuo/deploio-guides)!

### deploio-cli

The folks at [Renuo](https://renuo.ch) have created a wrapper around [nctl](#cli) that aims to simplify the usage of the
CLI. By assuming an [app naming convention](https://github.com/renuo/deploio-cli#app-naming-convention), the CLI will
automatically detect the app by matching your git remote URL against nctl apps. Note that this CLI is still in 
early development and not official.