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

You can create a bucket via `nctl create bucket --location=nine-es34 {BUCKET_NAME}`.
Ideally, the location is `nine-es34`, which is the same as Deploio's.
For more information about our data center locations, see our
[locations documentation](https://docs.nine.ch/docs/managed-kubernetes/nke/nine-kubernetes-engine#locations).

In order to access the created bucket, you must first create a **bucket user**.
This user must be created in the same location as the bucket.
You can do this by running the following:

```sh
nctl create bucketuser --location=nine-es34 {BUCKETUSER_NAME}
```

After creating the user, you can retrieve the access key and secret key:

```sh
nctl get bucketuser {BUCKETUSER_NAME} --print-credentials
```

And set the environment variables using the information you retrieved:

```sh
nctl update app {APP_NAME} --env="DEPLOIO_ACCESS_KEY={ACCESS_KEY};DEPLOIO_SECRET_KEY={SECRET_KEY};DEPLOIO_ENDPOINT={API_ENDPOINT};DEPLOIO_BUCKET={BUCKET_NAME}"
```

The Deploio endpoint should be `https://es34.objects.nineapis.ch`.

## Configure Active Storage

To use the bucket in your Rails application, you need to configure Active Storage.
You can do this by configuring a new service in the `config/storage.yml` file:

```yaml title="config/storage.yml"
deploio:
  service: S3
  access_key_id: <%= ENV["DEPLOIO_ACCESS_KEY"] %>
  secret_access_key: <%= ENV["DEPLOIO_SECRET_KEY"] %>
  endpoint: <%= ENV["DEPLOIO_ENDPOINT"] %>
  region: us-east-1 # fake; running in Switzerland, operated by Nine
  bucket: <%= ENV["DEPLOIO_BUCKET"] %>
```

::: info
For S3, a `region` must be specified. Deploio uses the S3 default value of `us-east-1`, even though the servers are in
Switzerland, operated by Nine.
:::

You can configure Active Storage to use the newly created service by setting the `service` configuration in the
production environment:

```ruby title="config/environments/production.rb"
config.active_storage.service = :deploio
```

### Custom Hostnames

Without a custom hostname, assets served via Active Storage redirect to
`{BUCKET_NAME}.es34.objects.nineapis.ch`. If you want to use your own domain,
you can do so by configuring a custom hostname.

First, run these two commands to create the hostname and to set it as environment variable.

```sh
nctl update bucket {BUCKET_NAME} --custom-hostnames={HOSTNAME}
nctl update app {APP_NAME} --env="DEPLOIO_HOST={HOSTNAME}"
```

Next, open your bucket in your browser in the Cockpit UI and scroll down to the Custom Hostnames section.
There, you can copy the TXT record and CNAME target and add them to your domain's DNS.

After the TXT verification is complete, create an Active Storage service in Rails
in `lib/active_storage/service/deploio_s3_service.rb`:

```ruby title="lib/active_storage/service/deploio_s3_service.rb"
require "active_storage/service/s3_service"

module ActiveStorage
  class Service
    class DeploioS3Service < ActiveStorage::Service::S3Service
      DEFAULT_REGION = "us-east-1" # fake; running in Switzerland, operated by Nine

      def initialize(host: nil, region: DEFAULT_REGION, **)
        @host = host
        super(region:, **)
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
  endpoint: <%= ENV["DEPLOIO_ENDPOINT"] %>
- region: us-east-1 # fake; running in Switzerland, operated by Nine
  bucket: <%= ENV["DEPLOIO_BUCKET"] %>
+ host: <%= ENV["DEPLOIO_HOST"] %>
```

## Next Steps

Do you need **background jobs** for your application? Proceed to the next step.
