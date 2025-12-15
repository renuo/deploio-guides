---
prev:
  text: Key/Value storage
  link: /ruby/key-value-storage
next:
  text: Background jobs
  link: /ruby/background-jobs
---
# Create an Object Storage for your Rails application

::: info
Should you require a file upload or a writeable storage, you can use our S3-compatible object storage.
You can see the pricing [here](https://docs.nine.ch/docs/object-storage/manage-buckets-and-users#pricing).
:::

## Setup Object Storage

Currently, there's no dedicated command to create an object storage instance using `nctl`. However, you can create an
object storage via the [Cockpit UI](https://cockpit.nine.ch/en/object_storage/storage/buckets/new). Select the desired
project in the dropdown and specify the location, which ideally is `nine-es34`, the same location as Deploio
applications. For more information about our data center locations, see our [locations documentation](https://docs.nine.ch/docs/managed-kubernetes/nke/nine-kubernetes-engine#locations).

## Retrieve Object Storage Information

After creating the object storage, you can view the access information by navigating to the details page of the newly
created **bucket**.

![Object Storage Panel](/img/object_storage_panel.png)

However, to interact with the created object storage, you need to create a **bucket user**. You can do this by
navigating to the "Bucket Users" tab in the Cockpit. The user needs to reside in the same location as the bucket. After
creating the user, you can retrieve the access key and secret key by clicking on "Show" in the "Credentials" row.

![Bucket User Panel](/img/bucket_user_panel.png)

![Bucket User Credentials](/img/bucket_user_credentials.png)

## Configure Active Storage

To use the object storage in your Rails application, you need to configure Active Storage. You can do this by
configuring a new service in the `config/storage.yml` file:

```yaml title="config/storage.yml"
deploio:
  service: S3
  access_key_id: <%= ENV["DEPLOIO_ACCESS_KEY"] %>
  secret_access_key: <%= ENV["DEPLOIO_SECRET_KEY"] %>
  endpoint: <%= ENV["DEPLOIO_ENDPOINT"] %> # e.g. `https://es34.objects.nineapis.ch`
  region: us-east-1 # running in Switzerland
  bucket: <%= ENV["DEPLOIO_BUCKET"] %>
```

::: info
For S3, a `region` must be specified. Deploio uses the S3 default value of `us-east-1`, even though the servers are in
Switzerland, operated by Nine.
:::

You can set the environment variables using the information you retrieved from the Cockpit:

```bash
nctl update app {application_name} --env="DEPLOIO_ACCESS_KEY={ACCESS_KEY};DEPLOIO_SECRET_KEY={SECRET_KEY};DEPLOIO_ENDPOINT={API_ENDPOINT};DEPLOIO_BUCKET={BUCKET_NAME}"
```

Finally, you can configure Active Storage to use the newly created service by setting the `service` configuration in the
production environment:

```ruby title="config/environments/production.rb"
config.active_storage.service = :deploio
```

### Custom Hostnames

To use custom hostnames for buckets, you first have to open your bucket in the Cockpit UI.
Then, edit the custom hostnames and verify them via TXT record.

Next, create an Active Storage service in Rails:

```ruby title="lib/active_storage/service/deploio_s3_service.rb"
require "active_storage/service/s3_service"

module ActiveStorage
  class Service
    class DeploioS3Service < ActiveStorage::Service::S3Service
      def initialize(host: nil, **)
        @host = host
        super(**)
      end

      def url(...)
        @host.blank? ? super : custom_host(super)
      end

      def url_for_direct_upload(...)
        @host.blank? ? super : custom_host(super)
      end

      private

      def custom_host(uri)
        uri = URI.parse(uri)
        uri.host = @host
        uri.to_s
      end
    end
  end
end
```

Finally, change the config to use the new service:

```diff title="config/storage.yml"
deploio:
- service: S3
+ service: DeploioS3
  access_key_id: <%= ENV["DEPLOIO_ACCESS_KEY"] %>
  secret_access_key: <%= ENV["DEPLOIO_SECRET_KEY"] %>
  endpoint: <%= ENV["DEPLOIO_ENDPOINT"] %> # e.g. `https://es34.objects.nineapis.ch`
  region: us-east-1 # running in Switzerland
  bucket: <%= ENV["DEPLOIO_BUCKET"] %>
+ host: <%= ENV["DEPLOIO_HOST"] %> # e.g. `assets.example.com`
```

## Next Steps

Do you need **background jobs** for your application? Proceed to the next step.
