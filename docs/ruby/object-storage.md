---
prev:
  text: Key/Value storage
  link: /ruby/key-value-storage
next:
  text: Background jobs
  link: /ruby/background-jobs
---
# Active Storage for Deploio

Deploio doesn't give you a disk to store files permanently.
It's because real hard disk storage is difficult to scale horizontally.
So the [12factor](https://12factor.net/backing-services) industry best practice
has been for quite some time to use cloud storage, most famously Amazon S3.
We call this "object storage".

::: info
If you absolutely need a real persistent and backed-up disk,
consider using a [Nine CloudVM](https://nine.ch/products/root-cloud-server/)
or [bring your own server hardware](https://nine.ch/de/products/colocation/) instead.
:::

## Third-party S3 Service

You can use Amazon S3 together with Deploio as you would on any other hoster.
First you set up the bucket on the third-party service (e.g. [Swiss Backup by Informaniak](https://docs.infomaniak.cloud/object_storage/s3/)).
Then you follow the official [Rails Guides on S3 serivce configuration](https://guides.rubyonrails.org/active_storage_overview.html#s3-service-amazon-s3-and-s3-compatible-apis).

## S3 Service by Nine

Let's assume that you want to have your storage located in Switzerland and controlled by Nine.
Then you need to be aware of the [pricing](https://docs.nine.ch/docs/object-storage/manage-buckets-and-users#pricing)
and we need to configure your bucket first.

### Bucket and User

Nine has multiple [datacenter locations](https://docs.nine.ch/docs/managed-kubernetes/nke/nine-kubernetes-engine#locations).
We're going to use the default for Deploio, which is `nine-es34`.

So let's create an S3 bucket for Deploio:

```sh
nctl create bucket --location=nine-es34 {BUCKET_NAME}
```

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

Then set the environment variables using the information you retrieved.
If you worked with a datacenter location other than `nine-es34`, adjust the endpoint accordingly.

```sh
nctl update app {APP_NAME} --env="\
  S3_ACCESS_KEY={ACCESS_KEY};\
  S3_SECRET_KEY={SECRET_KEY};\
  S3_ENDPOINT=https://es34.objects.nineapis.ch;\
  S3_BUCKET={BUCKET_NAME}"
```

### Configure Active Storage

To use the bucket in your Rails application, you need to configure Active Storage.
You can do this by configuring a new service in the `config/storage.yml` file:

```yaml title="config/storage.yml"
deploio:
  service: S3
  access_key_id: <%= ENV["S3_ACCESS_KEY"] %>
  secret_access_key: <%= ENV["S3_SECRET_KEY"] %>
  endpoint: <%= ENV["S3_ENDPOINT"] %>
  region: us-east-1 # fake; running in Switzerland, operated by Nine
  bucket: <%= ENV["S3_BUCKET"] %>
```

::: info
For S3, a `region` must be specified. Deploio uses the S3 default value of `us-east-1`, even though the servers are in
Switzerland, operated by Nine.
:::

To use the newly created service, set the [`config.active_storage.service`](https://edgeapi.rubyonrails.org/classes/ActiveStorage/Service.html)
configuration in the production environment:

```ruby title="config/environments/production.rb"
config.active_storage.service = :deploio
```

If you want to try it locally, you can also configure it in `development.rb` temporarily.
Then you would test in the `rails concole` that file upload and download works like this:

```rb
blob = ActiveStorage::Blob.create_and_upload!(
  io: StringIO.new("dummy"),
  filename: "dummy.txt",
  content_type: "text/plain"
)

puts blob.download
# "dummy"

puts blob.url
# "{S3_BUCKET}.es34.objects.nineapis.ch/9etnjjbujcqk7vm8tqzvsj2q8cpj?response-content-disposition=attachment%3B%20filename%3D%22dummy.txt%22%3B%20filename%2A%3DUTF-8%27%27dummy.txt&response-content-type=text%2Fplain&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qqMGtWnoxWK58YAdB6MjVDTB7kgxSRST%2F20251217%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251217T154115Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=04565c440d7a0d32b4ddecd372d242ad8df391cd686a26a551ae0c9b9dbdf31c"
```

### Public Access

Notice that per default you will receive a signed URL because Rails assumes that S3 buckets
are not publicly accessible. You can change this by creating a public Deploio S3 bucket 

```sh
nctl create bucket --location=nine-es34 {BUCKET_NAME} --public-read
```

and then [adding the `public: true` flag](https://guides.rubyonrails.org/active_storage_overview.html#public-access)
to the Active Storage configuration. Your URLs will then be accessible like this (without the signature part):

```text
{S3_BUCKET}.es34.objects.nineapis.ch/9etnjjbujcqk7vm8tqzvsj2q8cpj
```

### Custom Bucket Hostnames

For production apps you might want to hide the fact that assets are hosted on Nine S3. This often has the two
practical reasons:
* **Appearance**: all URLs should only point to your app, e.g. www.example.com and assets.example.com for brand
  and reputation reasons.
* **Performance**: there should be a CDN in front of your assets but TLS should still be end-to-end.
  So you need to be in control of DNS to provide the Let's Encrypt challenge.

Per default Rails serves the assets from the default bucket host, which is `{BUCKET_NAME}.es34.objects.nineapis.ch`.
So we need to configure a custom bucket hostname:

```sh
nctl update bucket {BUCKET_NAME} --custom-hostnames={S3_BUCKET_HOST}
nctl update app {APP_NAME} --env="S3_BUCKET_HOST={S3_BUCKET_HOST}"
```

Deploio needs to verify that you really own a domain name before
it will accept HTTP traffic to your custom host on their side.
So you need to add two DNS records at your DNS provider:
* `CNAME` for your domain to `es34.objects.nineapis.ch`
* `TXT` for record for ownership verification

The verification record can be retrieved via `nctl`:

```sh
nctl get bucket {APP_NAME} --output="yaml"
```

The output will look something like that. Look out for the `txtRecordValue`

```yaml
status:
  atProvider:
    customHostnamesVerification:
      cnameTarget: es34.objects.nineapis.ch
      statusEntries:
      - checkType: CAA
        latestSuccess: "2025-12-17T13:43:03Z"
        name: {S3_BUCKET_HOST}
      - checkType: CNAME
        latestSuccess: "2025-12-17T13:43:03Z"
        name: {S3_BUCKET_HOST}
      txtRecordValue: nine-bucket-verification=deploio-test-assets-renuotest-8432189
    endpoint: es34.objects.nineapis.ch
```

If you're going to use custom hostnames only for **public** buckets, you can stop here.
Your assets should be reachable now under names like

```text
https://assets.example.com/9etnjjbujcqk7vm8tqzvsj2q8cpj
```

#### Signed URLs

::: info
Underlying Deploio technology (Nutanix) doesn't support custom hostnames on its own.
Therefore Deploio has a leightweight proxy in place relaying your custom host to
`es34.objects.nineapis.ch`.

For signed URLs to pass-through, we need to tell Active Storage
to replace the host part of the generated and signed URL with your custom host.
The proxy will pick it up and replace the custom host with the Deploio S3 host.
The Nutanix S3 service can then verify the complete URL including signature.
:::

To support signed URLs with custom hostnames, you currently need to register
your own `ActiveStorage::Service` in `lib/active_storage/service/deploio_s3_service.rb`:

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
  access_key_id: <%= ENV["S3_ACCESS_KEY"] %>
  secret_access_key: <%= ENV["S3_SECRET_KEY"] %>
  endpoint: <%= ENV["S3_ENDPOINT"] %>
- region: us-east-1 # fake; running in Switzerland, operated by Nine
  bucket: <%= ENV["S3_BUCKET"] %>
+ host: <%= ENV["S3_BUCKET_HOST"] %>
```

## Next Steps

Do you need **background jobs** for your application? Proceed to the next step.
