import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from '../css/homepage.module.css';

const technologies = [
  { name: 'Docker', icon: 'docker.svg', href: '/quick_start/Docker/create_app' },
  { name: 'Node.js', icon: 'nodejs.svg', href: '/quick_start/Node.js/create_app' },
  { name: 'Ruby', icon: 'ruby.svg', href: '/quick_start/Ruby on Rails/create_app' },
  { name: 'PHP', icon: 'php.svg', href: '/quick_start/PHP/create_app' },
  { name: 'Go', icon: 'go.svg', href: '/quick_start/Go/create_app' },
  { name: 'Python', icon: 'python.svg', href: '/quick_start/Python/create_app' },
  { name: 'HTML', icon: 'html.svg', href: '/quick_start/Static Pages/create_app' },
];

function TechnologyCard({ name, icon, href }) {
  return (
    <Link to={href} className={styles.techCard}>
      <div className={styles.techCardContent}>
        <img src={`/img/icons/${icon}`} alt={name} className={styles.techIcon} />
        <span className={styles.techName}>{name}</span>
        <span className={styles.techArrow}>→</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout>
      <div className={styles.homepageContainer}>
        <main className={styles.homepage}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
              <h1 className={styles.heroTitle}>DEPLOIO DEVELOPER DOCUMENTATION</h1>
              <p className={styles.heroSubtitle}>
                Welcome to the Deploio documentation. Here you'll find the reference
                information you need to get started with Deploio quickly.
              </p>
            </section>

            {/* Quick Start Section */}
            <section className={styles.quickStartSection}>
              <h2 className={styles.sectionTitle}>QUICK START YOUR PROJECT</h2>
              <div className={styles.techGrid}>
                {technologies.map((tech) => (
                  <TechnologyCard key={tech.name} {...tech} />
                ))}
              </div>
            </section>

            {/* Questions Section */}
            <section className={styles.questionsSection}>
              <h2 className={styles.sectionTitle}>ANY QUESTIONS?</h2>
              <p className={styles.questionsText}>
                Join our Community on{' '}
                <a href="https://slack.com" target="_blank" rel="noopener noreferrer">
                  Slack
                </a>{' '}
                or{' '}
                <a href="/contact" rel="noopener noreferrer">
                  get in touch
                </a>
                .
              </p>
            </section>
          </main>
      </div>
    </Layout>
  );
}
