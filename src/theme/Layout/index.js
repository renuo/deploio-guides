import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
  PageMetadata,
  SkipToContentFallbackId,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import SearchBar from '@theme/SearchBar';
import styles from './styles.module.css';
import sidebarStyles from '../Root.module.css';
import { sidebarConfig } from '../../config/sidebar';

function SidebarCategory({ label, items, pathname }) {
  // Check if any item in this category is active (including nested subcategories)
  const hasActiveItem = items.some(item => {
    if (item.type === 'subcategory') {
      return item.items.some(subItem => pathname.startsWith(subItem.href));
    }
    return item.href && pathname.startsWith(item.href);
  });

  const [isOpen, setIsOpen] = React.useState(hasActiveItem);

  React.useEffect(() => {
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }, [hasActiveItem]);

  return (
    <div className={sidebarStyles.category}>
      <button
        className={sidebarStyles.categoryButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <span className={sidebarStyles.arrow}>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <ul className={sidebarStyles.categoryItems}>
          {items.map((item, idx) => (
            <SidebarItem key={idx} item={item} pathname={pathname} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarItem({ item, pathname }) {
  if (item.type === 'subcategory') {
    return <SidebarCategory label={item.label} items={item.items} pathname={pathname} />;
  }

  return (
    <li className={sidebarStyles.categoryItem}>
      <Link
        to={item.href}
        className={`${sidebarStyles.link} ${
          pathname.startsWith(item.href) ? sidebarStyles.linkActive : ''
        }`}
      >
        {item.label}
      </Link>
    </li>
  );
}

function GlobalSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className={sidebarStyles.sidebar}>
      <div className={sidebarStyles.sidebarSearch}>
        <SearchBar />
      </div>
      <div className={sidebarStyles.sidebarContent}>
        {sidebarConfig.items.map((item, idx) => {
          if (item.type === 'link') {
            return (
              <Link
                key={idx}
                to={item.href}
                className={`${sidebarStyles.topLevelLink} ${
                  pathname === item.href ? sidebarStyles.linkActive : ''
                }`}
              >
                {item.label}
              </Link>
            );
          }
          if (item.type === 'category') {
            return (
              <SidebarCategory
                key={idx}
                label={item.label}
                items={item.items}
                pathname={pathname}
              />
            );
          }
          return null;
        })}
      </div>
    </nav>
  );
}

export default function Layout(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    title,
    description,
  } = props;

  useKeyboardNavigation();

  return (
    <LayoutProvider>
      <PageMetadata title={title} description={description} />

      <SkipToContent />

      <AnnouncementBar />

      <Navbar />

      <GlobalSidebar />

      <div
        id={SkipToContentFallbackId}
        className={clsx(
          ThemeClassNames.wrapper.main,
          styles.mainWrapper,
          wrapperClassName,
        )}>
        <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
          {children}
        </ErrorBoundary>
      </div>

      {!noFooter && <Footer />}
    </LayoutProvider>
  );
}
