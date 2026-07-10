---
prev:
  text: Troubleshooting
  link: /user-guide/troubleshooting
next:
  text: Tools
  link: /user-guide/tools
---

# FAQ

Answers to questions that come up regularly — especially about design decisions
that may seem surprising at first.

## How Swiss is Deploio really?

Your applications, databases, and storage run in Nine's data centers in
Switzerland. There are currently two caveats you should be aware of:

* **The control cluster runs on Google Cloud Platform.** The Deploio API
  (`nineapis.ch`) points to GCP because the k8s control cluster runs there
  for historical reasons. This dependency has no
  influence on the data integrity of your applications: workloads and their
  data stay in Switzerland, only the management plane runs on GCP. Nine is
  aware of this limitation and is working on migrating this system to its own
  infrastructure.
* **24/7 support involves a Canadian subsidiary.** Nine provides
  around-the-clock support through a subsidiary in Canada.
  This takes advantage of the timezone shift. The details are
  listed in [Appendix 3 of the Data Processing
  Agreement](https://docs.nine.ch/docs/legal-documents/data-processing-agreement/#appendix-3).
  Opt-out is possible for other Nine products but not for Deploio yet.

## Why do I have to set the S3 region to `us-east-1`?

The S3 protocol requires a region for request signing, so S3 clients refuse to
work without one. Deploio's object storage accepts the S3 default value
`us-east-1` — it is purely a protocol-level label and says nothing about where
your data lives. The buckets are hosted in Switzerland, operated by Nine.

See the [Active Storage](../ruby/active-storage.md) (Rails) and
[Object storage](../php/object-storage.md) (PHP) guides for configuration
examples.

## Why is my app down during maintenance windows?

Nine [defines maintenance windows](https://docs.nine.ch/docs/general/weekly-maintenance-window)
to introduce security patches and upgrades. You can prevent these downtimes by
configuring at least 2 replicas for your app.
