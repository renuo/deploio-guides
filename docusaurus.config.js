// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// # TODO: check through config

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Deplo.io Documentation',
  tagline: 'A comprehensive guide deploying apps on Deploio',
  favicon: 'img/favicon.ico',

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
          sidebarPath: './sidebars.js'
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
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
          {
            type: 'localeDropdown',
            position: 'right'
          },
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
          {
            to: '/pricing',
            label: 'Pricing',
            position: 'right'
          },
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
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
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
