---
id: background_jobs
title: Setup Background Jobs
description: Learn how to setup background jobs for your PHP application
displayed_sidebar: quickStartSidebar
---

# Setup Background Jobs for your PHP application

<div class="summary">
Should you require a background process for a worker such as [Symfony Scheduler](https://symfony.com/doc/current/scheduler.html)
or [Symfony Messenger](https://symfony.com/doc/current/messenger.html), you can setup a worker command.
</div>

## Creating a Worker

To add a worker to a running application, you can use the `nctl update application` command. The following example
demonstrates how to add a messenger worker for the async queue to the application:

```bash
nctl update application {application_name} \
  --worker-job-command="bin/console messenger:consume async" \
  --worker-job-name "messenger-async" \
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

Should you wish to remove a worker from a running application, you can use the `nctl update application` command:

```bash
nctl update application {application_name} --delete-worker-job={worker_job_name}
```

## Next Steps

Do you need to **configure Continuous Deployment**? Proceed to the next step.
