import React from 'react';

export default function FooterLinks() {
  return (
    <div className="footer-links-wrapper">
      <div className="footer-columns-wrapper">
        <nav className="footer-column">
          <h3 className="footer-column-title">Support</h3>
          <ul className="footer-links">
            <li><a href="https://status.nine.ch/" target="_blank" className="footer-link">Status</a></li>
            <li><a href="https://docs.nine.ch/docs/category/deploio-paas/" target="_blank" className="footer-link">Documentation</a></li>
            <li><a href="https://join.slack.com/t/deploiocommunity/shared_invite/zt-20tb3k93m-O4NEUs0RjZYGQNQoih8zkA" target="_blank" className="footer-link">Slack Community</a></li>
            <li><a href="https://github.com/ninech/deploio-examples" target="_blank" className="footer-link">GitHub Examples</a></li>
            <li><a href="/pricing" target="_blank" className="footer-link">Pricing</a></li>
          </ul>
        </nav>

        <nav className="footer-column">
          <h3 className="footer-column-title">Contact</h3>
          <ul className="footer-links">
            <li><p className="footer-link-text">Nine Internet Solutions AG<br/>Badenerstrasse 47<br/>8004 Zürich, Schweiz</p></li>
            <li><a href="mailto:info@nine.ch" target="_blank" className="footer-link">info@nine.ch</a></li>
            <li><a href="tel:+41446374040" target="_blank" className="footer-link">+41 44 637 40 40</a></li>
          </ul>
        </nav>
      </div>

      <nav className="footer-service">
        <h3 className="footer-column-title">A Service By</h3>
        <div className="service-links">
          <a href="https://www.nine.ch" target="_blank" rel="noopener noreferrer">
            <img className="service-logo" src="/img/logos/nine_logo.png" alt="Nine Logo" />
          </a>
          <a href="https://www.renuo.ch" target="_blank" rel="noopener noreferrer">
            <img className="service-logo" src="/img/logos/renuo_logo.png" alt="Renuo Logo" />
          </a>
        </div>
      </nav>
    </div>
  );
}
