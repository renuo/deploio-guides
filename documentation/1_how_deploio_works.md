---
title: How Deploio Works
sidebar_position: 1
slug: /
---

# How Deploio Works

Provide details on the build and release process, the underlying technology and how it integrates with your code repository. 

### Repo, Build, Release Process

All you require for deploying an application with Deploio is:

- a git repository with the application codebase <img src="/img/icons/git.svg" height="20px" width="20px"/>
- a laptop or PC for installing `nctl` and deploying the application 💻
- a domain to point to your application 🌐

##### Repo

You tell us where your code is and where it should run.

##### Build

We download your code and build it.

##### Release

Only successful builds are released.

##### Run
   
We deploy your application on Kubernetes.

[//]: # (TODO: a diagram here would be good)

### Workflow

##### Code Management

Integration with GitHub, GitLab, or Bitbucket.

##### Build Automation

Automated builds using buildpacks or custom Docker images.

##### Deployment

Seamless deployment to Kubernetes with proper versioning.

### Glossary of Key Terms

##### Project

A logical grouping of applications and services.

##### Deployment

The process of delivering your application live.

##### Cockpit

The web interface for managing projects and applications.

##### nctl

The CLI tool for advanced management.

Learn more about the process on [docs.nine.ch](https://docs.nine.ch).
