---
prev:
  text: Migrating from other platforms
  link: /user-guide/migrating-from-other-platforms
next:
  text: Tools
  link: /user-guide/tools
---

# Our Stack

## The Human Stack

Deploio is born from a partnership of two established Swiss technology companies:

### Nine (Founded 1999)
- Decades of Swiss hosting expertise
- Operates Swiss-based datacenters
- Deep infrastructure and cloud engineering experience

### Renuo (Founded 2011)
- Platform-as-a-Service specialists
- Years of Heroku power-user experience (plus testing a number of alternatives)
- Expert application deployment knowledge

##### Together, they bring Swiss quality, reliability, and technical excellence to Deploio.

## The Technology Stack

### Nutanix: The Infrastructure Foundation

Provides the underlying compute, storage, and networking foundation.

- High-performance **hyper-converged infrastructure**
- **Unified** compute, storage, and networking
- Linear **scalability** for growing workloads
- **Enterprise-grade** reliability

### Kubernetes: The Orchestration Layer

Kubernetes is the core orchestration platform that powers Deploio.

- **Industry-standard** container platform
- **Automated** container deployment with zero downtime
- Built-in **high availability** and failover
- **Resource management** across the cluster (without overbooking)
- **Self-healing** capabilities with automatic restart
- **Zero-downtime** deployments
- **Secure** handling of environment variables and secrets
- **Automated scaling** based on the number of replicas you have configured

::: info
The Kubernetes layer is fully managed by Nine, so you get enterprise-grade orchestration without the operational complexity.
:::

### Deploio: The Magic Glue

Deploio is the platform that brings everything together, providing a developer-friendly interface and powerful abstractions on top of the Nine Kubernetes Engine (NKE).

- Provides **simplicity** via `nctl` and the Cockpit
- Transforms raw Kubernetes into a **developer platform**
- Maintains **full Kubernetes compatibility**
- **Simplifies configuration** management
- **Integrates seamlessly** with development workflows
- Supports **multiple programming languages** and frameworks

::: tip
You provide the code, we handle the rest.
:::

## Technology Deep Dive

### Container-based infrastructure

Deploio runs applications in strictly isolated containers powered by **Kubernetes**, a **battle-tested** container orchestration platform. Deploio, which is built on top of the **Nine Kubernetes Engine (NKE)**, ensures each application and its components are properly separated and isolated from each other, while Kubernetes provides proven reliability through automated scaling, scheduling and container management.

Below explains how this infrastructure impacts key operational considerations.

#### Safety & Reliability

We have used the [FURPS](https://en.wikipedia.org/wiki/FURPS) model to evaluate the safety and reliability of Deploio's infrastructure:

##### Functionality
- **Swiss Infrastructure**: Operated under Nine's [AS29691](#swiss-infrastructure-as29691) infrastructure
- **Physical Security**: Enterprise-grade data center security measures
- **Encrypted Communication**: Secure data transmission protocols

##### Usability
- **Access Controls**: Access management via account permissions set at Organisation level
- **Familiar Tools**: Manage security through `nctl` and standard Kubernetes commands via `kubectl`
- **Unified Interface**: Single platform (Deploio Cockpit) for monitoring via a GUI
- **Documentation**: [Quick start guides](/quick_start) available for different technologies, as well as general documentation of both Deploio and [Nine products](https://docs.nine.ch/)

##### Reliability
- **Kubernetes Backed**: Built on Kubernetes for high availability and reliability
- **Automated Recovery**: Self-healing infrastructure
- **Backup Systems**: Automated backup procedures

##### Performance
- **Low-latency**: Minimal impact on application performance
- **Fast CLI Operations**: Quick deployments and updates via `nctl`
- **Efficient Container Orchestration**: Kubernetes-powered scheduling, scaling and management
- **Configurable Resources**: Control CPU, memory, and storage size for your application
- **Zero-downtime Deployments**: Rolling updates without service interruption

##### Supportability
- **Management Options**: Maintain your applications easily through either `nctl` CLI or Deploio Cockpit GUI
- **Standardized Infrastructure**: Built on enterprise-grade Kubernetes for consistent operations and management
- **Flexible Testing**: Create and manage multiple staging environments for thorough testing
- **Comprehensive Configuration**: Configure everything from resources and secrets to custom container builds through Dockerfiles
- **Simple Onboarding**: Get started quickly with either CLI or GUI-based setup process, backed by clear documentation and quick start guides
- **Plug-and-Play Architecture**: Automated container builds with buildpacks and easy integration of services

#### Data Loss

Deploio’s containerized architecture minimizes service disruption and reduces the risk of data loss during failures. Each container is isolated and automatically restarted if it crashes, with Kubernetes handling recovery by rescheduling Pods or using available replicas to maintain availability.

Your application runs in containers with an **ephemeral filesystem**, meaning **any data written to the container's local filesystem will be lost** if the container is restarted, rescheduled, or deleted.

::: warning Important: Understanding Your Application
**Your Application = Code (Git) + Runtime Data**

Remember: Your application consists of two key parts:
- **Code**: Version controlled in Git
- **Runtime Data**: Must be stored in persistent services like:
  - Databases for structured data
  - S3 for file storage
  - Redis for caching
  - Persistent Volume Claims (PVCs) for local persistent storage (not yet available)
:::

The ephemeral nature of the filesystem is by design, ensuring clean application states and proper isolation. To persist data across deployments and container lifecycles, you should use **storage services** — such as [managed databases](/user-guide/configuring_your_database) or [object storage](/user-guide/other_dependencies#object-storage).

#### Tenant Separation

Applications on Deploio run in containers, which are isolated at the process, filesystem, and network level. These containers are scheduled onto shared cluster nodes **but run independently**.

Deploio organizes resources in a clear three-level structure:

1. **Organisation**
  - Your contract relationship with Nine
  - The top-level entity that contains all your projects
  - Manages billing and access control

2. **Projects**
  - Equivalent to a Kubernetes namespace (1:1 mapping)
  - Logical grouping of related resources
  - Provides isolation between different applications or environments

3. **Resources**
  - The actual components you deploy and pay for:

    - Applications
    - Databases
    - S3 storage
    - And other services...

::: info Summary
Each resource belongs to a project, and each project belongs to your organization, creating a clear and manageable hierarchy for your deployments.
:::

However, from an infrastructure perspective, the isolation happens at the **Kubernetes namespace and container level**:


- Each project runs in a separate Kubernetes namespace
- Each container has its own isolated runtime environment
- Resource quotas reflect pricing and network policies reflect security best practices

#### Scaling & Reliability

Deploio apps run on Kubernetes, which provides built-in orchestration, automatic recovery, and horizontal scaling.

By default:

- You can scale **vertically** by **increasing CPU and memory limits** for the application
- Or scale **horizontally** by **increasing the number of replicas** (number of pods running the application)

See [Configuring your Application](/user-guide/configuring_your_application) for more details on configuring the scaling.

Replicas of your app are distributed across multiple nodes in the cluster, maximizing availability and resilience in case of node failures. Kubernetes continuously monitors the health of your containers and will automatically restart or reschedule them if needed.

### Kubernetes Native Integration

Deploio is built as a true Kubernetes extension, not a proprietary abstraction layer. This means:

- **Full Kubernetes Compatibility**: Use standard `kubectl` commands
- **Familiar Workflow**: If you know Kubernetes, you know Deploio
- **Standard Tooling Support**: Works with existing Kubernetes tools, CLIs, and practices

For example, you can use familiar commands:

```bash
kubectx nineapis.ch
kubectl get projects
```

This allows you to manage your Deploio applications using the same Kubernetes tooling and practices you're already familiar with.

::: info
You will need to install **kubectl**.
:::

### Swiss infrastructure (AS29691)

Deploio is hosted entirely within Switzerland on Nine Internet Solutions AG's infrastructure (AS29691). This provides several key advantages:

- **Data sovereignty**: Your applications and data remain within Swiss jurisdiction, ensuring compliance with Swiss data protection laws
- **Low latency**: Optimized connectivity for European users with multiple data center locations in Zurich
- **Regulatory compliance**: Built-in compliance with Swiss financial and privacy regulations
- **High availability**: Redundant infrastructure across independent sites ensures maximum uptime

The Swiss hosting ensures your applications benefit from Switzerland's strong privacy laws and political stability, making it ideal for businesses requiring strict data governance.

### Heroku Buildpacks for builds

Deploio uses Heroku-compatible buildpacks to automatically detect and build your applications:

- **Language detection**: Automatically identifies your application's technology stack (Node.js, Python, Ruby, PHP, Go, Java, etc.)
- **Dependency management**: Handles package installation and dependency resolution
- **Build optimization**: Caches dependencies between builds for faster deployment times
- **Custom buildpacks**: Supports custom buildpacks for specialized requirements
- **Zero configuration**: Most applications deploy without any configuration files

The buildpack system ensures your applications are built consistently and optimally, regardless of the underlying technology stack.

::: tip Dockerfiles
Do you have more granular requirements and need more control over your environment? Don't fret! You can use [**Dockerfile builds**](/quick-start/docker/create_app) to customize your setup exactly how you want.
:::

### Docker for containerized deployments

Every application on Deploio runs in Docker containers:

- **Build process**: Applications can be built using either custom Dockerfiles or the aforementioned [buildpacks](#heroku-buildpacks-for-builds)
- **Environment reproducibility**:
  - **Dockerfiles**: Controlled by how you specify base images (tags vs SHA digests) - see [Dockerfile reference](https://docs.docker.com/reference/dockerfile/#from). **You are responsible for maintaining dependencies and configurations.**
  - **Buildpacks**: Build behavior determined by the buildpack implementation. Deploio detects the language and uses the appropriate buildpack automatically, which uses standardized and maintained base images.
- **Dedicated resources**: Unlike shared PaaS platforms, you get 100% of the resources you pay for - no overbooking
- **Infrastructure security**: Nutanix provides kernel-level container isolation and security boundaries

::: info The Deploio Guarantee
Unlike traditional PaaS providers that may overbook resources across multiple customers, Deploio guarantees dedicated resources for your applications. **The CPU and other resources you pay for are yours.**
:::
