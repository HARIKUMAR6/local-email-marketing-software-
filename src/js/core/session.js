// Simulated session (frontend only). Nothing is sent to a server.
// "Remember me" keeps the session in localStorage; otherwise it lasts for the browser tab (sessionStorage).
const KEY = 'velora-session';
const ACCOUNTS = 'velora-accounts';

const read = (store, key) => { try { return JSON.parse(store.getItem(key) || 'null'); } catch { return null; } };
const write = (store, key, val) => { try { store.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } };

export const getSession = () => read(localStorage, KEY) || read(sessionStorage, KEY);

export const setSession = (user, remember) => {
  clearSession();
  write(remember ? localStorage : sessionStorage, KEY, user);
};

export const clearSession = () => {
  try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch { /* ignore */ }
};

const FALLBACK = { name: 'Alex Morgan', email: 'alex@alderandco.com', workspace: 'Alder & Co.' };
export const currentUser = () => ({ ...FALLBACK, ...(getSession() || {}) });

/** Locally created accounts (email + password hash). Used only to give realistic sign-in feedback. */
export const accounts = {
  all: () => read(localStorage, ACCOUNTS) || [],
  find: (email) => accounts.all().find((a) => a.email === email.toLowerCase()),
  add: (acc) => write(localStorage, ACCOUNTS, [...accounts.all(), { ...acc, email: acc.email.toLowerCase() }]),
  update: (email, patch) => write(localStorage, ACCOUNTS, accounts.all().map((a) => (a.email === email.toLowerCase() ? { ...a, ...patch } : a))),
};

export const hash = async (text) => {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return String(h);
};
