import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

// https://vitepress.dev/reference/site-config
//
export default withMermaid(
  defineConfig({
    title: "Deploio Docs",
    description: "Deploy and manage apps easily",
    head: [
      ["link", { rel: "icon", href: "/icon/logo.svg" }],
      ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
      ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
      ["link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" }]
    ],
    markdown: {
      config(md) {
        md.use(tabsMarkdownPlugin);
      },
    },
    themeConfig: {
      search: { provider: "local" },
      logo: "/icon/logo.svg",
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Docs", link: "/introduction/about-deploio" },
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
            { text: "Getting Started", link: "/user-guides/getting-started" },
            {
              text: "Code Repository Setup",
              link: "/user-guides/code-repository-setup",
            },
            {
              text: "Configuring Your Database",
              link: "/user-guides/configuring-your-database",
            },
            {
              text: "Other dependecies",
              link: "/user-guides/other-dependencies",
            },
            {
              text: "Configuring Your Application",
              link: "/user-guides/configuring-your-application",
            },
            {
              text: "Network & Deployment",
              link: "/user-guides/network-and-deployment",
            },
            {
              text: "CI/CD Integration",
              link: "/user-guides/ci-cd-integration",
            },
            {
              text: "Troubleshooting",
              link: "/user-guides/troubleshooting",
            },
            {
              text: "Monitoring and Logs",
              link: "/user-guides/monitoring-and-logs",
            },
            {
              text: "Security",
              link: "/user-guides/security",
            },
            {
              text: "Migrating from other platforms",
              link: "/user-guides/migrating-from-other-platforms",
            },
            {
              text: "Our stack",
              link: "/user-guides/our-stack",
            },
            {
              text: "Tools",
              link: "/user-guides/tools",
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
          items: [{ text: "Quick start", link: "/static-pages/quick-start" }],
        },
      ],

      socialLinks: [
        { icon: "github", link: "https://github.com/vuejs/vitepress" },
      ],
      footer: {
        message: "Released under the MIT License.",
        copyright: "Copyright © 2022-present, Nine & Renuo",
      },
    },
    mermaid: {
      // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
    },
    mermaidPlugin: {
      class: "mermaid my-class",
    },
  }),
);
