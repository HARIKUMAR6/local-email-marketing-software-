// Light / dark theme — follows the system preference until the user chooses.
// The inline <head> snippet applies the stored theme before paint (no flash).
import { storage } from './storage.js';
import { $$ } from './dom.js';

const KEY = 'velora-theme';
const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

export const getTheme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

const sync = () => {
  const dark = getTheme() === 'dark';
  $$('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  });
};

export const setTheme = (theme, persist = true) => {
  root.dataset.theme = theme;
  if (persist) storage.set(KEY, theme);
  sync();
  document.dispatchEvent(new CustomEvent('velora:theme', { detail: { theme } }));
};

export const initTheme = () => {
  if (!root.dataset.theme) root.dataset.theme = storage.get(KEY) || (systemDark.matches ? 'dark' : 'light');
  sync();
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-theme-toggle]')) setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
  systemDark.addEventListener('change', (e) => {
    if (!storage.get(KEY)) setTheme(e.matches ? 'dark' : 'light', false);
  });
};
