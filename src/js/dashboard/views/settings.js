import { user, session, team, contacts, workspaces, nextId, num } from '../store.js';
import { plans } from '../../config/pricing.js';
import { setTheme, getTheme } from '../../core/theme.js';
import { setDir, getDir } from '../../core/direction.js';
import { pageHead, tabsBar, selectTab, esc, badge, avatar, icon, hydrateIcons, field, validate, liveValidate, openModal, confirmBox, toast, dataTable, $, $$ } from '../ui.js';

export const title = 'Settings';
const TABS = [['profile', 'Profile'], ['workspace', 'Workspace'], ['domain', 'Sending domain'], ['team', 'Team'], ['notifications', 'Notifications'], ['billing', 'Billing'], ['api', 'API & security']];
const prefs = { sent: true, digest: true, automation: true, billing: false, product: false };
const dns = [{ type: 'TXT', host: '@', value: 'v=spf1 include:mail.velora.io ~all', ok: false }, { type: 'CNAME', host: 'velora._domainkey', value: 'dkim.velora.io', ok: false }, { type: 'TXT', host: '_dmarc', value: 'v=DMARC1; p=none; rua=mailto:dmarc@alderandco.com', ok: false }];
let offPrefs = null;
const api = { key: `vel_live_${'k7Qm2xT9pLw4RzN8vB3cYd6H'}`, shown: false };
const panel = (k, body, i) => `<div id="panel-${k}" role="tabpanel" aria-labelledby="tab-${k}" tabindex="0" class="grid gap-4"${i ? ' hidden' : ''}>${body}</div>`;
const card = (t, sub, body) => `<section class="panel"><div class="panel-head"><div><h2 class="h5">${t}</h2>${sub ? `<p class="caption">${sub}</p>` : ''}</div></div>${body}</section>`;
const saveBtn = (label = 'Save changes') => `<div class="save-row"><button class="btn btn-primary" type="submit">${label}</button><span class="text-small text-muted">Changes apply to this session.</span></div>`;

export const render = () => `
${pageHead('Settings', 'Manage your profile, workspace, team and billing.')}
${tabsBar('Settings sections', TABS)}
${panel('profile', `
  <form id="st-profile" novalidate>${card('Profile', 'Your personal details', `<div class="grid gap-4 sm:grid-cols-2">${field({ id: 'pf-name', label: 'Full name', required: true, minlength: 2, value: user.name })}${field({ id: 'pf-email', label: 'Email', type: 'email', required: true, value: user.email })}${field({ id: 'pf-role', label: 'Job title', value: 'Marketing lead' })}${field({ id: 'pf-tz', label: 'Time zone', options: ['Asia/Kolkata (IST)', 'Europe/London (GMT)', 'America/New_York (ET)', 'Australia/Sydney (AEST)'] })}</div>${saveBtn()}`)}</form>
  ${card('Appearance', 'Choose how VELORA looks and reads', `<div class="flex flex-wrap items-center gap-6"><div><p class="label mb-2">Theme</p><div class="segmented" role="group" aria-label="Theme"><button type="button" data-theme-set="light" aria-pressed="false">Light</button><button type="button" data-theme-set="dark" aria-pressed="false">Dark</button></div></div><div><p class="label mb-2">Direction</p><div class="segmented" role="group" aria-label="Page direction"><button type="button" data-dir-pref="ltr" aria-pressed="false">LTR</button><button type="button" data-dir-pref="rtl" aria-pressed="false">RTL</button></div></div></div>`)}`, 0)}
${panel('workspace', `<form id="st-workspace" novalidate>${card('Workspace', 'Defaults used for every campaign', `<div class="grid gap-4 sm:grid-cols-2">${field({ id: 'ws-name', label: 'Workspace name', required: true, minlength: 2, value: session.workspace.name })}${field({ id: 'ws-from', label: 'Default sender name', required: true, value: session.workspace.name })}${field({ id: 'ws-email', label: 'Sender email', type: 'email', required: true, value: 'hello@alderandco.com' })}${field({ id: 'ws-reply', label: 'Reply-to email', type: 'email', value: 'support@alderandco.com' })}${field({ id: 'ws-addr', label: 'Postal address (shown in email footers)', value: 'Nandambakkam, Chennai, Tamil Nadu, India', cls: 'sm:col-span-2' })}</div>${saveBtn()}`)}</form>`, 1)}
${panel('domain', card('Sending domain', 'Authenticate alderandco.com so your emails reach the inbox', `<div class="tbl-wrap" tabindex="0" role="region" aria-label="DNS records"><table class="tbl"><thead><tr><th scope="col">Type</th><th scope="col">Host</th><th scope="col">Value</th><th scope="col">Status</th></tr></thead><tbody id="dns-body"></tbody></table></div><div class="mt-4"><button class="btn btn-primary" type="button" data-verify>${icon('shieldCheck')}Verify records</button></div>`), 1)}
${panel('team', card('Team members', 'People with access to this workspace', `<div class="mb-3 flex justify-end"><button class="btn btn-primary btn-sm" type="button" data-invite>${icon('userPlus')}Invite member</button></div><div id="team-table"></div>`), 1)}
${panel('notifications', card('Notifications', 'Choose which emails you receive', `<ul class="grid gap-3" id="pref-list">${[['sent', 'Campaign sent', 'A summary when a campaign finishes sending'], ['digest', 'Weekly digest', 'Performance highlights every Monday'], ['automation', 'Automation alerts', 'Know when a journey is paused or needs attention'], ['billing', 'Billing updates', 'Invoices and plan changes'], ['product', 'Product news', 'New features and tips from VELORA']].map(([k, t, d]) => `<li class="flex items-center justify-between gap-4 rounded-lg border border-line p-3"><div><p class="font-bold">${t}</p><p class="caption">${d}</p></div><input class="switch" type="checkbox" role="switch" data-pref="${k}" aria-label="${t}"${prefs[k] ? ' checked' : ''}></li>`).join('')}</ul>`), 1)}
${panel('billing', '<div id="billing-body" class="grid gap-4"></div>', 1)}
${panel('api', `${card('API key', 'Use this key to connect VELORA to your own tools', `<div class="flex flex-wrap items-center gap-2"><code class="api-key" id="api-key" aria-live="polite"></code><button class="btn btn-outline btn-sm" type="button" data-reveal aria-pressed="false">Reveal</button><button class="btn btn-outline btn-sm" type="button" data-copy>${icon('copy')}Copy</button><button class="btn btn-ghost btn-sm" type="button" data-regen>${icon('repeat')}Regenerate</button></div>`)}
  ${card('Security', 'Protect your account', `<div class="flex items-center justify-between gap-4 rounded-lg border border-line p-3"><div><p class="font-bold">Two-step verification</p><p class="caption">Ask for a code when signing in on a new device</p></div><input class="switch" type="checkbox" role="switch" data-pref="2fa" aria-label="Two-step verification"></div>`)}
  <section class="panel border-danger"><div class="panel-head"><div><h2 class="h5 text-danger">Danger zone</h2><p class="caption">Deleting a workspace removes its campaigns and contacts from this view.</p></div></div><button class="btn btn-danger" type="button" data-delete-ws>${icon('trash')}Delete workspace</button></section>`, 1)}`;

export const mount = (root, { params }) => {
  // Appearance controls
  const syncPrefs = () => { $$('[data-theme-set]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === getTheme()))); $$('[data-dir-pref]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.dirPref === getDir()))); };
  syncPrefs();
  offPrefs?.();
  document.addEventListener('velora:theme', syncPrefs); document.addEventListener('velora:dir', syncPrefs);
  offPrefs = () => { document.removeEventListener('velora:theme', syncPrefs); document.removeEventListener('velora:dir', syncPrefs); };
  root.addEventListener('click', (e) => { const t = e.target.closest('[data-theme-set]'); const d = e.target.closest('[data-dir-pref]'); if (t) setTheme(t.dataset.themeSet); if (d) setDir(d.dataset.dirPref); });

  // Forms
  [['st-profile', (v) => { user.name = v['pf-name']; user.email = v['pf-email']; team[0].name = user.name; team[0].email = user.email; $('[data-user-name]')?.replaceChildren(user.name); $('[data-user-email]')?.replaceChildren(user.email); return 'Profile updated'; }],
    ['st-workspace', (v) => { session.workspace.name = v['ws-name']; $('[data-ws-name]')?.replaceChildren(v['ws-name']); return 'Workspace settings saved'; }]].forEach(([id, ok]) => {
    const form = $(`#${id}`, root); liveValidate(form);
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(form); if (v) toast(ok(v)); });
  });

  // Sending domain
  const drawDns = () => { $('#dns-body', root).innerHTML = dns.map((r) => `<tr><td><span class="chip">${r.type}</span></td><td><code>${esc(r.host)}</code></td><td class="max-w-[18rem] break-all"><code>${esc(r.value)}</code></td><td>${badge(r.ok ? 'Active' : 'Pending').replace('Active', 'Verified')}</td></tr>`).join(''); };
  drawDns();
  $('[data-verify]', root).addEventListener('click', (e) => { const b = e.currentTarget; b.disabled = true; b.textContent = 'Checking records…'; setTimeout(() => { dns.forEach((r) => { r.ok = true; }); drawDns(); b.disabled = false; b.innerHTML = `${icon('shieldCheck')}Verify records`; hydrateIcons(b); toast('All records verified (simulated check)'); }, 1200); });

  // Team
  const roleSel = (m) => `<label class="sr-only" for="role-${m.id}">Role for ${esc(m.name)}</label><select class="select !w-auto !min-h-9 !py-1" id="role-${m.id}" data-role="${m.id}"${m.role === 'Owner' ? ' disabled' : ''}>${['Owner', 'Admin', 'Editor', 'Viewer'].map((r) => `<option${r === m.role ? ' selected' : ''}>${r}</option>`).join('')}</select>`;
  const teamTable = dataTable($('#team-table', root), {
    label: 'Team members', rows: () => team, pageSize: 8,
    columns: [{ key: 'name', label: 'Member', html: (m) => `<div class="flex items-center gap-3">${avatar(m.name, team.indexOf(m))}<div><p class="font-semibold">${esc(m.name)}</p><p class="caption">${esc(m.email)}</p></div></div>` }, { key: 'role', label: 'Role', html: roleSel }, { key: 'status', label: 'Status', html: (m) => badge(m.status) }],
    actions: (m) => (m.role === 'Owner' ? '' : `<button class="btn-icon-sm" data-act="remove" aria-label="Remove ${esc(m.name)}">${icon('trash')}</button>`),
    onAction: async (act, id) => { const m = team.find((x) => x.id === id); if (await confirmBox({ title: 'Remove member?', message: `${esc(m.name)} will lose access to this workspace.`, confirmLabel: 'Remove', danger: true })) { team.splice(team.indexOf(m), 1); teamTable.draw(); toast('Member removed'); } },
  });
  teamTable.draw();
  root.addEventListener('change', (e) => { const r = e.target.closest('[data-role]'); if (r) { const m = team.find((x) => x.id === r.dataset.role); m.role = r.value; toast(`${m.name} is now ${m.role}`, 'info'); } const p = e.target.closest('[data-pref]'); if (p) { prefs[p.dataset.pref] = p.checked; toast(`${p.getAttribute('aria-label')} ${p.checked ? 'on' : 'off'}`, 'info'); } });
  $('[data-invite]', root).addEventListener('click', () => openModal({ title: 'Invite a team member', size: 'sm', html: `<form novalidate><div class="modal-body grid gap-4">${field({ id: 'iv-email', label: 'Email', type: 'email', required: true })}${field({ id: 'iv-role', label: 'Role', options: ['Admin', 'Editor', 'Viewer'], value: 'Editor' })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Send invite</button></footer></form>`,
    onOpen: (d) => { const f = $('form', d); liveValidate(f); $('#iv-email', d).focus(); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; if (team.some((m) => m.email === v['iv-email'].toLowerCase())) { $('#iv-email-err', d).textContent = 'This person is already on the team.'; $('#iv-email', d).setAttribute('aria-invalid', 'true'); return; } team.push({ id: nextId('u'), name: v['iv-email'].split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), email: v['iv-email'].toLowerCase(), role: v['iv-role'], status: 'Invited' }); d.close(); teamTable.draw(); toast(`Invite recorded for ${v['iv-email']}`); }); } }));

  // Billing
  const drawBilling = () => {
    const used = contacts.length; const lim = parseInt(session.plan.contacts.replace(/,/g, ''), 10);
    $('#billing-body', root).innerHTML = `${card('Current plan', '', `<div class="flex flex-wrap items-center justify-between gap-4"><div><p class="h4">${esc(session.plan.name)}</p><p class="text-muted">${session.plan.monthly != null ? `$${session.plan.monthly} per month` : 'Custom pricing'} · up to ${session.plan.contacts} contacts</p></div><a class="btn btn-outline" href="../pricing.html">Compare plans</a></div><div class="mt-5 grid gap-4 sm:grid-cols-2"><div><div class="mb-1 flex justify-between text-small font-semibold"><span>Contacts</span><span>${num(used)} / ${num(lim)}</span></div><span class="pv-track block"><i class="pv-fill" style="width:${Math.max(2, (used / lim) * 100)}%"></i></span></div><div><div class="mb-1 flex justify-between text-small font-semibold"><span>Emails this month</span><span>3,640 / ${session.plan.emails}</span></div><span class="pv-track block"><i class="pv-fill is-accent" style="width:${session.plan.emails === 'Unlimited' ? 4 : Math.min(100, (3640 / parseInt(session.plan.emails.replace(/,/g, ''), 10)) * 100)}%"></i></span></div></div>`)}
      ${card('Change plan', '', `<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">${plans.map((p) => `<article class="rounded-lg border p-4 ${p.id === session.plan.id ? 'border-primary bg-primary-soft' : 'border-line'}"><h3 class="font-bold">${p.name}</h3><p class="text-small text-muted">${p.monthly != null ? `$${p.monthly}/mo · ${p.contacts} contacts` : 'Custom volume'}</p>${p.id === session.plan.id ? '<span class="badge badge-primary mt-3">Current plan</span>' : p.monthly != null ? `<button class="btn btn-outline btn-sm mt-3" type="button" data-plan="${p.id}">Switch to ${p.name}</button>` : '<a class="btn btn-outline btn-sm mt-3" href="../contact.html?topic=enterprise">Contact sales</a>'}</article>`).join('')}</div>`)}
      ${card('Invoices', '', `<ul class="grid gap-2">${['June', 'May', 'April'].map((m, i) => `<li class="flex items-center justify-between gap-3 rounded-lg border border-line p-3"><span class="font-semibold">${m} 2026 — ${session.plan.monthly != null ? `$${session.plan.monthly}.00` : 'Custom'}</span><span class="badge badge-success badge-dot">Paid</span></li>`).join('')}</ul>`)}`;
    hydrateIcons($('#billing-body', root));
  };
  drawBilling();
  $('#billing-body', root).addEventListener('click', async (e) => { const b = e.target.closest('[data-plan]'); if (!b) return; const p = plans.find((x) => x.id === b.dataset.plan); if (await confirmBox({ title: `Switch to ${p.name}?`, message: `Your plan changes to ${p.name} for this session. No payment is taken in this build.`, confirmLabel: 'Switch plan' })) { session.plan = p; drawBilling(); toast(`Plan changed to ${p.name}`); } });

  // API + security + danger
  const keyEl = $('#api-key', root); const drawKey = () => { keyEl.textContent = api.shown ? api.key : `${api.key.slice(0, 9)}${'•'.repeat(18)}`; };
  drawKey();
  $('[data-reveal]', root).addEventListener('click', (e) => { api.shown = !api.shown; e.currentTarget.textContent = api.shown ? 'Hide' : 'Reveal'; e.currentTarget.setAttribute('aria-pressed', String(api.shown)); drawKey(); });
  $('[data-copy]', root).addEventListener('click', async () => { try { await navigator.clipboard.writeText(api.key); toast('API key copied'); } catch { toast('Copy is unavailable here — reveal and copy manually', 'error'); } });
  $('[data-regen]', root).addEventListener('click', async () => { if (await confirmBox({ title: 'Regenerate API key?', message: 'The current key stops working immediately.', confirmLabel: 'Regenerate', danger: true })) { api.key = `vel_live_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`; drawKey(); toast('New API key created'); } });
  $('[data-delete-ws]', root).addEventListener('click', () => openModal({ title: 'Delete workspace', size: 'sm', html: `<form novalidate><div class="modal-body grid gap-3"><p>Type <strong>${esc(session.workspace.name)}</strong> to confirm.</p>${field({ id: 'dw-name', label: 'Workspace name', required: true })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-danger" type="submit">Delete workspace</button></footer></form>`,
    onOpen: (d) => { const f = $('form', d); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; if (v['dw-name'] !== session.workspace.name) { $('#dw-name-err', d).textContent = 'The name does not match.'; $('#dw-name', d).setAttribute('aria-invalid', 'true'); return; } d.close(); toast('Workspace deletion is simulated in this build — nothing was removed', 'info'); }); } }));

  if (params.tab) { const t = $(`#tab-${params.tab}`, root); if (t) selectTab(t); }
};
