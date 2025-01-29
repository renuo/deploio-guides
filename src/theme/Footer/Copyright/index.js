import React from 'react';
import Link from "@docusaurus/Link";

export default function FooterCopyright() {
  return (
    <>
      <div className="copyright-border-wrapper">
        <hr />
      </div>

      <nav className="copyright-wrapper">
        <p>Copyright © {new Date().getFullYear()} Nine Internet Solutions AG</p>
        <Link href="https://docs.nine.ch/de/docs/legal-documents/general-terms-and-conditions">Terms & Conditions</Link>
        <Link href="https://www.nine.ch/de/privacy-policy">Privacy Policy</Link>
      </nav>
    </>
  );
}
