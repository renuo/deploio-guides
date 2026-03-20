---
prev:
  text: Quick Start
  link: /static-pages/quick-start.md
next: false
description: Comprehensive guide for deploying static site generators like VitePress, Docusaurus, Gatsby, and Astro on Deploio with build script configuration and output directory setup.
---

# Deploying Static Site Generators

Static site generators (SSGs) like VitePress, Docusaurus, Gatsby, and Astro use Node.js during the build process to generate static HTML, CSS, and JavaScript files.

::: info
This guide covers deploying SSGs that **require a build step**. If you have a simple static site with just HTML/CSS/JS files, see the [Quick Start Guide for Static Sites](/static-pages/quick-start.md).
:::

## How It Works

Deploio uses buildpacks to automatically detect and build your application:

1. **Node.js buildpack** detects your `package.json`
2. Runs `npm install` (or `yarn install`)
3. Runs `npm run build` to generate static files
4. **Nginx buildpack** serves the generated files

## Required Configuration

### 1. Build Script in package.json

Your `package.json` **must** include a `build` script:

```json
{
  "scripts": {
    "build": "vitepress build docs"  // your framework's build command
  }
}
```

::: warning
Without a `build` script, Deploio will not detect your application as a Node.js project.
:::

### 2. Build Output Directory

Set the `BP_STATIC_WEBROOT` build environment variable to tell Deploio where your generated files are located.

**Common frameworks and their output directories:**

| Framework | Default Output | `BP_STATIC_WEBROOT` |
|-----------|---------------|---------------------|
| VitePress | `docs/.vitepress/dist` | `docs/.vitepress/dist` |
| Docusaurus | `build` | `build` |
| Gatsby | `public` | `public` |
| Astro | `dist` | `dist` |
| Next.js (static) | `out` | `out` |

::: tip
Check your framework's documentation to confirm the output directory.
:::

## Framework-Specific Examples

### VitePress

**package.json:**

```json
{
  "scripts": {
    "build": "vitepress build docs"
  }
}
```

**Build Environment Variable:**

```
BP_STATIC_WEBROOT=docs/.vitepress/dist
```

### Docusaurus

**package.json:**

```json
{
  "scripts": {
    "build": "docusaurus build"
  }
}
```

**Build Environment Variable:**

```
BP_STATIC_WEBROOT=build
```

::: tip
Docusaurus uses `build` as the default, which matches Deploio's default `BP_STATIC_WEBROOT`.
:::

### Gatsby

**package.json:**

```json
{
  "scripts": {
    "build": "gatsby build"
  }
}
```

**Build Environment Variable:**

```
BP_STATIC_WEBROOT=public
```

### Astro

**package.json:**

```json
{
  "scripts": {
    "build": "astro build"
  }
}
```

**Build Environment Variable:**

```
BP_STATIC_WEBROOT=dist
```

## Common Issues

### Build Script Not Found

**Problem:** Site deploys but build doesn't run.

**Solution:** Add a `build` script to your `package.json`.

### 404 After Deployment

**Problem:** Site deploys successfully but shows 404 errors.

**Causes:**

- `BP_STATIC_WEBROOT` is pointing to the wrong directory
- `BP_STATIC_WEBROOT` is not set

**Solution:** Verify your framework's output directory and set `BP_STATIC_WEBROOT` correctly.

### Node Version

If your build requires a specific Node.js version, specify it in `package.json`:

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

Or create a `.nvmrc` file:

```
20
```

## Best Practices

### Don't Commit Build Artifacts

Add these to your `.gitignore`:

```gitignore
node_modules/
dist/
build/
.cache/
out/
docs/.vitepress/dist/
docs/.vitepress/cache/
```

### Build-Time Environment Variables

For configuration that needs to be embedded in your static files (API endpoints, feature flags), use build environment variables.

::: warning
Build environment variables are embedded in the generated static files. **Never** include secrets or sensitive data.
:::

### Lock Files

Always commit your `package-lock.json` or `yarn.lock` file for reproducible builds.

## Related Guides

- [Getting Started](/user-guide/getting-started.md) - Initial setup and account creation
- [Code Repository Setup](/user-guide/code-repository-setup.md) - Connecting your Git repository
- [CI/CD Integration](/user-guide/ci-cd-integration.md) - Automated deployments
