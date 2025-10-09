import React, {useState} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import styles from './styles.module.css';

function MobileNavLink({to, label, external, isButton}) {
  const mobileSidebar = useNavbarMobileSidebar();
  const className = isButton ? styles.mobileNavButton : styles.mobileNavLink;

  if (external) {
    return (
      <a
        href={to}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={to}
      className={className}
      onClick={() => mobileSidebar.toggle()}
    >
      {label}
    </a>
  );
}

function QuickStartSubmenu() {
  const [isOpen, setIsOpen] = useState(false);
  const mobileSidebar = useNavbarMobileSidebar();

  const quickStartItems = [
    {to: '/documentation/how_deploio_works', label: 'How Deploio Works'},
    {to: '/documentation/getting_started', label: 'Getting Started'},
    {to: '/documentation/code_repository_setup', label: 'Code Repository Setup'},
    {to: '/documentation/configuring_your_database', label: 'Configuring Your Database'},
    {to: '/documentation/other_dependencies', label: 'Other Dependencies'},
    {to: '/documentation/configuring_your_application', label: 'Configuring Your Application'},
    {to: '/documentation/networking_and_deployment', label: 'Networking and Deployment'},
    {to: '/documentation/ci_cd_integration', label: 'CI/CD Integration'},
    {to: '/documentation/troubleshooting', label: 'Troubleshooting'},
    {to: '/documentation/monitoring_and_logs', label: 'Monitoring and Logs'},
    {to: '/documentation/security', label: 'Security'},
    {to: '/documentation/migrating_from_other_platforms', label: 'Migrating from Other Platforms'},
    {to: '/documentation/our_stack', label: 'Our Stack'},
    {to: '/documentation/tools', label: 'Tools'},
  ];

  return (
    <div className={styles.submenuContainer}>
      <button
        className={styles.submenuToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        Quick Start {isOpen ? '▼' : '▶'}
      </button>
      {isOpen && (
        <div className={styles.submenuContent}>
          {quickStartItems.map((item, idx) => (
            <a
              key={idx}
              href={item.to}
              className={styles.submenuLink}
              onClick={() => mobileSidebar.toggle()}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavbarMobileSidebarPrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <div className={styles.primaryMenu}>
      <MobileNavLink to="/about_deploio" label="About Deploio" />

      <QuickStartSubmenu />

      <MobileNavLink to="/documentation" label="User Guide" />

      <div className={styles.divider} />

      <MobileNavLink
        to="https://deplo.io/#register"
        label="Get Started"
        external
        isButton
      />

      <MobileNavLink
        to="https://cockpit.nine.ch/de/session/new?origin=%2F"
        label="Login"
        external
      />

      <MobileNavLink
        to="https://deplo.io/pricing"
        label="Pricing"
        external
      />

      <MobileNavLink
        to="https://deplo.io"
        label="Deploio Website"
        external
      />

      <MobileNavLink
        to="https://docs.nine.ch/docs/category/deploio-paas/"
        label="Nine Platform"
        external
      />
    </div>
  );
}
