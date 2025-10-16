---
id: background_jobs
title: Setup Background Jobs
description: Learn how to setup background jobs for your Rails application
---

# Setup Background Jobs for your Rails application

<div class="summary">
Should you require a background process for a worker such as [Sidekiq](https://sidekiq.org), 
[Good job](https://github.com/bensheldon/good_job), or [Delayed Job](https://github.com/collectiveidea/delayed_job), you can setup a worker command.
</div>

## Creating a Worker

:::info
Some active job backends such as Sidekiq require a key-value store such as Redis to store job data. In case you haven't
set up Redis, you can follow the instructions [here](kvs).
:::

To add a worker to a running application, we can use the `nctl update app` command. The following example
demonstrates how to add a Sidekiq worker to an application:

```bash
nctl update app {application_name} \
  --worker-job-command="bundle exec sidekiq -C config/sidekiq.yml" \
  --worker-job-name "sidekiq" \
  --worker-job-size micro
```

The `--worker-job-command` flag specifies the command to run the worker. The `--worker-job-name` flag specifies the name
of the worker, and finally, the `--worker-job-size` flag specifies the instance type for the worker, which are the
equivalent of the instance types for the application. The available sizes can be viewed [here](https://docs.nine.ch/docs/deplo-io/sizing-overview/).

## Observing a Worker

The worker's logs are aggregated with the application logs. You can view the all the logs using the `nctl logs` command.
If you wish to only view the logs for the worker, you can filter the logs using the `-t, --type` flag:

```bash
nctl logs {application_name} -t worker_job
```

## Removing a Worker

Should you wish to remove a worker from a running application, you can use the `nctl update app` command:

```bash
nctl update app {application_name} --delete-worker-job={worker_job_name}
```

## Next Steps

Do you need to **configure Continuous Deployment**? Proceed to the [next step](./cd).
