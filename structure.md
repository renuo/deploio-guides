---
sidebar_label: 'Getting started with Deploio'
sidebar_position: 1
---


# /

### Getting started with Deploio

You've got a project written in..
* Ruby
* PHP
* Node.js
* Go
* Python
* Static HTML
* Anything and a Dockerfile

(Each of these can be a button which take you to a language/framework specific guide. e.g. Ruby has:
* Getting started on Deploio with Ruby
* Supported versions and some technical details?
* User guide and examples (should be as straight forward as possible to get app running))

12 squares linking to documentation:

### 1. Getting Started
* Install nctl: Step-by-step instructions for setup.
* Creating an account with Deploio / nctl
* First Login: Test your connection with `nctl`.
* Links to more information on the nctl commands
* Setting up your first project and organizing projects efficiently
* Links to guides and quick-start resources
* Avoid commom pitfalls
* Best Practices for Beginners
  * Suggested defaults for deployment configurations.
  * Security guidelines for managing secrets and roles.

### 2. How Deploio Works
* Repo, Build, Release process
* Workflow:
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
* Glossary of key terms
  * Project: A logical grouping of applications and services.
  * Deployment: The process of delivering your application live.
  * nctl: The command-line tool for advanced management.
  * UI: The user-friendly web interface for simpler tasks.
* Support languages (each with quick start guide) but more details on [docs.nine.ch](https://docs.nine.ch) for detailed configuration.

### 3. Code Repository Setup
* On Github
  * Github app (OAuth)
* On Gitlab
* On Bitbucket
* On a private git server
* Managing repository access
  * Private
    * SSH
  * Public

### 4. Dependencies and Add-Ons
* Database?
  * Backup and restore (e.g., database snapshots)
  * Monitoring
* Key Value store?
* Object storage
* Persistent volume?
  * Limits?

### 5. Configuring Your Application
* Caveat: Procfile only for web process
* Proxied to the web? (deploio.yaml?, Procfile) If yes:
  * Protect it with basic auth
  * Make it reachable under custom domains
    * Host names
    * Lets Encrypt
  * Route it with custom ports
* Unproxied worker jobs? (deploio.yaml)
  * Sidekiq
  * …
* Deployment jobs (deploio.yaml)
  * database migrations

### 6. Additional Configuration
* Environment variables
  * for runtime
  * during build time
* Domain names
  * CDN, Cloudflare
    * Apex domains need TXT record, Cloudflare Proxy mode also needs this
* deploio.yaml

### 7. CI/CD Integration
* Install nctl on CI pipelines
* Issue tokens for automated deployment
* Trigger deployments on ref updates
* Deployment strategies:
  * Rolling
  * Blue/green
  * Anything else?
    * Detailed guides available on [docs.nine.ch](https://docs.nine.ch).
* Automate deployments using scripts and integrate with CI/CD pipelines.

### 8. Monitoring and Logs
* Logs
  * stdout, nctl logs …
  * How to grep for errors?
  * ?
    * AppSignal
    * rorvswild
    * `…`
* Performance metrics (nctl stats)
  * Resource usage stats
  * Resource costs
* Activity logs
* Where does it run? DNS
* What revision is live?
* Increase log level
* Need a database backup?
  * How to connect to the database from laptop? 0.0.0.0/0 per default, link to Nine for the rest
* Rollback a deployment?
* K8
  * You can actually download the k8 images and the config yaml files
* Common Issues
  * Fixing connection problems.
  * Debugging deployment errors.
* Support
  * Comprehensive guides on [docs.nine.ch](https://docs.nine.ch).
  * Call Nine
  * Join the Slack workspace

### 9. Security
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

### 10. Tools
* Deploio GUI
  * View deployments.
  * Retrieve logs.
  * Basic application management.
  * Ideal for quick tasks or when automation isn't required
* nctl CLI
  * Scripting and automation capabilities.
  * Flexible deployment workflows.
  * Best for advanced users and automated workflows.
* API
  * programmatic interaction
  * nctl is a wrapper around this

### 11. Migrating from other platforms
* Retrieving and "restoring" databases
* Fetching env vars
* Updating DNS records
* Adapting deployment workflows for Deploio

### 12. Stack
* Swiss infrastructure (AS29691)
* Nutanix
* Kubernetes
* Docker
* Heroku Buildpacks
* Container-based infrastructure

---

# /about_deploio

### **What is Deploio and how does it simplify your work?**

- Deploio is a container-based infrastructure platform designed to streamline your deployment processes and application management.
- Seamless deployment with tools like `nctl` and Deploio's UI.

### **Who benefits from Deploio?**

- **Target Audience:** Developers and teams looking for an efficient way to manage deployments.
- **Advantages:**
  - Simplified deployment workflows.
  - Automation and scripting capabilities.
  - Integrated monitoring and database management.

### **About Nine & Renuo**

- Optionally introduce Nine and Renuo, their collaboration, and how Deploio fits within their ecosystem.

---

# /quick_start

Similar to on the homepage, tiles for each language taking you to a simple guide:

You've got a project written in..
* Ruby
* PHP
* Node.js
* Go
* Python
* Static HTML
* Anything and a Dockerfile

---

# /documentation

Will be the structured version of the 12 tiles, with the structure down the left side (see mockups on Figma).

