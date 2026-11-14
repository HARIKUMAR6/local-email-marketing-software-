// Reusable theme + direction controls (header, mobile drawer, dashboard topbar).
import { icon } from './icons.js';

export const themeToggle = () => `
<button type="button" class="btn-icon theme-toggle" data-theme-toggle aria-pressed="false" aria-label="Switch to dark theme">
  ${icon('sun', 'icon-sun')}${icon('moon', 'icon-moon')}
</button>`;

export const dirToggle = () => `
<div class="segmented" role="group" aria-label="Text direction">
  <button type="button" data-dir-set="ltr" aria-pressed="true">LTR</button>
  <button type="button" data-dir-set="rtl" aria-pressed="false">RTL</button>
</div>`;
