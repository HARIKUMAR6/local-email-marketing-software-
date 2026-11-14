// Dashboard topbar: global search, workspace switcher, notifications, theme/direction, profile menu.
import { mount, $, $$ } from '../core/dom.js';
import { clearSession } from '../core/session.js';
import { icon, hydrateIcons } from '../components/icons.js';
import { themeToggle, dirToggle } from '../components/controls.js';
import { user, workspaces, session, notifications, campaigns, contacts } from './store.js';
import { dashboardNav } from '../config/site.js';
import { esc, avatar, toast } from './ui.js';

const PAGES = dashboardNav.flatMap((g) => g.items);

export const topbarTemplate = () => `
<header class="app-topbar">
  <div class="flex min-w-0 flex-1 items-center gap-2">
    <button type="button" class="btn-icon sidebar-open-btn" data-sidebar-open aria-controls="app-sidebar" aria-label="Open navigation">${icon('menu')}</button>
    <button type="button" class="btn-icon collapse-btn" data-sidebar-collapse aria-controls="app-sidebar" aria-expanded="true" aria-label="Collapse sidebar">${icon('panel')}</button>
    <div class="search" data-search>
      <span class="search-ico">${icon('search')}</span>
      <input class="input" id="app-search" type="search" placeholder="Search campaigns, contacts, pages…" aria-label="Search workspace" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
      <kbd class="search-kbd" aria-hidden="true">/</kbd>
      <ul class="search-results" id="search-results" role="listbox" hidden></ul>
    </div>
  </div>
  <div class="topbar-actions">
    <button type="button" class="btn btn-primary btn-sm hidden md:inline-flex" data-new-campaign>${icon('plus')}New campaign</button>
    <div class="dropdown hidden lg:block" data-dropdown>
      <button type="button" class="btn btn-outline btn-sm" data-dropdown-trigger aria-expanded="false" aria-controls="ws-menu" aria-label="Switch workspace">${icon('building')}<span data-ws-name class="max-w-[9rem] truncate">${esc(session.workspace.name)}</span>${icon('chevronDown', 'chev')}</button>
      <div class="dropdown-menu is-end" id="ws-menu"><p class="menu-title">Workspaces</p>${workspaces.map((w) => `<button type="button" class="menu-item" data-ws="${w.id}"><span class="grow text-start">${esc(w.name)}<small>${w.role}</small></span><span data-ws-check="${w.id}">${w.id === session.workspace.id ? icon('check') : ''}</span></button>`).join('')}</div>
    </div>
    ${themeToggle()}
    <span class="hidden sm:block">${dirToggle()}</span>
    <div class="dropdown" data-dropdown>
      <button type="button" class="btn-icon relative" data-dropdown-trigger aria-expanded="false" aria-controls="notif-menu" aria-label="Notifications"><span data-icon-slot>${icon('bell')}</span><span class="notif-dot" data-notif-dot${notifications.some((n) => n.unread) ? '' : ' hidden'}></span></button>
      <div class="dropdown-menu is-end w-80" id="notif-menu"><div class="flex items-center justify-between px-3 pt-1"><p class="menu-title !p-0">Notifications</p><button type="button" class="link text-small" data-mark-read>Mark all read</button></div><ul data-notif-list>${notifications.map((n) => `<li class="notif${n.unread ? ' is-unread' : ''}" data-notif="${n.id}"><p class="text-small font-bold">${esc(n.title)}</p><p class="text-small text-muted">${esc(n.body)}</p><p class="caption">${esc(n.time)}</p></li>`).join('')}</ul></div>
    </div>
    <div class="dropdown" data-dropdown>
      <button type="button" class="avatar-btn" data-dropdown-trigger aria-expanded="false" aria-controls="profile-menu" aria-label="Account menu">${avatar(user.name, 1, 'is-lg')}</button>
      <div class="dropdown-menu is-end w-64" id="profile-menu">
        <div class="px-3 py-2"><p class="font-bold" data-user-name>${esc(user.name)}</p><p class="caption" data-user-email>${esc(user.email)}</p></div>
        <hr class="divider">
        <a class="menu-item" href="#/settings?tab=profile">${icon('user')}Profile &amp; settings</a>
        <a class="menu-item" href="#/settings?tab=billing">${icon('dollar')}Billing</a>
        <a class="menu-item" href="../index.html">${icon('globe')}Back to website</a>
        <div class="px-3 py-2 sm:hidden">${dirToggle()}</div>
        <hr class="divider">
        <button type="button" class="menu-item" data-signout>${icon('logout')}Sign out</button>
      </div>
    </div>
  </div>
</header>`;

export const initTopbar = ({ go }) => {
  mount('topbar', topbarTemplate());
  const box = $('[data-search]');
  const input = $('#app-search');
  const phone = window.matchMedia('(max-width: 639.98px)');
  const placeholder = () => { input.placeholder = phone.matches ? 'Search…' : 'Search campaigns, contacts, pages…'; };
  placeholder(); phone.addEventListener('change', placeholder);
  const list = $('#search-results');
  let items = [];
  let active = -1;

  const results = (q) => {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q)).map((p) => ({ kind: 'Page', label: p.label, run: () => go(p.view) }));
    const camps = campaigns.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ kind: 'Campaign', label: c.name, run: () => go('campaigns', { q: c.name }) }));
    const people = contacts.filter((c) => c.name.toLowerCase().includes(q) || c.email.includes(q)).slice(0, 4).map((c) => ({ kind: 'Contact', label: `${c.name} · ${c.email}`, run: () => go('contacts', { q: c.email }) }));
    return [...pages, ...camps, ...people].slice(0, 9);
  };
  const paint = () => {
    list.hidden = !input.value.trim();
    input.setAttribute('aria-expanded', String(!list.hidden));
    list.innerHTML = items.length ? items.map((r, i) => `<li role="option" id="sr-${i}" data-i="${i}" aria-selected="${i === active}" class="search-item${i === active ? ' is-active' : ''}"><span class="badge">${r.kind}</span><span class="truncate">${esc(r.label)}</span></li>`).join('') : '<li class="search-empty" role="presentation">No matches found</li>';
  };
  const choose = (i) => { items[i]?.run(); input.value = ''; items = []; active = -1; paint(); input.blur(); };
  input.addEventListener('input', () => { items = results(input.value); active = items.length ? 0 : -1; paint(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(items.length - 1, active + 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); paint(); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { input.value = ''; items = []; paint(); }
    input.setAttribute('aria-activedescendant', active >= 0 ? `sr-${active}` : '');
  });
  list.addEventListener('mousedown', (e) => { const li = e.target.closest('[data-i]'); if (li) { e.preventDefault(); choose(+li.dataset.i); } });
  input.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 120));
  input.addEventListener('focus', () => { if (input.value.trim()) paint(); });
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.querySelector('dialog[open]')) { e.preventDefault(); input.focus(); } });

  // Workspace switcher
  document.addEventListener('click', (e) => {
    const ws = e.target.closest('[data-ws]');
    if (ws) {
      session.workspace = workspaces.find((w) => w.id === ws.dataset.ws);
      $('[data-ws-name]').textContent = session.workspace.name;
      $$('[data-ws-check]').forEach((c) => { c.innerHTML = c.dataset.wsCheck === ws.dataset.ws ? icon('check') : ''; });
      toast(`Switched to ${session.workspace.name}`, 'info');
    }
    if (e.target.closest('[data-mark-read]')) {
      notifications.forEach((n) => { n.unread = false; });
      $$('[data-notif]').forEach((n) => n.classList.remove('is-unread'));
      $('[data-notif-dot]').hidden = true;
      toast('All notifications marked as read', 'info');
    }
    if (e.target.closest('[data-signout]')) { clearSession(); location.href = '../login.html'; }
    if (e.target.closest('[data-new-campaign]')) document.dispatchEvent(new CustomEvent('velora:new-campaign'));
  });
  hydrateIcons();
};
