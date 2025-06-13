---
title: Our Stack
---

# Our Stack

## Container-based infrastructure

Deploio is built on top of the **Nine Kubernetes Engine (NKE)**, which provides a secure, multi-tenant Kubernetes platform for running containerized applications. This architecture gives you the flexibility, dynamism, and reliability of the container-based infrastructure, with automated scaling, scheduling, and restarting, and with the security that container isolation provides.

Here's how this infrastructure impacts key operational considerations:

##### Safety

Our platform operates within Nine's [Swiss infrastructure (AS29691)](#swiss-infrastructure-as29691), adhering to stringent data protection standards. This includes physical data center security, encrypted communication, and container-level isolation.

##### Data Loss

Deploio’s containerized architecture minimizes service disruption and reduces the risk of data loss during failures. Each container is isolated and automatically restarted if it crashes, with Kubernetes handling recovery by rescheduling Pods or using available replicas to maintain availability.

This means **any data written to the container’s local filesystem will be lost** if the container is restarted, rescheduled, or deleted.

To persist data across deployments, you should use:

- **[Persistent Volume Claims (PVCs)](05_other_dependencies.md#persistent-volumes)** — for file storage that survives pod restarts
- **External services** — such as managed databases or [object storage](05_other_dependencies.md#object-storage)

PVCs are automatically reattached to new pods when containers are rescheduled. However, Velero backups are not enabled by default, so persistent data is not automatically backed up unless you configure this explicitly.

[//]: # (I am not sure about the above at all... I got the Velero info from docs.nine.ch and presume it's not enabled given you need to manually do so. Is this even possible with nctl/deploio?)

##### Tenant Separation

Applications on Deploio run in containers, which are isolated at the process, filesystem, and network level. These containers are scheduled onto shared cluster nodes **but run independently**.

Deploio supports organisational structures like **organisations**, **projects**, and **applications**, but from an infrastructure perspective, the isolation happens at the **Kubernetes namespace and container level**.

Multiple apps and users may share the same physical servers or Kubernetes nodes, but:

- Each app runs in a separate Kubernetes namespace
- Each container has its own isolated runtime environment
- Resource quotas and network policies can enforce separation as needed

This model offers strong multi-tenancy while maintaining flexibility and efficient resource usage.

##### Scaling & Reliability

Deploio apps run on Kubernetes, which provides built-in orchestration, automatic recovery, and horizontal scaling.

By default:

- You can scale **vertically** by **increasing CPU and memory limits** for the application
- Or scale **horizontally** by **increasing the number of replicas** (number of pods running the application)

See [Configuring your Application](06_configuring_your_application.md) for more details on configuring the scaling.

Replicas of your app are distributed across multiple nodes in the cluster, maximizing availability and resilience in case of node failures. Kubernetes continuously monitors the health of your containers and will automatically restart or reschedule them if needed.

## Swiss infrastructure (AS29691)

Deploio is hosted entirely within Switzerland on Nine Internet Solutions AG's infrastructure (AS29691). This provides several key advantages:

- **Data sovereignty**: Your applications and data remain within Swiss jurisdiction, ensuring compliance with Swiss data protection laws
- **Low latency**: Optimized connectivity for European users with multiple data center locations in Zurich
- **Regulatory compliance**: Built-in compliance with Swiss financial and privacy regulations
- **High availability**: Redundant infrastructure across independent sites ensures maximum uptime

The Swiss hosting ensures your applications benefit from Switzerland's strong privacy laws and political stability, making it ideal for businesses requiring strict data governance.

## Powered by Nutanix and Kubernetes

Our infrastructure leverages enterprise-grade technology:

- **Nutanix hyper-converged infrastructure**: Provides the underlying compute, storage, and networking foundation with linear scalability
- **Nine Kubernetes Engine (NKE)**: A fully managed Kubernetes platform developed and operated by Nine's engineers
- **Enterprise-grade reliability**: Built on proven technology stacks used by Swiss financial institutions and enterprises
- **Automated operations**: Self-healing infrastructure that automatically handles node failures and resource allocation

This combination delivers enterprise-level performance and reliability while abstracting away the complexity of infrastructure management.

## Heroku Buildpacks for builds

Deploio uses Heroku-compatible buildpacks to automatically detect and build your applications:

- **Language detection**: Automatically identifies your application's technology stack (Node.js, Python, Ruby, PHP, Go, Java, etc.)
- **Dependency management**: Handles package installation and dependency resolution
- **Build optimization**: Caches dependencies between builds for faster deployment times
- **Custom buildpacks**: Supports custom buildpacks for specialized requirements
- **Zero configuration**: Most applications deploy without any configuration files

The buildpack system ensures your applications are built consistently and optimally, regardless of the underlying technology stack.

## Docker for containerized deployments

Every application on Deploio runs in Docker containers:

- **Consistent environments**: Your application runs the same way in development, staging, and production
- **Resource isolation**: Each container has defined CPU and memory limits
- **Security**: Containers provide process-level isolation and security boundaries
- **Portability**: Applications can be easily moved or replicated across different environments
- **Efficient resource usage**: Container orchestration optimizes resource allocation across the cluster

Docker containers ensure your applications are secure, portable, and efficiently managed throughout their lifecycle.

## Kubernetes for orchestration

Kubernetes provides the orchestration layer that manages your containerized applications:

- **Automated deployment**: Handles rolling deployments with zero-downtime updates
- **Service discovery**: Automatic DNS resolution and load balancing between services
- **Health monitoring**: Continuous health checks with automatic restart of failed containers
- **Resource management**: Intelligent scheduling and resource allocation across the cluster
- **Networking**: Secure networking between services with built-in load balancing
- **Configuration management**: Secure handling of environment variables and secrets

The Kubernetes layer is fully managed by Nine, so you get enterprise-grade orchestration without the operational complexity.
