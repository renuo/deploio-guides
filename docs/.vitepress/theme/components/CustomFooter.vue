<template>
  <div class="footer-content">
    <footer class="footer container">
      <div class="certificates-wrapper">
        <img
          src="/img/iso_9001:2015_certification.png"
          alt="ISO 9001:2015 certification"
        >
        <img
          src="/img/iso_27001:2022_certification.png"
          alt="ISO 27001:2022 certification"
        >
        <img
          src="/img/co2_neutral_certification.png"
          alt="CO2 neutral certification"
        >
      </div>

      <div>
        <div class="footer-links-wrapper">
          <div class="footer-columns-wrapper">
            <nav class="footer-column">
              <h3 class="footer-column-title">Support</h3>
              <ul class="footer-links">
                <li>
                  <a href="https://status.nine.ch/" target="_blank" class="footer-link">Status</a>
                </li>
                <li>
                  <a href="https://docs.nine.ch/docs/category/deploio-paas/" target="_blank" class="footer-link">Documentation</a>
                </li>
                <li>
                  <a href="https://join.slack.com/t/deploiocommunity/shared_invite/zt-20tb3k93m-O4NEUs0RjZYGQNQoih8zkA" target="_blank" class="footer-link">Slack Community</a>
                </li>
                <li>
                  <a href="https://github.com/ninech/deploio-examples" target="_blank" class="footer-link">GitHub Examples</a>
                </li>
                <li>
                  <a href="/pricing" target="_blank" class="footer-link">Pricing</a>
                </li>
              </ul>
            </nav>

            <nav class="footer-column">
              <h3 class="footer-column-title">Contact</h3>
              <ul class="footer-links">
                <li>
                  <p class="footer-link-text">
                    Nine Internet Solutions AG<br>
                    Badenerstrasse 47<br>
                    8004 Zürich, Schweiz
                  </p>
                </li>
                <li>
                  <a href="mailto:info@nine.ch" target="_blank" class="footer-link">info@nine.ch</a>
                </li>
                <li>
                  <a href="tel:+41446374040" target="_blank" class="footer-link">+41 44 637 40 40</a>
                </li>
              </ul>
            </nav>
          </div>

          <nav class="footer-service">
            <h3 class="footer-column-title">A Service By</h3>
            <div class="service-links">
              <a href="https://www.nine.ch" target="_blank" rel="noopener noreferrer">
                <img class="service-logo" src="/img/logos/nine_logo.png" alt="Nine Logo">
              </a>
              <a href="https://www.renuo.ch" target="_blank" rel="noopener noreferrer">
                <img class="service-logo" src="/img/logos/renuo_logo.png" alt="Renuo Logo">
              </a>
            </div>
          </nav>
        </div>

        <div class="footer-socials-wrapper">
          <a class="swiss-made-software" href="https://www.swissmadesoftware.org/home.html">
            <img
              src="/img/swiss_made_software_and_hosting.png"
              alt="swiss made software + hosting"
            >
          </a>
          <a class="socials" href="https://www.facebook.com/deploioch/" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/facebook.svg" alt="Deploio Facebook account">
          </a>
          <a class="socials" href="https://www.instagram.com/deploio/" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/instagram.svg" alt="Deploio Instagram account">
          </a>
          <a class="socials" href="https://linkedin.com/company/deploio" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/linkedin.svg" alt="Deploio LinkedIn account">
          </a>
          <a class="socials" href="https://www.reddit.com/user/deploio" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/reddit.svg" alt="Deploio Reddit account">
          </a>
          <a class="socials" href="https://www.twitter.com/deplo_io" target="_blank" rel="noopener noreferrer">
            <img src="/img/icons/x.svg" alt="Deploio Twitter account">
          </a>
        </div>

        <div class="copyright-border-wrapper">
          <hr>
        </div>

        <nav class="copyright-wrapper">
          <p>Copyright © 2025 Nine Internet Solutions AG</p>
          <a href="https://docs.nine.ch/de/docs/legal-documents/general-terms-and-conditions" target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </a>
          <a href="https://www.nine.ch/de/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.footer-content {
  background-color: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 0;
}

.footer {
  max-width: 1152px;
  margin: 0 auto;
  padding: 48px 24px;
}

.certificates-wrapper {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.certificates-wrapper img {
  height: 60px;
  width: auto;
}

.footer-links-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .footer-links-wrapper {
    grid-template-columns: 2fr 1fr;
  }
}

.footer-columns-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

@media (min-width: 640px) {
  .footer-columns-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-column-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--vp-c-brand-1);
}

.footer-link-text {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.footer-service {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-links {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.service-logo {
  height: 32px;
  width: auto;
}

.footer-socials-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 24px 0;
}

.swiss-made-software img {
  height: 48px;
  width: auto;
}

.socials img {
  height: 24px;
  width: 24px;
  transition: opacity 0.2s;
}

.socials:hover img {
  opacity: 0.7;
}

.copyright-border-wrapper {
  margin: 24px 0;
}

.copyright-border-wrapper hr {
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

.copyright-wrapper {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.copyright-wrapper p {
  margin: 0;
}

.copyright-wrapper a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.copyright-wrapper a:hover {
  color: var(--vp-c-brand-1);
}
</style>
