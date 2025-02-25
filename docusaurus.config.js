// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

const enhancedGithubTheme = {
  ...prismThemes.github,
  styles: [
    ...prismThemes.github.styles,
    {
      types: ["shell-symbol"],
      style: {
        color: "#0550AE",
        fontWeight: "bold",
      },
    },
    {
      types: ["output"],
      style: {
        color: "#6B6B6B",
      },
    }
  ],
}

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// # TODO: check through config

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Deplo.io Documentation',
  tagline: 'A comprehensive guide deploying apps on Deploio',
  favicon: 'img/light_logo.svg',

  // Set the production url of your site here
  url: 'https://docs.deplo.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    localeConfigs: {
      en: { label: 'English' },
      de: { label: 'Deutsch' },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'documentation',
          routeBasePath: 'documentation',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'quickStartDocs',
        path: 'quick_start',
        routeBasePath: 'quick_start',
        sidebarPath: require.resolve('./sidebarsQuickStart.js'),
      },
    ],
  ],

  themeConfig:
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'deplo.io',
        logo: {
          alt: 'Deploio Logo',
          src: 'img/light_logo.svg',
        },
        items: [
          // TODO: disabled until we add translations
          // {
          //   type: 'localeDropdown',
          //   position: 'right'
          // },
          {
            to: '/about_deploio',
            label: 'About Deploio',
            position: 'right'
          },
          {
            to: '/quick_start',
            label: 'Quick Start',
            position: 'right'
          },
          {
            to: '/documentation',
            label: 'Documentation',
            position: 'right'
          },
          // TODO: disabled until we add pricing page / link to pricing calculator
          // {
          //   to: '/pricing',
          //   label: 'Pricing',
          //   position: 'right'
          // },
          // TODO: include Algolia search for whole site
          // {
          //   to: '/search',
          //   label: 'Search',
          //   position: 'right'
          // },
        ],
      },
      footer: {
        // The footer has been completely re-worked using React components so this section is empty
        // links: []
      },
      // TODO: is this only for the code blocks? it's was doing in line styles which sucks
      prism: {
        theme: enhancedGithubTheme,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['shell-session', 'bash'],
      },
      colorMode: {
        disableSwitch: true
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true
        }
      }
    }),
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
      }
    }
  ]
};

export default config;
