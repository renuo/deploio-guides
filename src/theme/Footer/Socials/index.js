import React from 'react';
import swissMadeSoftwareAndHosting from '/img/icons/swiss_made_software_and_hosting.png';
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function FooterSocials() {
  return (
    <div className="footer-socials-wrapper">
      <a className="swiss-made-software" href="https://www.swissmadesoftware.org/home.html">
        <img src={swissMadeSoftwareAndHosting} alt="swiss made software + hosting" />
      </a>

      <a className="socials" href="https://www.facebook.com/deploioch/" target="_blank" rel="noopener noreferrer">
        <img src={useBaseUrl('/img/icons/facebook.svg')} alt="Deploio Facebook account" />
      </a>
      <a className="socials" href="https://www.instagram.com/deploio/" target="_blank" rel="noopener noreferrer">
        <img src={useBaseUrl('/img/icons/instagram.svg')} alt="Deploio Instagram account" />
      </a>
      <a className="socials" href="https://linkedin.com/company/deploio" target="_blank" rel="noopener noreferrer">
        <img src={useBaseUrl('/img/icons/linkedin.svg')} alt="Deploio LinkedIn account" />
      </a>
      <a className="socials" href="https://www.reddit.com/user/deploio" target="_blank" rel="noopener noreferrer">
        <img src={useBaseUrl('/img/icons/reddit.svg')} alt="Deploio Reddit account" />
      </a>
      <a className="socials" href="https://www.twitter.com/deplo_io" target="_blank" rel="noopener noreferrer">
        <img src={useBaseUrl('/img/icons/x.svg')} alt="Deploio Twitter account" />
      </a>
    </div>
  );
}
