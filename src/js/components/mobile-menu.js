// Tablet/mobile drawer (< 1024px): focus trap, Esc, overlay click, scroll lock.
import { $, lockScroll, trapFocus, DESKTOP_MQ } from '../core/dom.js';
import { closeAllDropdowns } from './dropdown.js';

export const initMobileMenu = () => {
  const drawer = $('#mobile-drawer');
  const toggle = $('[data-drawer-open]');
  const overlay = $('[data-drawer-overlay]');
  if (!drawer || !toggle) return;

  let release = null;

  const open = () => {
    if (drawer.classList.contains('is-open')) return;
    drawer.classList.add('is-open');
    overlay?.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    release = trapFocus(drawer);
    requestAnimationFrame(() => $('[data-drawer-close]', drawer)?.focus());
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    overlay?.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    closeAllDropdowns(); // Home accordion returns to its closed default
    lockScroll(false);
    release?.();
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', open);
  overlay?.addEventListener('click', () => close());
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-drawer-close]') || e.target.closest('a[href]')) close({ restoreFocus: false });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  DESKTOP_MQ.addEventListener('change', (e) => { if (e.matches) close({ restoreFocus: false }); });
};
