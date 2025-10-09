// Global sidebar configuration
export const sidebarConfig = {
  items: [
    {
      type: 'link',
      label: 'About Deploio',
      href: '/about_deploio',
    },
    {
      type: 'category',
      label: 'Quick Start',
      items: [
        {
          label: 'Docker',
          type: 'subcategory',
          items: [
            { label: 'Create Your App', href: '/quick_start/Docker/create_app' },
          ],
        },
        {
          label: 'Go',
          type: 'subcategory',
          items: [
            { label: 'Create Your App', href: '/quick_start/Go/create_app' },
          ],
        },
        {
          label: 'Node.js',
          type: 'subcategory',
          items: [
            { label: 'Create Your App', href: '/quick_start/Node.js/create_app' },
          ],
        },
        {
          label: 'PHP',
          type: 'subcategory',
          items: [
            { label: 'Create a PHP Application', href: '/quick_start/PHP/create_app' },
            { label: 'Handling PHP extensions', href: '/quick_start/PHP/php_extensions' },
            { label: 'The PHP build environment', href: '/quick_start/PHP/php_build_env' },
            { label: 'Create a Symfony Application', href: '/quick_start/PHP/create_symfony_app' },
            { label: 'Create a Database', href: '/quick_start/PHP/create_database' },
            { label: 'Create a Key Value Store', href: '/quick_start/PHP/kvs' },
            { label: 'Create an Object Storage', href: '/quick_start/PHP/object_storage' },
            { label: 'Setup Background Jobs', href: '/quick_start/PHP/background_jobs' },
            { label: 'Configure Continuous Deployment', href: '/quick_start/PHP/cd' },
          ],
        },
        {
          label: 'Python',
          type: 'subcategory',
          items: [
            { label: 'Create Your App', href: '/quick_start/Python/create_app' },
          ],
        },
        {
          label: 'Ruby on Rails',
          type: 'subcategory',
          items: [
            { label: 'Create a Rails Application', href: '/quick_start/Ruby on Rails/create_app' },
            { label: 'Create a Database', href: '/quick_start/Ruby on Rails/create_database' },
            { label: 'Create a Key Value Store', href: '/quick_start/Ruby on Rails/kvs' },
            { label: 'Create an Object Storage', href: '/quick_start/Ruby on Rails/object_storage' },
            { label: 'Setup Background Jobs', href: '/quick_start/Ruby on Rails/background_jobs' },
            { label: 'Configure Continuous Deployment', href: '/quick_start/Ruby on Rails/cd' },
          ],
        },
        {
          label: 'Static Pages',
          type: 'subcategory',
          items: [
            { label: 'Create Your App', href: '/quick_start/Static Pages/create_app' },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        { label: 'How Deploio Works', href: '/documentation' },
        { label: 'Getting Started', href: '/documentation/getting_started' },
        { label: 'Code Repository Setup', href: '/documentation/code_repository_setup' },
        { label: 'Configuring Your Database', href: '/documentation/configuring_your_database' },
        { label: 'Other Dependencies', href: '/documentation/other_dependencies' },
        { label: 'Configuring Your Application', href: '/documentation/configuring_your_application' },
        { label: 'Networking & Deployment', href: '/documentation/networking_and_deployment' },
        { label: 'CI/CD Integration', href: '/documentation/ci_cd_integration' },
        { label: 'Troubleshooting', href: '/documentation/troubleshooting' },
        { label: 'Monitoring & Logs', href: '/documentation/monitoring_and_logs' },
        { label: 'Security', href: '/documentation/security' },
        { label: 'Migrating from Other Platforms', href: '/documentation/migrating_from_other_platforms' },
        { label: 'Our Stack', href: '/documentation/our_stack' },
        { label: 'Tools', href: '/documentation/tools' },
      ],
    },
  ],
};
