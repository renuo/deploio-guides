---
prev:
  text: Key/Value storage
  link: /php/key-value-storage
next:
  text: Background jobs
  link: /php/background-jobs
---

# Create an Object Storage for your PHP application

::: info
Should you require a file upload or a writeable storage, you can use our S3-compatible object storage.
You can see the pricing [here](https://docs.nine.ch/docs/object-storage/manage-buckets-and-users#pricing).
:::

## Setup Object Storage

Currently, there's no dedicated command to create an object storage instance using `nctl`. However, you can create an
object storage via the [Cockpit UI](https://cockpit.nine.ch/en/object_storage/storage/buckets/new). Select the desired
project in the dropdown and specify the location, which ideally is `nine-es34`, the same location as Deploio
applications. For more information about our data center locations, see our
[locations documentation](https://docs.nine.ch/docs/managed-kubernetes/nke/nine-kubernetes-engine#locations).

::: info
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
    location: nine-es34
    storageTier: standard
```

</details>
:::

## Retrieve Object Storage Information

After creating the object storage, you can view the access information by navigating to the details page of the newly
created **bucket**.

![Object Storage Panel](/img/object_storage_panel.png)

However, to interact with the created object storage, you need to create a **bucket user**. You can do this by
clicking "Add User" on the bucket page and creating the user. The user needs to reside in the same location as the
bucket. After creating the user, you can retrieve the access key and secret key by clicking on "Show" in the
"Credentials" row.

![Bucket User Panel](/img/bucket_user_panel.png)

![Bucket User Credentials](/img/bucket_user_credentials.png)

You will need the access key and the secret key, the user name is not used on the client.

## Configure your PHP Application

S3 can not be mounted as a local filesystem, so you need a client to let PHP interact with S3. In the example
application, we use [Flysystem](https://flysystem.thephpleague.com/docs/) with the
[S3 plugin](https://flysystem.thephpleague.com/docs/adapter/aws-s3-v3/) (which itself uses the AWS SDK for PHP).
The `league/flysystem-bundle` does not support specifying the connection as DSN, therefore we added
`webalternatif/flysystem-dsn-bundle`. The configuration looks like this (note that you can define multiple adapters if
you want to connect to multiple buckets. For each bucket, you would use a different DSN.)

```yaml title="config/flysystem.yml"
webf_flysystem_dsn:
  adapters:
    persistent_adapter: '%env(STORAGE_URL)%'

flysystem:
  storages:
    persistent.storage:
      adapter: webf_flysystem_dsn.adapter.persistent_adapter
```

You can set the environment variables using the information you retrieved from the Cockpit:

```bash
nctl update app {application_name} --env="STORAGE_URL=s3://{ACCESS KEY}:{SECRET KEY}@es34.objects.nineapis.ch?region=us-east-1&bucket={NAME}"
```

::: info
For S3, a `region` must be specified. Deploio uses the S3 default value of `us-east-1`, even though the servers are in
Switzerland, operated by Nine.
:::

## Next Steps

Do you need **background jobs** for your application? Proceed to the next step.
