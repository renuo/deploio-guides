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

The **deploio-claude-plugin** adds Deploio skills to [Claude Code](https://claude.ai/code). Instead of looking up `nctl`
commands, you describe what you want:

```
Deploy my Rails app to Deploio
My app is throwing 503s, what's wrong?
Add a PostgreSQL database and wire it up
Set up GitHub Actions to deploy on push
```

Claude picks the right skill, explains what it will do, and runs `nctl` on your behalf. Destructive operations always
require explicit confirmation.

::: info Community tool
Created and maintained by [Renuo](https://renuo.ch). Source on [GitHub](https://github.com/renuo/deploio-claude-plugin).
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

The installer asks whether to install **globally** (`~/.claude/`) or **per-project** (`./.claude/`). For non-interactive
use:

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

Five skills are installed. Claude selects the right one based on what you ask.

| Skill                 | What it covers                                                |
|-----------------------|---------------------------------------------------------------|
| **deploio-deploy**    | First-time deployment from a git repo to a live HTTPS URL     |
| **deploio-manage**    | Day-to-day operations on running apps                         |
| **deploio-debug**     | Diagnosing and fixing crashes, failed deployments, and errors |
| **deploio-provision** | Provisioning databases, Redis, and object storage             |
| **deploio-ci-cd**     | Setting up automated deployment pipelines                     |

### First deploy: `deploio-deploy`

Detects your framework, sets sensible defaults, and shows you a plan before touching anything.

Supported frameworks: **Rails, Node.js, Django, Flask/FastAPI, PHP/Laravel, Go, Docker**

```
Deploy my Rails app to Deploio
Host my Next.js app on Deploio
```

### Day-to-day management: `deploio-manage`

Handles everything on a running app. Picks up your app name and project from the git remote so you don't have to specify
them.

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

Fetches build logs, release history, and runtime stats in parallel, then tells you what went wrong and offers to fix it.

```
My app crashed after the latest deploy
Getting 503 bad gateway errors
Build is failing, what's wrong?
App is using too much memory
```

### Backing services: `deploio-provision`

Creates the service, extracts credentials, and sets the right environment variables on your app.

| Service                         | Injected env var(s)                                                                    |
|---------------------------------|----------------------------------------------------------------------------------------|
| PostgreSQL (Economy / Business) | `DATABASE_URL`                                                                         |
| MySQL (Economy / Business)      | `DATABASE_URL`                                                                         |
| Redis-compatible KVS            | `REDIS_URL`                                                                            |
| OpenSearch                      | `OPENSEARCH_URL`                                                                       |
| S3-compatible Object Storage    | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `S3_ENDPOINT` |

```
Add a PostgreSQL database and wire it up
I need Redis for Sidekiq
Set up S3-compatible object storage
```

### CI/CD pipeline: `deploio-ci-cd`

Creates a Deploio service account, writes the workflow file, and walks you through adding the required secrets to your
CI platform.

Supported platforms: **GitHub Actions, GitLab CI, CircleCI, Bitbucket Pipelines**, and any Debian/Ubuntu-based CI
system.

Available patterns:

- **Single environment:** push to `main` to deploy
- **Multi-environment:** `develop` to staging, `main` to production
- **Per-PR preview environments:** app created on PR open, deleted on PR close

```
Set up GitHub Actions to auto-deploy on push to main
Add a staging environment
Create per-PR preview apps on Deploio
```

## Slash commands

Two shortcuts are installed alongside the skills:

| Command   | Effect                             |
|-----------|------------------------------------|
| `/deploy` | Triggers the deploy skill directly |
| `/debug`  | Triggers the debug skill directly  |

## Safety

- **Destructive operations require confirmation:** deleting apps, databases, or storage; pausing an app; running
  `db:drop` or `db:reset` all prompt you before proceeding.
- **Plan before action:** every skill describes what it will do before running any `nctl` command.
- **Least privilege:** the CI/CD service account is project-scoped with minimal permissions.
