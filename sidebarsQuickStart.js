/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  quickStartSidebar: [
    {
      type: 'doc',
      id: 'Docker/create_app',
      label: 'Docker',
      customProps: {
        icon: 'docker.svg',
      },
    },
    {
      type: 'doc',
      id: 'Go/create_app',
      label: 'Go',
      customProps: {
        icon: 'go.svg',
      },
    },
    {
      type: 'doc',
      id: 'Node.js/create_app',
      label: 'Node.js',
      customProps: {
        icon: 'nodejs.svg',
      },
    },
    {
      type: 'category',
      label: 'PHP',
      link: {
        type: 'doc',
        id: 'PHP/create_app',
      },
      customProps: {
        icon: 'php.svg',
      },
      items: [
        'PHP/php_extensions',
        'PHP/php_build_env',
        'PHP/create_symfony_app',
        'PHP/create_database',
        'PHP/kvs',
        'PHP/object_storage',
        'PHP/background_jobs',
        'PHP/cd',
      ],
    },
    {
      type: 'doc',
      id: 'Python/create_app',
      label: 'Python',
      customProps: {
        icon: 'python.svg',
      },
    },
    {
      type: 'category',
      label: 'Ruby on Rails',
      link: {
        type: 'doc',
        id: 'Ruby on Rails/create_app',
      },
      customProps: {
        icon: 'ruby.svg',
      },
      items: [
        'Ruby on Rails/create_database',
        'Ruby on Rails/kvs',
        'Ruby on Rails/object_storage',
        'Ruby on Rails/background_jobs',
        'Ruby on Rails/cd',
      ],
    },
    {
      type: 'doc',
      id: 'Static Pages/create_app',
      label: 'Static Pages',
      customProps: {
        icon: 'html.svg',
      },
    },
  ],
};

export default sidebars;
