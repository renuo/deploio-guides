import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import FooterLinks from "../Links";
import FooterSocials from "../Socials";
import FooterCertificates from "../Certificates";
import FooterCopyright from "../Copyright";

export default function FooterLayout() {
  return (
    <div className="footer-wrapper">
      <div className="footer-background">
        <img
          src={useBaseUrl('/img/backgrounds/mountain_2.png')}
          alt="Mountain Background"
        />
        <div className="footer-gradient"></div>
      </div>
      <div className="footer-content">
        <footer className="footer container">
          <FooterCertificates />
          <div>
            <FooterLinks />
            <FooterSocials />
            <FooterCopyright />
          </div>
        </footer>
      </div>
    </div>
  );
}

