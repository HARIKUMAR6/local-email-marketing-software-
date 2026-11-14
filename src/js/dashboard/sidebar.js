// Dashboard sidebar: off-canvas below 1024px, collapsible rail on desktop.
import { dashboardNav } from '../config/site.js';
import { mount, $, $$, lockScroll, trapFocus, DESKTOP_MQ } from '../core/dom.js';
import { storage } from '../core/storage.js';
import { icon } from '../components/icons.js';
import { logo } from '../components/logo.js';
import { contacts, session } from './store.js';

const KEY = 'velora-sidebar';

export const sidebarTemplate = () => {
  const limit = parseInt(session.plan.contacts.replace(/,/g, ''), 10);
  const used = contacts.length;
  return `
<aside class="app-sidebar" id="app-sidebar" aria-label="Main navigation">
  <div class="sidebar-head">
    ${logo({ href: 'dashboard/index.html' })}
    <button type="button" class="btn-icon lg:hidden" data-sidebar-close aria-label="Close sidebar">${icon('close')}</button>
  </div>
  <nav class="sidebar-nav" aria-label="Dashboard">
    ${dashboardNav.map((g) => `
      <p class="sidebar-section-title">${g.section}</p>
      ${g.items.map((i) => `<a class="sidebar-link" href="#/${i.view}" data-view-link="${i.view}" title="${i.label}">${icon(i.icon)}<span class="sidebar-label">${i.label}</span></a>`).join('')}`).join('')}
  </nav>
  <div class="sidebar-foot sidebar-label">
    <div class="plan-card">
      <p class="text-small font-bold">${session.plan.name} plan</p>
      <p class="caption">${used.toLocaleString('en-US')} of ${limit.toLocaleString('en-US')} contacts</p>
      <span class="pv-track mt-2 block"><i class="pv-fill" style="width:${Math.max(2, (used / limit) * 100)}%"></i></span>
      <a class="link mt-2 inline-block text-small" href="#/settings?tab=billing">Manage plan</a>
    </div>
  </div>
</aside>
<div class="app-overlay" data-sidebar-overlay></div>`;
};

export const setActiveLink = (view) => {
  $$('[data-view-link]').forEach((a) => (a.dataset.viewLink === view ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
};

export const initSidebar = () => {
  mount('sidebar', sidebarTemplate());
  const app = $('.app');
  const sidebar = $('#app-sidebar');
  const overlay = $('[data-sidebar-overlay]');
  if (!app || !sidebar) return;
  if (storage.get(KEY) === 'collapsed') app.classList.add('is-collapsed');
  let release = null;

  const open = () => {
    sidebar.classList.add('is-open'); overlay.classList.add('is-open');
    lockScroll(true); release = trapFocus(sidebar);
    $('[data-sidebar-close]', sidebar)?.focus();
  };
  const close = (restore = true) => {
    if (!sidebar.classList.contains('is-open')) return;
    sidebar.classList.remove('is-open'); overlay.classList.remove('is-open');
    lockScroll(false); release?.();
    if (restore) $('[data-sidebar-open]')?.focus();
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sidebar-open]')) open();
    else if (e.target.closest('[data-sidebar-close]') || e.target === overlay) close();
    else if (e.target.closest('.sidebar-link') && sidebar.classList.contains('is-open')) close(false);
    else if (e.target.closest('[data-sidebar-collapse]')) {
      const btn = e.target.closest('[data-sidebar-collapse]');
      const collapsed = app.classList.toggle('is-collapsed');
      storage.set(KEY, collapsed ? 'collapsed' : 'expanded');
      btn.setAttribute('aria-expanded', String(!collapsed));
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  DESKTOP_MQ.addEventListener('change', (e) => { if (e.matches) close(false); });
};
