/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'index',
    {
      type: 'category',
      label: 'Quick Start',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Docker',
          link: { type: 'doc', id: 'quick-start/docker/create_app' },
          items: [
            'quick-start/docker/create_app',
          ],
        },
        {
          type: 'category',
          label: 'Go',
          link: { type: 'doc', id: 'quick-start/go/create_app' },
          items: [
            'quick-start/go/create_app',
          ],
        },
        {
          type: 'category',
          label: 'Node.js',
          link: { type: 'doc', id: 'quick-start/nodejs/create_app' },
          items: [
            'quick-start/nodejs/create_app',
          ],
        },
        {
          type: 'category',
          label: 'PHP',
          link: { type: 'doc', id: 'quick-start/php/create_app' },
          items: [
            'quick-start/php/create_app',
            'quick-start/php/create_database',
            'quick-start/php/kvs',
            'quick-start/php/object_storage',
            'quick-start/php/background_jobs',
            'quick-start/php/cd',
            'quick-start/php/php_build_env',
            'quick-start/php/php_extensions',
            'quick-start/php/create_symfony_app',
          ],
        },
        {
          type: 'category',
          label: 'Python',
          link: { type: 'doc', id: 'quick-start/python/create_app' },
          items: [
            'quick-start/python/create_app',
          ],
        },
        {
          type: 'category',
          label: 'Ruby on Rails',
          link: { type: 'doc', id: 'quick-start/ruby-on-rails/create_app' },
          items: [
            'quick-start/ruby-on-rails/create_app',
            'quick-start/ruby-on-rails/create_database',
            'quick-start/ruby-on-rails/kvs',
            'quick-start/ruby-on-rails/object_storage',
            'quick-start/ruby-on-rails/background_jobs',
            'quick-start/ruby-on-rails/cd',
          ],
        },
        {
          type: 'category',
          label: 'Static Pages',
          link: { type: 'doc', id: 'quick-start/static-pages/create_app' },
          items: [
            'quick-start/static-pages/create_app',
          ],
        },
      ],
    },
    'user-guide/how_deploio_works',
    'user-guide/getting_started',
    'user-guide/code_repository_setup',
    'user-guide/configuring_your_database',
    'user-guide/other_dependencies',
    'user-guide/configuring_your_application',
    'user-guide/networking_and_deployment',
    'user-guide/ci_cd_integration',
    'user-guide/troubleshooting',
    'user-guide/monitoring_and_logs',
    'user-guide/security',
    'user-guide/migrating_from_other_platforms',
    'user-guide/our_stack',
    'user-guide/tools',
  ],
};

module.exports = sidebars;
