// Document direction — English UI with RTL/LTR layout support.
// Toggle buttons use data-dir-set="ltr" | "rtl" and are labelled exactly "LTR" / "RTL".
import { storage } from './storage.js';
import { $$ } from './dom.js';

const KEY = 'velora-dir';
const root = document.documentElement;

export const getDir = () => (root.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr');

const sync = () => {
  const dir = getDir();
  $$('[data-dir-set]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.dirSet === dir)));
};

export const setDir = (dir) => {
  root.setAttribute('dir', dir);
  storage.set(KEY, dir);
  sync();
  document.dispatchEvent(new CustomEvent('velora:dir', { detail: { dir } }));
};

export const initDirection = () => {
  if (!root.hasAttribute('dir')) root.setAttribute('dir', storage.get(KEY) === 'rtl' ? 'rtl' : 'ltr');
  sync();
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dir-set]');
    if (btn) setDir(btn.dataset.dirSet === 'rtl' ? 'rtl' : 'ltr');
  });
};
