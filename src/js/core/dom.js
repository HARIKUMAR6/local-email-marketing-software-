// Small DOM helpers shared by every module.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Relative base for pages in sub-folders: <html data-base="../">. */
export const base = () => document.documentElement.dataset.base || '';

/** Resolve a project-relative path for the current page depth. */
export const url = (path) => (/^(?:[a-z]+:|#|\/)/i.test(path) ? path : base() + path);

/** True when the path points at the current document. */
export const isCurrent = (path) => {
  if (path.includes('#')) return false;
  // Compare the path relative to the project root, so dashboard/index.html is not mistaken for index.html.
  const parts = location.pathname.split('/');
  const file = parts.pop() || 'index.html';
  const here = base() ? `${parts.pop()}/${file}` : file;
  return path === here;
};

/** Replace every [data-component="name"] placeholder with an HTML string. */
export const mount = (name, html) =>
  $$(`[data-component="${name}"]`).forEach((el) => { el.outerHTML = html; });

let lockCount = 0;
export const lockScroll = (on) => {
  lockCount = Math.max(0, lockCount + (on ? 1 : -1));
  document.body.classList.toggle('is-locked', lockCount > 0);
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Keep Tab focus inside `container`; returns a release function. */
export const trapFocus = (container) => {
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
};

export const DESKTOP_MQ = window.matchMedia('(min-width: 1024px)');
