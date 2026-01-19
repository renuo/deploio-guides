import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import llmstxt from "vitepress-plugin-llms";

// https://vitepress.dev/reference/site-config
//
export default withMermaid(
  defineConfig({
    title: "Deploio Guides",
    description: "Deploy and manage apps easily",
    sitemap: {
      hostname: "https://guides.deplo.io",
    },
    vite: {
      plugins: [
        llmstxt({
          domain: "https://guides.deplo.io",
          description: "Deploy and manage apps easily with Deploio",
          details: "These are the user guides for Deploio, a container-based infrastructure platform. It's a collection of use cases which can be followed from A to Z.",
        }),
      ],
    },
    head: [
      ["link", { rel: "icon", href: "/icon/logo.svg" }],
      ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
      [
        "link",
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
      ],
      [
        "link",
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
        },
      ],
    ],
    markdown: {
      config(md) {
        md.use(tabsMarkdownPlugin);
      },
    },
    themeConfig: {
      search: { provider: "local" },
      logo: "/icon/logo.svg",
      editLink: {
        pattern: "https://github.com/renuo/deploio-guides/edit/main/docs/:path",
        text: "Edit this page on GitHub",
      },
      socialLinks: [
        { icon: "facebook", link: "https://www.facebook.com/deploioch/" },
        { icon: "instagram", link: "https://www.instagram.com/deploio/" },
        { icon: "linkedin", link: "https://linkedin.com/company/deploio" },
        { icon: "x", link: "https://x.com/deplo_io" },
      ],
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "About", link: "/introduction/about-deploio" },
        { text: "Reference", link: "https://docs.nine.ch/docs/category/deploio-paas/", target: "_blank" },
        { text: "Deploio Website", link: "https://deplo.io", target: "_blank" },
        { text: "Pricing", link: "https://deplo.io/pricing", target: "_blank" },
        { text: "Login", link: "https://cockpit.nine.ch/en/session/new?origin=deploio", target: "_blank" },
      ],
      sidebar: [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            { text: "About Deploio", link: "/introduction/about-deploio" },
            {
              text: "How Deploio Works",
              link: "/introduction/how-deploio-works",
            },
          ],
        },
        {
          text: "User Guides",
          collapsed: false,
          items: [
            { text: "Getting Started", link: "/user-guide/getting-started" },
            {
              text: "Code Repository Setup",
              link: "/user-guide/code-repository-setup",
            },
            {
              text: "Configuring Your Database",
              link: "/user-guide/configuring-your-database",
            },
            {
              text: "Other dependecies",
              link: "/user-guide/other-dependencies",
            },
            {
              text: "Configuring Your Application",
              link: "/user-guide/configuring-your-application",
            },
            {
              text: "Network & Deployment",
              link: "/user-guide/network-and-deployment",
            },
            {
              text: "CI/CD Integration",
              link: "/user-guide/ci-cd-integration",
            },
            {
              text: "Troubleshooting",
              link: "/user-guide/troubleshooting",
            },
            {
              text: "Monitoring and Logs",
              link: "/user-guide/monitoring-and-logs",
            },
            {
              text: "Security",
              link: "/user-guide/security",
            },
            {
              text: "Migrating from other platforms",
              link: "/user-guide/migrating-from-other-platforms",
            },
            {
              text: "Our stack",
              link: "/user-guide/our-stack",
            },
            {
              text: "Tools",
              link: "/user-guide/tools",
            },
          ],
        },
        {
          text: "Ruby on Rails",
          collapsed: true,
          items: [
            { text: "Quick start", link: "/ruby/quick-start" },
            { text: "Database", link: "/ruby/database" },
            { text: "Key/Value storage", link: "/ruby/key-value-storage" },
            { text: "Object storage", link: "/ruby/object-storage" },
            { text: "Background jobs", link: "/ruby/background-jobs" },
            {
              text: "Continuous Deployment",
              link: "/ruby/continuous-deployment",
            },
          ],
        },
        {
          text: "PHP",
          collapsed: true,
          items: [
            { text: "Quick start", link: "/php/quick-start" },
            { text: "Database", link: "/php/database" },
            { text: "Key/Value storage", link: "/php/key-value-storage" },
            { text: "Object storage", link: "/php/object-storage" },
            { text: "Background jobs", link: "/php/background-jobs" },
            {
              text: "Continuous Deployment",
              link: "/php/continuous-deployment",
            },
            { text: "Build environment", link: "/php/build-environment" },
            { text: "Extensions", link: "/php/extensions" },
            { text: "Symfony", link: "/php/symfony" },
          ],
        },
        {
          text: "Python",
          collapsed: true,
          items: [{ text: "Quick start", link: "/python/quick-start" }],
        },
        {
          text: "Go",
          collapsed: true,
          items: [{ text: "Quick start", link: "/go/quick-start" }],
        },
        {
          text: "Docker",
          collapsed: true,
          items: [{ text: "Quick start", link: "/docker/quick-start" }],
        },
        {
          text: "Node.js",
          collapsed: true,
          items: [{ text: "Quick start", link: "/nodejs/quick-start" }],
        },
        {
          text: "Static pages",
          collapsed: true,
          items: [
            { text: "Quick start", link: "/static-pages/quick-start" },
            { text: "Static Site Generators", link: "/static-pages/static-site-generators" },
          ],
        },
      ],
    },
    mermaid: {
      // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
    },
    mermaidPlugin: {
      class: "mermaid my-class",
    },
  }),
);
