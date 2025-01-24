---
title: Outline
---

# Concept

* You've got a project written in
  * Ruby
  * PHP
  * Node.js
  * Go
  * Python
  * Static HTML
  * Anything and a Dockerfile

* How it works
  * Repo, Build, Release
  * You tell us where your code is and where it should run
  * We download it
    * We poll
    * On ref update using Inspector Gadget
  * We build it
    * Using buildpacks
    * Running docker build
  * We release it
    * Only if the release is successful
  * We run it
    * On Kubernetes

* Where is the code?
  _* On Github
    * Github app (OAuth)
  * On Gitlab
  * On Bitbucket
  * On a private git server

* The code is private?
  * Yes?
    * SSH keys
  * No?

* Are there dependencies (addons)?
  * Database?
  * Key Value store?
  * Object storage
  * Persistent volume?
    * Limits?

* Are there multiple processes?
  * Caveat: Procfile takes only web process
  * Proxied to the web? (deploio.yaml?, Procfile) If yes:
    * Protect it with basic auth
    * Make it reachable under custom domains
      * Host names
      * Lets encrypt
    * Route it with custom ports
  * Unproxied worker jobs? (deploio.yaml)
    * Sidekiq
    * …
  * Deployment jobs (deploio.yaml)
    * database migrations

* Is there special configuration needed?
  * Domain names
    * CDN, Cloudflare
      * Apex domains need TXT record, Cloudflare Proxy mode also needs this
  * environment variables
    * for runtime
    * during build time
  * deploio.yaml

* Do you have a CI?
  * Install nctl
  * Issue tokens
  * Update ref

* Does it actually run and how well?
  * Logs
    * stdout, nctl logs …
    * How to grep for errors?
    * ?
      * AppSignal
      * rorvswild
      * `…`
  * Metrics
    * Resource usage stats
    * Resource costs
  * Activity logs
  * Where does it run? DNS
  * What revision is live?
  * Increase log level
  * Call Nine
  * Need a database backup?
    * How to connect to the database from laptop? 0.0.0.0/0 per default, link to Nine for the rest
  * Rollback a deployment?
  * K8
    * You can actually download the k8 images and the config yaml files

* Security
  * User access permissions (nctl/gui)
  * zero-trust
    * Known issues: MySQL connection is unencrypted
  * TLS, letsencrypt
  * IP allowlists
  * HTTP only. And only one port. The rest is not proxied.
  * Backups
    * Retention time
  * Version control
  * Docker images
    * It's your responsibility
  * Buildpacks
    * We underlie your container on each (build/automatically?)

* Tools
  * GUI
  * CLI
  * API

* Stack
  * Swiss infrastructure: AS29691
  * Nutanix
  * Kubernetes
  * Docker
  * Heroku Buildpacks

Migrating from
* Heroku
  * DNS under control?
  * Resources/Addons
  * … consult Etienne for his guide


### Quick

* Quick start
* Getting started with
  * Rails
  * PHP
  * Node.js
  * Go
  * Python
  * Static HTML
  * Anything and a Dockerfile
* (Running it? Scaling it?)
* Debugging
* Support
