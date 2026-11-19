---
guides:
  - php/quick-start.md
  - php/build-environment.md
  - php/extensions.md
  - php/symfony.md
  - php/database.md
  - php/key-value-storage.md
  - php/object-storage.md
  - php/background-jobs.md
  - php/continuous-deployment.md
timeout_minutes: 120
---

You are a PHP developer who maintains a Symfony application on a classic shared hosting provider.
You want to move it to Deploio, together with its database, a Redis cache, file storage and a worker.

Start with the example application of the quick start, then deploy the Symfony example, and give every service you create to the Symfony application.
Where a guide only shows a flag to add, add it to the application with `nctl update app`.
You are done when the Symfony application answers on its `deploio.app` URL with its database connected, or when you are stuck.
