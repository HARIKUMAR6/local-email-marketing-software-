// Public site header + tablet/mobile drawer (theme, direction and CTA controls inside).
import { primaryNav, ctas } from '../config/site.js';
import { url, isCurrent, mount, $ } from '../core/dom.js';
import { icon } from './icons.js';
import { logo } from './logo.js';
import { themeToggle, dirToggle } from './controls.js';

const current = (href) => (isCurrent(href) ? ' aria-current="page"' : '');
const childCurrent = (item) => (item.children?.some((c) => isCurrent(c.href)) ? ' aria-current="page"' : '');

const navItem = (item, scope) => {
  if (!item.children) return `<a class="nav-link${item.accent ? ' nav-link-accent' : ''}" href="${url(item.href)}"${current(item.href)}>${item.icon ? icon(item.icon, 'nav-ico') : ''}${item.label}</a>`;
  const id = `${scope}-${item.label.toLowerCase()}-menu`;
  const links = item.children.map((c) => `
      <a class="dropdown-item" href="${url(c.href)}"${current(c.href)}>${c.label}${c.desc ? `<small>${c.desc}</small>` : ''}</a>`).join('');
  // Closed by default; opened by click only (dropdown.js) — no hover behaviour.
  return `
  <div class="dropdown" data-dropdown${scope === 'drawer' ? '="accordion"' : ''}>
    <button type="button" class="nav-link" data-dropdown-trigger aria-expanded="false" aria-controls="${id}"${childCurrent(item)}>
      ${item.label}${icon('chevronDown', 'chev')}
    </button>
    <div class="dropdown-menu" id="${id}">${links}
    </div>
  </div>`;
};

const nav = (scope) => primaryNav.map((item) => navItem(item, scope)).join('');

export const headerTemplate = () => `
<a class="skip-link sr-only-focusable" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="container-v site-header-inner">
    ${logo()}
    <nav class="nav-desktop" aria-label="Primary">${nav('desktop')}</nav>
    <div class="header-actions">
      ${themeToggle()}
      ${dirToggle()}
      <a class="btn btn-ghost btn-sm hidden xl:inline-flex" href="${url(ctas.login.href)}">${ctas.login.label}</a>
      <a class="btn btn-primary btn-sm" href="${url(ctas.primary.href)}">${ctas.primary.label}</a>
    </div>
    <button type="button" class="btn-icon nav-toggle" data-drawer-open aria-controls="mobile-drawer" aria-expanded="false" aria-label="Open menu">
      ${icon('menu')}
    </button>
  </div>
</header>
<aside class="drawer" id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
  <div class="drawer-head">
    ${logo()}
    <button type="button" class="btn-icon" data-drawer-close aria-label="Close menu">${icon('close')}</button>
  </div>
  <nav class="drawer-body" aria-label="Mobile">${nav('drawer')}</nav>
  <div class="drawer-foot">
    <div class="drawer-controls">
      <span class="text-small font-semibold">Appearance</span>
      <div class="flex items-center gap-2">${themeToggle()}${dirToggle()}</div>
    </div>
    <div class="drawer-ctas">
      <a class="btn btn-primary" href="${url(ctas.primary.href)}">${ctas.primary.label}</a>
      <a class="btn btn-outline" href="${url(ctas.login.href)}">${ctas.login.label}</a>
    </div>
  </div>
</aside>
<div class="drawer-overlay" data-drawer-overlay></div>`;

export const initHeader = () => {
  mount('header', headerTemplate());
  const header = $('[data-header]');
  if (!header) return;
  let ticking = false;
  const update = () => { header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
};
