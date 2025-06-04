---
title: Networking & Deployment
---

# Networking & Deployment

Once your application is built and running, the next step is making it accessible to the world.

This section focuses on the external-facing aspects - domains, security, and deployment configuration - that allow users to connect to your app. In this section, you will learn how to configure how your app is seen and secured on the web.

## Setting up a custom domain

If you are using a service that manages DNS and SSL certificates for you (e.g., Cloudflare), you need to provide the service with the details of your Deploio application. The service will then route traffic to your application.

##### Check the app is running

Deploio provides a "first host" or default URL for your application. This URL can be used initially to check if your application is running. You can find it on the Application page in the Cockpit under the **Hosts** tab. It is the host with the status **"Default Host"**.

You can also find this by running the following command and looking under the HOSTS column:

```bash
nctl auth set-project {PROJECT_NAME}
nctl get app {APP_NAME}
```

:::note
This will list all hosts for the application. If you have added multiple hosts, the default host will be the URL that ends with "deploio.app".
:::

##### Create the domain

This will differ depending on the service you are using. However, the steps should be similar.

For example, if you are using Cloudflare, you can add a new domain by going to the Cloudflare dashboard and clicking on the **"Add a domain"** button. Here, you can enter an existing domain or register a new one. You will need to purchase the domain from a registrar for the setup to work.

Follow the instructions provided to create the domain. Once this is complete, you will need to set up the DNS records for the domain.

##### Create the DNS records

Your service should provide an overview of the DNS records for your domain and allow you to add A, AAAA, CNAME, TXT, etc. records.

For Deploio, you will need to add both a CNAME and TXT record.

The **CNAME** record will require a "Name", and we recommend using the domain or subdomain name. The target will be the **default URL** for your application, as discussed [above](#check-the-app-is-running). We also recommend setting the proxy to "DNS only" to ensure there are no connection issues. You can change this to "proxied" later if preferred, but disabling it initially will help ensure any connection issues are not caused by the proxy.

The **TXT** record will also require a "Name", and we recommend using the domain or subdomain name. The content can be found on the Application page in the Cockpit, under the **Hosts** tab. Copy the **TXT Record Content** and paste it into the TXT record, including the quotation marks. For example:

```txt
"deploio-site-verification=application-name-abcdef123456"
```

##### Add the host to the application

Once you have added the DNS records, you can add the host to the application by going to the Application page in the Cockpit and clicking on the **Edit** button. Under **Hosts**, you can add as many hosts as you want. These should match the domain and/or subdomain you have configured.

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
