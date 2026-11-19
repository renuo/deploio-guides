---
prev:
  text: Getting Started
  link: /user-guide/getting-started
next:
  text: Configuring Your Application
  link: /user-guide/configuring-your-application
description: Instructions for connecting Git repositories to Deploio using SSH deploy keys for GitHub, GitLab, Bitbucket, and private Git servers.
---

# Code Repository Setup

To deploy your application with Deploio, you must connect your code repository so that we
can fetch your application code during the build process. We explain how to set it up in this section.

We support all major Git platforms, including GitHub, GitLab, Bitbucket, and private Git servers.
This guide explains how to set up secure access and configure your repository properly.

### GitHub

[//]: # (TODO: speak to Nine about OAuth support - I would expect a button to authorize with GitHub)

Deploio fetches your code with a [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#deploy-keys):
read-only access to exactly one repository.
For that, we create a **temporary SSH key** just for Deploio.
Never upload your personal SSH key.

::: info
Alternatively, you can create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)
with read-only access to the repository's contents.
Pass it to `nctl` with `--git-username` and `--git-password` and an HTTPS `--git-url`.
:::

We use the [GitHub CLI](https://cli.github.com/), so the key never passes through your hands.
First, create the key pair in a temporary directory:

```sh
KEY_DIR=$(mktemp -d)
ssh-keygen -t ed25519 -N "" -C "deploio-{APP_NAME}" -f "$KEY_DIR/id_ed25519"
```

Register the public key as a read-only deploy key:

```sh
gh repo deploy-key add "$KEY_DIR/id_ed25519.pub" \
  --repo {GITHUB_OWNER}/{GITHUB_REPO} \
  --title "deploio-{APP_NAME}"
```

Hand the private key to Deploio.
For an existing app, use `nctl update app` instead.

```sh
nctl create app {APP_NAME} \
  --git-url=git@github.com:{GITHUB_OWNER}/{GITHUB_REPO}.git \
  --git-ssh-private-key-from-file="$KEY_DIR/id_ed25519"
```

Finally, delete the temporary key:

```sh
rm -r "$KEY_DIR"
```

### GitLab

Deploio works with both GitLab.com and self-hosted GitLab instances.

#### SSH Key Integration

Follow the same steps as GitHub: generate a key pair. To add the public key in GitLab, follow [this guide](https://docs.gitlab.com/user/project/deploy_keys/).

Then provide the private key when creating the app in Cockpit or via `nctl`, as in the GitHub example.

### Bitbucket

Deploio works with Bitbucket Cloud.

#### SSH Key Integration

Generate a key pair using the same steps as GitHub.
To add the deploy key, follow [Bitbucket's SSH access docs](https://support.atlassian.com/bitbucket-cloud/docs/configure-ssh-and-two-step-verification/).

Then provide the private key when creating the app in Cockpit or via `nctl`, as in the GitHub example.

### Private git server

If you're using a custom Git server (e.g., Gitea, Gitolite, bare Git over SSH):

1. Ensure the server is accessible from Deploio's build environment (no firewall blocks).
2. Add a **deploy key** (the SSH public key) to your Git server. The method will depend on the server type.
3. Provide the **private key** to Deploio just like with GitHub/GitLab.
4. Use the full SSH path for the repository:

   ```bash
   git@yourserver.com:org/repo.git
   ```

## Repository Access

Once you have successfully connected your git repository, Deploio starts polling every minute for new changes, unless
your git revision points to a specific commit hash. In that case, Deploio will not poll at all until you update the hash
via CLI or Cockpit.

#### 🔐 Private Repositories

- Require an SSH key to authenticate.
- Best practice: create a **read-only deploy key per application**.
- Periodically rotate keys for security.
- Ensure your application has **access to the correct branch or tag**.

#### 🌍 Public Repositories

- No authentication needed.
- Simply provide the HTTPS or SSH URL.
- Still recommended to **pin a specific branch or tag** to ensure stability.
