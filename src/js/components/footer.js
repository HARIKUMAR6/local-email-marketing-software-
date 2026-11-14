// Public site footer: brand, link columns, contact (with icons), social icons.
import { brand, footerNav, contact, social } from '../config/site.js';
import { url, mount } from '../core/dom.js';
import { icon } from './icons.js';
import { logo } from './logo.js';

const column = ({ title, links }) => `
  <div>
    <h2 class="footer-title">${title}</h2>
    <ul class="footer-links">
      ${links.map((l) => `<li><a href="${url(l.href)}">${l.label}</a></li>`).join('')}
    </ul>
  </div>`;

const contactItem = (c) => {
  const inner = `${icon(c.icon)}<span>${c.label}</span>`;
  return `<li>${c.href ? `<a class="contact-item" href="${c.href}">${inner}</a>` : `<span class="contact-item">${inner}</span>`}</li>`;
};

export const footerTemplate = () => `
<footer class="site-footer">
  <div class="container-v">
    <div class="footer-grid">
      <div class="footer-brand">
        ${logo({ tagline: true })}
        <p class="text-small">${brand.summary}</p>
        <ul class="social-list" aria-label="Social media">
          ${social.map((s) => `<li><a class="social-link" href="${s.href}" aria-label="${s.label}">${icon(s.icon)}</a></li>`).join('')}
        </ul>
      </div>
      ${footerNav.map(column).join('')}
      <div id="contact">
        <h2 class="footer-title">Contact</h2>
        <ul class="contact-list">${contact.map(contactItem).join('')}</ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
      <nav aria-label="Legal">
        <a href="${url('privacy.html')}">Privacy</a>
        <a href="${url('terms.html')}">Terms</a>
        <a href="${url('cookies.html')}">Cookies</a>
      </nav>
    </div>
  </div>
</footer>`;

export const initFooter = () => mount('footer', footerTemplate());
