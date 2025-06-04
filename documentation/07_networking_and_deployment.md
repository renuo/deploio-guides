---
title: Networking & Deployment
---

# Networking & Deployment

Once your application is built and running, the next step is making it accessible to the world.

This section focuses on the external-facing aspects - domains, security, and deployment settings - that allow users to connect to your app. From settings up custom domains and SSL certificates to Cloudflare optimization, this is where you can configure how your app is seen and secured on the web.

## Setting up a custom domain

Cloudfront pure CDN - Cloudflare also manages DNS and SSL certificates for you.

If you want to use a Content Delivery Network (CDN) (e.g., Cloudflare, Amazon CloudFront, Akamai, etc.), you need to provide the CDN with your details of your Deploio application. The CDN will then serve your application to your users.

##### Check the app is running

Deploio provides a "first host" or default URL for your application. This is the URL that can be used initially to check if your application is running. You can find this on the Application page on the Cockpit under the **Hosts** tab. It is the host with status **"Default Host"**.

You can also find this by running the following command and looking under the HOSTS column:

```bash
nctl auth set-project {PROJECT_NAME}
nctl get app {APP_NAME}
```

:::note
This will list all hosts for the application. If you have added multiple hosts this will be the url that ends with "deploio.app".
:::

##### Create the domain

This will differ depending on the CDN you are using. However, the steps should be similar.

For example, if you are using Cloudflare, you can add a new domain record by going to the Cloudflare dashboard and clicking on the **"Add a domain"** button. Here you can enter an existing domain, or register a new domain. Of course, you will need to purchase the domain from a registrar for the setup to work.

Follow the instructions provided to create the domain. Once this is complete, you will need to set up the DNS records for the domain.

##### Create the DNS records

Your CDN should provide an overview of the DNS records for your domain, and allow you to add A, AAAA, CNAME, TXT etc. records for the domain.

For Deploio, you will need to add both a CNAME and TXT record.

The **CNAME** record will require a "Name", and we recommend using the domain or subdomain name. The target will be the **default url** for your application, as discussed [above](#check-the-app-is-running). We also recommend having the proxy set to "DNS only" to ensure a connection with no issues. You can change this to "proxied" at a later point if that is preferred, but disabling this to start will make things easier.

The **TXT** record will also require a "Name", and we recommend using the domain or subdomain name. The content can be found on the Application page on the Cockpit, under the **Hosts** tab. You will need to copy the **TXT Record Content** and paste it into the TXT record, with quotation marks. e.g.

```txt
"deploio-site-verification=application-name-abcdef123456"
```

##### Add the host to the application

Once you have added the DNS records, you can add the host to the application by going to the Application page on the Cockpit, and clicking on the **Edit** button. Under **Hosts** you can add as many hosts as you want. Of course, this should match the domain and/or subdomain you have added to the CDN.

You can then click on the **Update Application** button to save the changes.

##### Check the domain is working

Once you have added the DNS records, you can check if the domain is working by going back to the **Hosts** tab. Deploio will automatically check the status of the host, and if it is working, it will change to **"Verified"**. Please note that this might take some minutes.

Once the host is verified, you can visit the domain and check everything is working.

## Securing your application with SSL

##### Let's Encrypt

Deploio automatically handles SSL certificates using Let's Encrypt, so you don't need to manage them yourself. To use a custom domain, simply point it to the default URL provided by Deploio. This URL is already secured with SSL, ensuring your application is secure without additional configuration. You don't need to configure Nginx or any other web server manually, as Deploio takes care of the server configuration for you.

Whenever you add a custom host name, a corresponding Let's Encrypt SSL certificate will be created. You can see the status of these certificates via `nctl get app {APP_NAME} -o yaml`:

```yaml
kind: Application
...
status:
  atProvider:
    ...
    defaultHostsCertificateStatus: Issued
    customHostsCertificateStatus: Pending
```

As we are using the Lets Encrypt HTTP-01 challenge type, the certificate will only be successfully issued once all of your custom hostnames point to the Deploio infrastructure. We are using an optimized DNS resolving path to quickly react to DNS changes, but it might still take some minutes before the certificate can be issued.

Please also keep in mind that Lets Encrypt favors IPv6 DNS entries over IP4 ones. So if you have DNS AAAA records for your custom hostnames, make sure to delete them when migrating to Deploio (as Deploio does not support IPv6 currently).
