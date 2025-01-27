import React from 'react';
import swissMadeSoftwareAndHosting from '/img/icons/swiss_made_software_and_hosting.png';
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function FooterSocials({ socials }) {
  return (
    <>
      <div className="footer-socials-wrapper">
        <a className="swiss-made-software" href="https://www.swissmadesoftware.org/home.html">
          <img
            src={swissMadeSoftwareAndHosting}
            alt="swiss made software + hosting"/>
        </a>

        {socials.map(({src, href, alt}, index) => (
          <a className="socials" key={index} href={href} target="_blank" rel="noopener noreferrer">
            <img
              src={useBaseUrl(src)}
              alt={alt}
            />
          </a>
        ))}
      </div>
    </>
  )
}
