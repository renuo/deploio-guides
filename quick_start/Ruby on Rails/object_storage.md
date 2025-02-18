---
id: object_storage
title: Create an Object Storage for your Rails application
description: Learn how to setup Object Storage for your Rails application
displayed_sidebar: quickStartSidebar
sidebar_position: 4
---

# Create an Object Storage for your Rails application

<div class="summary">
Should you require a file upload or a writeable storage, you can use our S3-compatible object storage. 
You can see the pricing [here](https://docs.nine.ch/docs/object-storage/manage-buckets-and-users#pricing).
</div>

## Setup Object Storage

Currently, there's no dedicated command to create an object storage instance using `nctl`. However, you can create an object storage via the [Cockpit UI](https://cockpit.nine.ch/en/object_storage/storage/buckets/new). Select the desired project in the
dropdown and specify the location, which ideally is `nine-es34`, the same location as Deploio applications.

:::info
Even though the `nctl` CLI does not have a dedicated command for object storage, you can still create it using the
`nctl apply` command:
<details>
<summary>Example</summary>

Using a resource definition like the example below,
you can create an object storage instance using the `nctl apply -f bucket.yaml` command
and delete it using `nctl delete -f bucket.yaml`, respectively.

```yaml title="bucket.yaml"
apiVersion: storage.nine.ch/v1alpha1
kind: Bucket
metadata:
  name: example
  namespace: <project>
spec:
  forProvider:
    location: nine-cz42
    storageTier: standard
```

</details>
:::

## Retrieve Object Storage Information

After creating the object storage, you can view the access information by navigating to the details page of the newly
created **bucket**.

![Object Storage Panel](/img/object_storage_panel.png)

However, to interact with the created object storage, you need to create a **bucket user**. You can do this by navigating to
the "Bucket Users" tab in the Cockpit. The user needs to reside in the same location as the bucket. After creating the
user, you can retrieve the access key and secret key by clicking on "Show" in the "Credentials" row.

![Bucket User Panel](/img/bucket_user_panel.png)

<div class="centering">
![Bucket User Credentials](/img/bucket_user_credentials.png)
</div>

## Configure Active Storage

To use the object storage in your Rails application, you need to configure Active Storage. You can do this by
configuring a new service in the `config/storage.yml` file:

```yaml title="config/storage.yml"
deploio:
  service: S3
  access_key_id: <%= ENV["DEPLOIO_ACCESS_KEY"] %>
  secret_access_key: <%= ENV["DEPLOIO_SECRET_KEY"] %>
  endpoint: <%= ENV["DEPLOIO_ENDPOINT"] %>
  region: us-east-1 # equal to the default region in AWS since version 2
  bucket: <%= ENV["DEPLOIO_BUCKET"] %>
```

You can set the environment variables using the information you retrieved from the Cockpit:

```bash
nctl update application {application_name} --env="DEPLOIO_ACCESS_KEY={ACCESS_KEY};DEPLOIO_SECRET_KEY={SECRET_KEY};DEPLOIO_ENDPOINT={API_ENDPOINT};DEPLOIO_BUCKET={BUCKET_NAME}"
```

Finally, we can configure Active Storage to use the newly created service by setting the `service` configuration in the
production environment:

```ruby title="config/environments/production.rb"
config.active_storage.service = :deploio
```

## Next Steps

Do you need **background jobs** for your application? Proceed to the next step.
