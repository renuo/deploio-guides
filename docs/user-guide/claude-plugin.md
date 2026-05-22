---
prev:
  text: Tools
  link: /user-guide/tools
next:
  text: Migrating from other platforms
  link: /user-guide/migrating-from-other-platforms
description: Deploy and manage Deploio apps using plain English in Claude Code. No CLI commands to memorise.
---

# Claude Code Plugin

The **deploio-claude-plugin** lets you deploy and manage your apps on Deploio through plain-language prompts in [Claude Code](https://claude.ai/code). No need to memorise `nctl` commands. Just describe what you want and Claude handles the rest.

```
Deploy my Rails app to Deploio
```

```
My app is throwing 503s, what's wrong?
```

```
Add a PostgreSQL database and wire it up
```

Claude Code picks the right skill automatically, confirms its plan with you, and runs `nctl` on your behalf. Destructive operations always require explicit confirmation.

::: info Community tool
This plugin is created and maintained by [Renuo](https://renuo.ch). Source code is available on [GitHub](https://github.com/renuo/deploio-claude-plugin).
:::

## Prerequisites

1. **Claude Code** installed ([get it here](https://claude.ai/code))
2. **nctl v1.16.0+** installed and authenticated:

```bash
# macOS
brew install ninech/tap/nctl

# Linux: download from https://github.com/ninech/nctl/releases/latest
```

```bash
nctl auth login   # opens browser OAuth
nctl auth whoami  # verify access
```

## Installation

Run this from your project directory (or anywhere for a global install):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/renuo/deploio-claude-plugin/main/install.sh)"
```

The installer asks whether to install **globally** (`~/.claude/`) or **per-project** (`./.claude/`). For non-interactive use:

```bash
DEPLOIO_INSTALL_SCOPE=global /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/renuo/deploio-claude-plugin/main/install.sh)"
# or
DEPLOIO_INSTALL_SCOPE=project /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/renuo/deploio-claude-plugin/main/install.sh)"
```

**To update:** re-run the same install command. It overwrites with the latest version.

**To uninstall:**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/renuo/deploio-claude-plugin/main/uninstall.sh)"
```

## Skills

The plugin installs five skills that Claude selects automatically from your prompt. You never need to invoke them by name.

| Skill | What it does | Example triggers |
|---|---|---|
| **deploio-deploy** | First-time deployment from a git repo to a live HTTPS URL | "Deploy my app", "Host on Deploio", "Create a Deploio app" |
| **deploio-manage** | Day-to-day operations on running apps | "Scale to 3 replicas", "Add env var", "Tail the logs", "Roll back" |
| **deploio-debug** | Autonomous diagnosis: pulls logs, inspects releases, proposes a fix | "App is throwing 503s", "Deploy failing", "Why is my app crashing?" |
| **deploio-provision** | Provision backing services (databases, Redis, object storage) and wire them to your app | "Add Postgres", "I need Redis", "Set up S3 storage" |
| **deploio-ci-cd** | Generate CI/CD pipeline config and a Deploio service account | "Set up GitHub Actions", "Auto-deploy on push", "Add a staging environment" |

### First deploy: `deploio-deploy`

Detects your framework automatically and configures sensible defaults. Presents a plan card before touching anything.

Supported frameworks: **Rails, Node.js, Django, Flask/FastAPI, PHP/Laravel, Go, Docker**

Example prompts:
```
Deploy my Rails app to Deploio
Host my Next.js app on Deploio
```

### Day-to-day management: `deploio-manage`

Covers everything once your app is running. Infers your app name and project from the git remote before asking.

```
Scale my app to 3 replicas
Add DATABASE_URL env var
Tail the logs
Open a Rails console
Roll back to the last working version
Add a Sidekiq worker
Set up a custom domain
Restart the app
```

### Debugging: `deploio-debug`

Runs a parallel investigation across build logs, release history, and runtime stats without waiting for you to describe symptoms in detail. Reports a plain-language diagnosis and offers to apply the fix directly.

```
My app keeps crashing after the latest deploy
Getting 503 bad gateway errors
Build is failing, what's wrong?
App is using too much memory
```

### Backing services: `deploio-provision`

Creates the service, extracts credentials, and injects the correct environment variables into your app. Verifies connectivity after wiring.

| Service | Injected env var(s) |
|---|---|
| PostgreSQL (Economy / Business) | `DATABASE_URL` |
| MySQL (Economy / Business) | `DATABASE_URL` |
| Redis-compatible KVS | `REDIS_URL` |
| OpenSearch | `OPENSEARCH_URL` |
| S3-compatible Object Storage | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `S3_ENDPOINT` |

```
Add a PostgreSQL database and wire it up
I need Redis for Sidekiq
Set up S3-compatible object storage
Add a Sidekiq worker
```

### CI/CD pipeline: `deploio-ci-cd`

Creates a Deploio service account and writes the workflow file for your CI platform, then guides you through adding the three required secrets.

Supported platforms: **GitHub Actions, GitLab CI, CircleCI, Bitbucket Pipelines**, and any Debian/Ubuntu-based CI system.

Patterns available:
- **Single environment:** push to `main` to deploy
- **Multi-environment:** `develop` to staging, `main` to production
- **Per-PR preview environments:** app created on PR open, deleted on PR close

```
Set up GitHub Actions to auto-deploy on push to main
Add a staging environment
Create per-PR preview apps on Deploio
```

## Slash commands

Two shortcut commands are available after installation:

| Command | Effect |
|---|---|
| `/deploy` | Triggers the deploy skill directly |
| `/debug` | Triggers the debug skill directly |

## Safety

- **Confirmation before destructive actions:** deleting apps, databases, or storage; pausing an app; running destructive database tasks (`db:drop`, `db:reset`) all require explicit user confirmation.
- **Plan before action:** every skill describes what it will do before running any `nctl` command.
- **Least privilege:** the CI/CD service account is project-scoped with minimal permissions.
