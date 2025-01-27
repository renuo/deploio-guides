import React from "react";
import iso9001Icon from '/img/icons/iso_9001:2015_certification.png';
import iso27001Icon from '/img/icons/iso_27001:2013_certification.png';
import co2NeutralIcon from '/img/icons/co2_neutral_certification.png';

export default function FooterCertificates() {
  return (
    <div className="certificates-wrapper">
      <img src={iso9001Icon} alt="ISO 9001:2015 certification"/>
      <img src={iso27001Icon} alt="ISO 27001:2013 certification"/>
      <img src={co2NeutralIcon} alt="CO2 neutral certification"/>
    </div>
  )
}

