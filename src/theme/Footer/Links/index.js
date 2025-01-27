import React from 'react';

export default function FooterLinks({ columns, serviceTitle, serviceLinks }) {
  return (
    <div className="footer-links-wrapper">
      <div className={"footer-columns-wrapper"}>
        {columns.map(({title, links}, index) => (
          <nav className="footer-column" key={index}>
            <h3 className="footer-column-title">{title}</h3>
            <ul className="footer-links">
              {links.map((link, i) => (
                <li key={i}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      {link.text}
                    </a>
                  ) : (
                    <p className="footer-link-text">{link.text}</p>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <nav className="footer-service">
        <h3 className="footer-column-title">{serviceTitle}</h3>
        <div className="service-links">
          {serviceLinks.map(({href, src, alt}, i) => (
            <a href={href} target="_blank" rel="noopener noreferrer" key={i}>
              <img className="service-logo" src={src} alt={alt}/>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
