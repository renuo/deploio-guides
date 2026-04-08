---
prev:
  text: Other dependencies
  link: /user-guide/other-dependencies
next:
  text: CI/CD Integration
  link: /user-guide/ci-cd-integration
description: Guide for setting up custom domains with DNS records (CNAME and TXT) and configuring automatic SSL certificates via Let's Encrypt on Deploio.
---

# Network & Deployment

Once your application is built and running, the next step is making it accessible to the world.

This section focuses on the external-facing aspects - domains, security, static IPs and deployment configuration - that 
allow users to connect to your app. In this section, you will learn how to configure how your app is seen and secured on the web.

## Setting up a custom domain

If you are using a service that manages DNS and SSL certificates for you (e.g., Cloudflare), you need to provide the service with the details of your Deploio application. The service will then route traffic to your application.

##### Check the app is running

Deploio provides a "first host" or default URL for your application. This URL can be used initially to check if your application is running. You can find this by running the following command and looking under the HOSTS column:

```bash
nctl auth set-project {PROJECT_NAME}
nctl get app {APP_NAME}
```

::: info
This will list all hosts for the application. If you have added multiple hosts, the default host will be the URL that ends with "deploio.app".
:::

Alternatively, you can find the default host on the Application page in the Cockpit under the **Hosts** tab. It is the host with the status **"Default Host"**.

##### Create the domain

This will differ depending on the service you are using. However, the steps should be similar.

For example, if you are using Cloudflare, you can add a new domain by going to the Cloudflare dashboard and clicking on the **"Add a domain"** button. Here, you can enter an existing domain or register a new one. You will need to purchase the domain from a registrar for the setup to work.

Follow the instructions provided to create the domain. Once this is complete, you will need to set up the DNS records for the domain.

##### Create the DNS records

Your service should provide an overview of the DNS records for your domain and allow you to add A, AAAA, CNAME, TXT, etc. records.

For Deploio, you will need to add both a CNAME and TXT record.

The **CNAME** record will require a "Name" field, which should match the domain or subdomain you want to use for your application
. The target will be the **default URL** for your application, as discussed [above](#check-the-app-is-running). If your DNS provider offers proxy settings (like cyon.ch or other providers), we recommend initially setting it to direct DNS routing without proxying to ensure there are no connection issues. You can enable proxying features later if needed, but disabling them initially will help troubleshoot any connection problems.

The **TXT** record will also require a "Name" field. The content for the TXT record can be found on the Application page in the Cockpit, under the **Hosts** tab. Copy the **TXT Record Content** and paste it into the TXT record, including the quotation marks. For example:

```txt
"deploio-site-verification=application-name-abcdef123456"
```

::: info SSL and Let's Encrypt
Once your DNS records are properly configured and verified, Deploio automatically provisions SSL certificates for your domains through Let's Encrypt. The TXT record not only verifies your domain ownership for Deploio but also helps with the domain validation process that Let's Encrypt requires. This automated process ensures your application is secured with HTTPS without any manual certificate management. For more details about SSL certificates, see the [Securing your application with SSL](#securing-your-application-with-ssl) section below.
:::

##### Add the host to the application

Once you have added the DNS records, you can add the host to the application. This can be done via `nctl update app {APP_NAME} --hosts="..."`.

It is important to note that this will replace any existing hosts for the application configuration. Therefore, we would recommend checking the existing configuration, adding any hosts as desired, and updating the application.

For example, first get the host configuration for the application:

```bash
nctl get app {APP_NAME} --project {PROJECT_NAME}
```

The output will look something like this:

```plaintext
PROJECT           NAME          REPLICAS    WORKERJOBS    HOSTS              UNVERIFIEDHOSTS
{PROJECT_NAME}    {APP_NAME}    1           0             abc.com,xyz.com    <none>
```

You can then update the application with the new host configuration:

```bash
nctl update app {APP_NAME} --hosts="abc.com,xyz.com,newhost.com" --project {PROJECT_NAME}
```

Alternatively, you can visit the Application page in the **Cockpit** and click on the **Edit** button. Under **Hosts**, you can add as many hosts as you want. These should match the domain and/or subdomain you have configured.

You can then click on the **Update Application** button to save the changes.

##### Check the domain is working

Once you have added the DNS records, you can check if the domain is working by returning to the **Hosts** tab. Deploio will automatically check the status of the host, and if it is working, it will change to **"Verified"**. Please note that this might take a few minutes.

Once the host is verified, you can visit the domain and check everything is working.

## Securing your application with SSL

##### Let's Encrypt

Deploio automatically handles SSL certificates using Let's Encrypt, so you don't need to manage them yourself. To use a custom domain, simply point it to the default URL provided by Deploio. This URL is already secured with SSL, ensuring your application is secure without additional configuration. You don't need to configure Nginx or any other web server manually — Deploio takes care of the server configuration for you.

Whenever you add a custom hostname, a corresponding Let's Encrypt SSL certificate will be created. You can see the status of these certificates via `nctl get app {APP_NAME} -o yaml`:

```yaml
kind: Application
...
status:
  atProvider:
    ...
    defaultHostsCertificateStatus: Issued
    customHostsCertificateStatus: Pending
```

As we are using the Let's Encrypt HTTP-01 challenge type, the certificate will only be successfully issued once all of your custom hostnames point to the Deploio infrastructure. We use an optimized DNS resolving path to quickly react to DNS changes, but it might still take a few minutes before the certificate can be issued.

Please also keep in mind that Let's Encrypt favors IPv6 DNS entries over IPv4 ones. If you have DNS AAAA records for your custom hostnames, make sure to delete them when migrating to Deploio (as Deploio does not currently support IPv6).

## Static egress IP

We provide the option to configure a static egress IP address.
This ensures that outgoing traffic from your Deploio application always comes from the same IP address.
The same IP address will also be used for worker and scheduled jobs.

::: info Why?
For example if your app talks to an on-site backend which is guarded by a firewall
allowing only traffic from specific IP addresses.

In order to configure a static egress IP, follow these instructions:

1. Replace the placeholders in the following YAML configuration and save it as `deploio-static-egress.yaml`

```yaml
apiVersion: networking.nine.ch/v1alpha1
kind: StaticEgress
metadata:
  name: my-deploio-static-egress
  namespace: <REPLACE WITH PROJECT OF APPLICATION>
spec:
  forProvider:
    disabled: false
    target:
      group: apps.nine.ch
      kind: Application
      name: <REPLACE WITH NAME OF APPLICATION>
```

2. Apply the configuration

```bash
nctl apply -f deploio-static-egress.yaml
```

Once the configuration is applied, all egress traffic will come from the same IP address. You can find the IP address by
running the following command:

```bash
kubectl --context nineapis.ch get staticegress my-deploio-static-egress \
        -n <NAME OF PROJECT> -o yaml
```

See the [Nine Technical Reference](https://docs.nine.ch/docs/managed-kubernetes/nke/static-egress-nke/?client=kubectl#details)
for more details about the static egress feature.
