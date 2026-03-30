---
prev:
  text: CI/CD Integration
  link: /user-guide/ci-cd-integration
next:
  text: Security
  link: /user-guide/security
---

# Monitoring and Logs

## Logs

Your application's stdout and stderr output is captured by Deploio and can be accessed either in the Cockpit or 
with `nctl`.

### Viewing Application Logs

To view the latest logs of your application:

```bash
nctl logs app {application_name}
```

By default, this shows the last 50 lines. You can adjust this with `--lines`:

```bash
nctl logs app {application_name} --lines 200
```

To follow live logs, use `--follow`:

```bash
nctl logs app {application_name} --follow
```

### Filtering Logs

Deploio captures logs from different sources. You can filter by type (e.g. deploy or worker jobs) 
using the `--type` flag:

```bash
# App logs
nctl logs app {application_name} --type app

# Build logs
nctl logs app {application_name} --type build

# Deploy job logs
nctl logs app {application_name} --type deploy_job

# Worker job logs
nctl logs app {application_name} --type worker_job

# Scheduled job logs
nctl logs app {application_name} --type scheduled_job
```

### Time-Based Filtering

You can look back a specific duration or query an absolute time range:

```bash
# Logs from the last 2 hours
nctl logs app {application_name} --since 2h

# Logs in a specific time window (RFC3339 format)
nctl logs app {application_name} \
  --from 2025-01-15T08:00:00+01:00 \
  --to 2025-01-15T09:00:00+01:00
```

### Structured output

For structured log processing, you can output logs as JSON instead of plain text:

```bash
nctl logs app {application_name} --output json
```

### Retention

Deploio retains logs for up to 30 days.

## Performance Metrics

We currently provide **CPU** and **memory usage** metrics for your application replicas. The following sections explain how
you can access these metrics.

In case you need more detailed metrics, we offer you the option to set up your own Grafana dashboard. See the
[Metrics in your own Grafana Dashboard](#metrics-in-your-own-grafana-dashboard) section for details.

### Resource Stats

To see the current CPU and memory usage of your application replicas, you can use:

```bash
nctl get app {application_name} -o stats
```

This shows per-replica metrics:

| Column | Description |
|--------|-------------|
| REPLICA | Name of the app replica |
| STATUS | Current status of the replica |
| CPU | CPU usage in millicores (1000m = 1 full core) |
| CPU% | CPU usage relative to app size (can exceed 100% due to bursting) |
| MEMORY | Memory usage in MiB |
| MEMORY% | Memory usage relative to app size (can exceed 100% due to bursting) |
| RESTARTS | Number of times the replica has restarted |
| LASTEXITCODE | Exit code from the last restart (useful for diagnosing crash loops) |

### Releases and Builds

To see what's currently live and the deployment history:

```bash
# List all releases
nctl get releases -a {application_name}

# List all builds
nctl get builds -a {application_name}
```

To find out which git revision is currently deployed:

```bash
nctl get app {application_name} --output yaml | grep revision
```

### Metrics in Cockpit

The Cockpit web interface provides a Metrics tab for each application, displaying memory and CPU usage over time.

### Metrics of running replica

Next to using `nctl` or the Cockpit, you can also just connect to the running replica directly and use tool like
`free` to check the memory usage e.g.:

```bash
# Init shell session
nctl exec app {application_name} bash

# Print memory usage
free -m
```

### Metrics in your own Grafana Dashboard

Grafana offers you the possibility to set up your own dashboard to monitor your applications. In order to provision
a Grafana instance, head over to the Nine Cockpit and navigate to "On-Demand Services" and click on "New Service".
This will navigate you to a form where you can select Grafana.

Once the Grafana instance is up and running, you can import our [pre-made Deploio dashboard](https://docs.nine.ch/docs/deplo-io/observing-your-app#dashboard),
which you can then still customize to your needs.
