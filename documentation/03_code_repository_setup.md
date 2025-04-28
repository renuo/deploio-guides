---
title: Code Repository Setup
description: How to set up your code repository for Deploio
---

# Code Repository Setup

To deploy your application with Deploio, you must connect your code repository so that we can fetch your application code during the build process. We explain how to set it up in this section.

We support all major Git platforms, including GitHub, GitLab, Bitbucket, and private Git servers. This guide explains how to set up secure access and configure your repository properly.

### GitHub

[//]: # (TODO: not sure about this? There's no documentation and Cockpit doesn't give the option)

[//]: # (Deploio supports both **OAuth-based integration** via the GitHub App and **manual SSH access**.)

[//]: # (##### GitHub App &#40;Recommended&#41;)

[//]: # (- Navigate to the **Deploio Cockpit** and link your GitHub account.)

[//]: # (- Select the repositories you want to grant access to.)

[//]: # (- Deploio will securely fetch your code using GitHub’s API.)

[//]: # (- This is the easiest way to manage repository permissions without handling SSH keys manually.)

##### SSH Key Integration

1. **Generate an SSH key** (if you don’t have one yet):

   ```bash
   ssh-keygen -t ed25519 -C "deploio-access"
   ```
   Save it somewhere like `~/.ssh/deploio_id_ed25519`. Alternatively, you can use a tool like 1Password to generate and store the key securely.

2. **Add the public key to GitHub**  

   - Manually via GitHub:  
     Go to your repository → **Settings > Deploy Keys** → **Add deploy key**, give it a name, and paste the **public key**.  
     Only read access is required.
   
   - Or via the CLI:
     ```bash
     gh repo deploy-key add \
       --repo your-org/your-repo \
       --title deploio_deploy_key_main \
       < ~/.ssh/deploio_id_ed25519.pub
     ```

3. **Provide the private key to Deploio**  when creating the app in Cockpit or via `nctl`:

   This can be done via the `--git-ssh-private-key` flag or the `--git-ssh-private-key-from-file`
   flag to specify the SSH key to use:
   
   ```bash
   nctl create app main \
   --project my-project \
   --git-ssh-private-key-from-file=~/.ssh/deploio_id_ed25519
   ```

   > ⚠️ Ensure the key is unquoted — quotation marks around the private key must be removed before use.

You can view more details about creating the application in our [quick start guides](/quick_start).

### GitLab

Deploio works with both GitLab.com and self-hosted GitLab instances.

#### SSH Key Integration

Follow the same steps as GitHub: generate a key pair. To add the public key in GitLab, follow [this guide](https://docs.gitlab.com/user/project/deploy_keys/).

Then provide the private key when creating the app in Cockpit or via `nctl`, as in the GitHub example.

### Bitbucket

Deploio works with Bitbucket Cloud.

#### SSH Key Integration

Generate a key pair using the same steps as GitHub.  
To add the deploy key, follow [Bitbucket's SSH access docs](https://support.atlassian.com/bitbucket-cloud/docs/add-an-ssh-key-to-your-bitbucket-cloud-account/).

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
  
### Repository Access

#### 🔐 Private Repositories

- Require an SSH key to authenticate.
- Best practice: create a **read-only deploy key per application**.
- Periodically rotate keys for security
- Ensure your application has **access to the correct branch or tag**.

#### 🌍 Public Repositories

- No authentication needed.
- Simply provide the HTTPS or SSH URL
- Still recommended to **pin a specific branch or tag** to ensure stability.
