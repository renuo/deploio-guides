---
prev:
  text: Monitoring and Logs
  link: /user-guide/monitoring-and-logs
next:
  text: Troubleshooting
  link: /user-guide/troubleshooting
description: Overview of Deploio's security model including TLS, access control, secrets, network boundaries, container isolation, and best practices.
---

# Security

## TLS

All external access to Deploio applications is exclusively via **HTTPS on port 443**. No other external ports are supported.

### Automatic Let's Encrypt certificates

Deploio automatically provisions [Let's Encrypt](https://letsencrypt.org/) certificates for every application — both the default `deploio.app` domain and any custom hostnames you add.

Certificates are issued using the **HTTP-01 challenge type**, which means all your custom hostnames must have DNS pointing 
to Deploio infrastructure before a certificate can be issued. For full setup instructions, see [Network & Deployment](/user-guide/network-and-deployment.md#securing-your-application-with-ssl).

::: warning IPv6
Let's Encrypt favors IPv6 (AAAA) DNS records over IPv4. Since Deploio does not currently support IPv6, remove any AAAA records for your custom hostnames when migrating to Deploio — otherwise certificate issuance may fail.
:::

### Custom TLS certificates

**Deploio does not support custom TLS certificates.** The industry is moving toward [shorter certificate lifecycles (47 days by 2029)](https://www.digicert.com/blog/tls-certificate-lifetimes-will-officially-reduce-to-47-days), making automated issuance the standard.

If you need a certificate authority other than Let's Encrypt that supports automatic issuance, contact support@nine.ch.

## Access Control

### Basic authentication

Deploio has built-in HTTP Basic Auth for protecting non-production environments like staging. Credentials are auto-generated and managed by the platform.

```bash
# Enable basic auth
nctl create app my-app --basic-auth

# Retrieve credentials
nctl get app my-app --basic-auth-credentials

# Rotate the password
nctl update app my-app --change-basic-auth-password
```

You can also enable basic auth at the **project level** to protect all applications in a project:

```bash
nctl create config --basic-auth -p my-project
```

For full configuration options (including `deploio.yaml` and Cockpit), see [Configuring Your Application — Basic Authentication](/user-guide/configuring-your-application.md#basic-authentication).

### User access permissions

Access to Deploio is managed per organisation. You can invite users with specific roles (Administrator, Cockpit Access, Technical Contact)
to control who can view and manage your projects and applications. See the [Getting started guide](/user-guide/getting-started.md##setting-up-access-within-an-organization) for
details on user management.

## Secrets and Environment Variables

We recommend to store sensitive configuration — database URLs, API keys, credentials — as **runtime environment variables**. These are loaded at boot and are not baked into your container image.

```bash
nctl create app my-app \
  --env=DATABASE_URL:"postgres://user:password@host/db" \
  --env=SECRET_KEY_BASE:"your-secret-key"
```

**Build variables** (`--build-env`) are only available during the build phase and should be used for tools
like Webpacker or asset precompilation. Never put runtime secrets in build variables — they may be embedded in the image.

For full details, see [Configuring Your Application — Environment Variables](/user-guide/configuring-your-application.md#environment-variables).

## Repository Access

When connecting private repositories, use **deploy keys** (SSH) or **deploy tokens** (HTTPS) rather than personal access tokens. These are scoped to a single repository with read-only access.

We recommend the following best practices for repository access:
- Grant minimal permissions (read-only)
- Use one deploy key per application
- Rotate keys periodically

For platform-specific setup (GitHub, GitLab, Bitbucket), see [Code Repository Setup](/user-guide/code-repository-setup.md).

## Network Security

### Inbound traffic

Deploio only proxies **HTTP traffic on a single port**. All external access is HTTPS on port 443, handled by Deploio's ingress layer. No other inbound ports are exposed.

Your application sits behind a **TLS-termination proxy** that sets the following headers:

| Header | Description                                                                                                                                                              |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `X-Forwarded-Proto` | Whether the original connection was HTTP or HTTPS                                                                                                                        |
| `X-Forwarded-Host` | The original domain visited                                                                                                                                              |
| `X-Forwarded-For` / `X-Real-Ip` | The client's IP address                                                                                                                                                  |
| `X-Forwarded-Port` | The original request port                                                                                                                                                |
| `X-Original-Forwarded-For` | Contains the value of the X-Forwarded-For header set by a proxy in front of Deploio. This value should only be trusted if the proxy in front of Deploio can be trusted.  |

::: warning
Deploio does not add security headers like `Content-Security-Policy`, `Strict-Transport-Security`, or `X-Frame-Options`. Your application must set these itself.
:::

### Outbound traffic (egress)

Deploio does **not** restrict outgoing traffic. Your applications can access the internet freely — but this means you are fully responsible for the code you deploy and the connections it makes.

If you need a **static IP address** for outbound traffic (e.g., to allowlist with an external service), you can configure static egress in the Cockpit under the **Static Egress** tab, or see [docs.nine.ch](https://docs.nine.ch/docs/managed-kubernetes/nke/static-egress-nke/) for details.

## Container Security

### Buildpack applications

When you deploy with buildpacks, Deploio builds your container image automatically. Containers run with **restricted user privileges** (typically `uid=1000`, the `cnb` user). Write access is limited to specific ephemeral directories like `/workspace/tmp`.

Buildpack base images are maintained upstream and receive regular security updates. Deploio rebuilds your application on each deploy, picking up the latest base image.

### Dockerfile applications

When you use a Dockerfile, **you are responsible for the security of your image**. This includes:

- Choosing a secure, maintained base image
- Keeping dependencies up to date
- Not running as root unless necessary
- Not embedding secrets in the image

### Storage limits

All containers have a **2 GiB ephemeral storage limit**. If your application exceeds this, the container will be terminated (exit code 137). This storage is not persistent — anything written to the filesystem is lost on restart.

## Backups

Deploio managed databases (MySQL, PostgreSQL, MariaDB) include **automated daily backups** with a defined retention period. You can manage backups through `nctl` or the Cockpit.

Application containers themselves are **stateless** — there is nothing to back up. Your code lives in Git, your configuration in Deploio, and your data in managed databases or object storage.

## Encryption

All of our disks in virtual environments are encrypted at rest. This includes object storage, database disks and
ephemeral storage for application containers. Data in transit is encrypted using TLS.
