import React from 'react';
import FooterLayout from '@theme/Footer/Layout';
import { columns, serviceTitle, serviceLinks, socials, copyright } from './footerConfig';


function Footer() {
  return (
    <FooterLayout
      columns={columns}
      serviceTitle={serviceTitle}
      serviceLinks={serviceLinks}
      socials={socials}
      copyright={copyright}
    />
  );
}
export default React.memo(Footer);
