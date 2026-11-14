// Shared dashboard UI toolkit: toasts, modals, form fields + validation, data tables, tabs, downloads.
import { $, $$, lockScroll } from '../core/dom.js';
import { icon, hydrateIcons } from '../components/icons.js';

export { $, $$, icon, hydrateIcons };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- toast ---------- */
export const toast = (message, type = 'success') => {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.append(box); }
  const el = document.createElement('div');
  el.className = `toast is-${type}`;
  el.innerHTML = `${icon(type === 'error' ? 'info' : type === 'info' ? 'info' : 'check')}<span>${esc(message)}</span><button type="button" class="toast-x" aria-label="Dismiss">${icon('close')}</button>`;
  box.append(el);
  const close = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 200); };
  $('.toast-x', el).addEventListener('click', close);
  setTimeout(close, 4200);
};

/* ---------- modal / side sheet (native <dialog>) ---------- */
export const openModal = ({ title, html, size = 'md', sheet = false, onOpen }) => {
  const dlg = document.createElement('dialog');
  dlg.className = `modal modal-${size}${sheet ? ' is-sheet' : ''}`;
  dlg.setAttribute('aria-labelledby', 'modal-title');
  dlg.innerHTML = `<div class="modal-card"><header class="modal-head"><h2 id="modal-title" class="h4">${esc(title)}</h2><button type="button" class="btn-icon" data-close aria-label="Close dialog">${icon('close')}</button></header>${html}</div>`;
  document.body.append(dlg);
  hydrateIcons(dlg);
  lockScroll(true);
  dlg.showModal();
  dlg.addEventListener('close', () => { lockScroll(false); dlg.remove(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  onOpen?.(dlg);
  return dlg;
};

export const confirmBox = ({ title, message, confirmLabel = 'Confirm', danger = false }) => new Promise((resolve) => {
  let answer = false;
  const dlg = openModal({
    title, size: 'sm',
    html: `<div class="modal-body"><p>${message}</p></div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-ok>${esc(confirmLabel)}</button></footer>`,
    onOpen: (d) => $('[data-ok]', d).addEventListener('click', () => { answer = true; d.close(); }),
  });
  dlg.addEventListener('close', () => resolve(answer));
});

/* ---------- form fields + validation ---------- */
export const field = ({ id, label, type = 'text', value = '', placeholder = '', options, required = false, help = '', rows = 4, min, max, minlength, cls = '' }) => {
  const common = `id="${id}" name="${id}" data-v data-label="${esc(label)}" aria-describedby="${id}-err" aria-invalid="false"${required ? ' required' : ''}`;
  let control;
  if (options) control = `<select class="select" ${common}>${options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
  else if (type === 'textarea') control = `<textarea class="textarea" ${common} rows="${rows}" placeholder="${esc(placeholder)}"${minlength ? ` minlength="${minlength}"` : ''}>${esc(value)}</textarea>`;
  else control = `<input class="input" ${common} type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}"${min != null ? ` min="${min}"` : ''}${max != null ? ` max="${max}"` : ''}${minlength ? ` minlength="${minlength}"` : ''}>`;
  return `<div class="field ${cls}"><label class="label" for="${id}">${esc(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>${control}${help ? `<p class="help">${help}</p>` : ''}<p class="error-text" id="${id}-err"></p></div>`;
};

const checkField = (el) => {
  const v = el.value.trim(); const label = el.dataset.label || 'This field';
  let msg = '';
  if (el.required && !v) msg = `${label} is required.`;
  else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Enter a valid email address.';
  else if (v && el.minLength > 0 && v.length < el.minLength) msg = `${label} needs at least ${el.minLength} characters.`;
  else if (v && el.type === 'number' && ((el.min !== '' && +v < +el.min) || (el.max !== '' && +v > +el.max))) msg = `${label} must be between ${el.min} and ${el.max}.`;
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  const err = $(`#${el.id}-err`, el.closest('form') || document);
  if (err) err.textContent = msg;
  return msg;
};
/** Validate every [data-v] control in a form. Returns the values object, or null (focusing the first error). */
export const validate = (form) => {
  const els = $$('[data-v]', form);
  const bad = els.filter((el) => checkField(el));
  if (bad.length) { bad[0].focus(); return null; }
  return Object.fromEntries(els.map((el) => [el.name, el.type === 'checkbox' ? el.checked : el.value.trim()]));
};
export const liveValidate = (form) => {
  form.addEventListener('focusout', (e) => { if (e.target.matches('[data-v]')) checkField(e.target); });
  form.addEventListener('input', (e) => { if (e.target.matches('[data-v][aria-invalid="true"]')) checkField(e.target); });
};

/* ---------- badges, avatars ---------- */
const BADGES = { Sent: 'success', Active: 'success', Subscribed: 'success', Ready: 'success', Scheduled: 'info', Invited: 'info', Draft: 'neutral', Sending: 'warning', Paused: 'warning', Pending: 'warning', Generating: 'warning', Unsubscribed: 'neutral', Cleaned: 'danger', Owner: 'primary', Admin: 'primary', Editor: 'accent', Viewer: 'neutral' };
export const badge = (s) => `<span class="badge badge-${BADGES[s] || 'neutral'} badge-dot">${esc(s)}</span>`;
const AV = ['bg-indigo-600', 'bg-aqua-700', 'bg-navy-700', 'bg-indigo-800', 'bg-navy-500'];
export const initials = (n) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const avatar = (name, i = 0, size = '') => `<span class="pv-avatar ${AV[(i + name.length) % AV.length]} ${size}" aria-hidden="true">${esc(initials(name))}</span>`;

/* ---------- downloads ---------- */
export const download = (filename, text, mime = 'text/csv') => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
export const toCsv = (rows) => rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

/* ---------- data table: sort, paginate, select ---------- */
export const dataTable = (el, o) => {
  const st = { key: o.sort?.key || null, dir: o.sort?.dir || 'asc', page: 1, sel: new Set() };
  const size = o.pageSize || 8;
  const val = (r, c) => (c.value ? c.value(r) : r[c.key]);
  const rowsNow = () => {
    let rows = o.rows();
    const col = o.columns.find((c) => c.key === st.key);
    if (col) rows = [...rows].sort((a, b) => { const x = val(a, col); const y = val(b, col); const r = typeof x === 'number' || x instanceof Date ? (x > y ? 1 : x < y ? -1 : 0) : String(x).localeCompare(String(y)); return st.dir === 'asc' ? r : -r; });
    return rows;
  };
  const draw = () => {
    const rows = rowsNow(); const total = rows.length; const pages = Math.max(1, Math.ceil(total / size));
    st.page = Math.min(st.page, pages);
    const slice = rows.slice((st.page - 1) * size, st.page * size);
    const allOn = slice.length && slice.every((r) => st.sel.has(r.id));
    const th = o.columns.map((c) => c.sort === false ? `<th scope="col" class="${c.cls || ''}">${esc(c.label)}</th>`
      : `<th scope="col" class="${c.cls || ''}" aria-sort="${st.key === c.key ? (st.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" class="th-btn" data-sort="${c.key}">${esc(c.label)}<span class="th-arrow" aria-hidden="true">${st.key === c.key ? (st.dir === 'asc' ? '↑' : '↓') : '↕'}</span></button></th>`).join('');
    const body = slice.length ? slice.map((r) => `<tr data-id="${r.id}"${st.sel.has(r.id) ? ' class="is-selected"' : ''}>
        ${o.selectable ? `<td class="w-10"><input class="checkbox" type="checkbox" data-sel="${r.id}" aria-label="Select ${esc(r.name || r.id)}"${st.sel.has(r.id) ? ' checked' : ''}></td>` : ''}
        ${o.columns.map((c, ci) => `<td class="${c.cls || ''}${ci === 0 ? ' cell-main' : ''}" data-label="${esc(c.label)}">${c.html ? c.html(r) : esc(r[c.key])}</td>`).join('')}
        ${o.actions ? `<td class="tbl-actions">${o.actions(r)}</td>` : ''}</tr>`).join('')
      : `<tr><td colspan="${o.columns.length + (o.selectable ? 1 : 0) + (o.actions ? 1 : 0)}"><div class="empty">${icon('search')}<p class="font-bold">${esc(o.empty || 'Nothing to show')}</p><p class="text-small">Try changing your search or filters.</p></div></td></tr>`;
    const from = total ? (st.page - 1) * size + 1 : 0; const to = Math.min(total, st.page * size);
    const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - st.page) <= 1);
    let last = 0;
    const pager = nums.map((p) => { const gap = p - last > 1 ? '<span class="pg-gap" aria-hidden="true">…</span>' : ''; last = p; return `${gap}<button type="button" class="pg${p === st.page ? ' is-on' : ''}" data-page="${p}" aria-label="Page ${p}"${p === st.page ? ' aria-current="page"' : ''}>${p}</button>`; }).join('');
    el.innerHTML = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(o.label || 'Data table')}"><table class="tbl tbl-stack"><thead><tr>${o.selectable ? `<th class="w-10"><input class="checkbox" type="checkbox" data-sel-all aria-label="Select all rows on this page"${allOn ? ' checked' : ''}></th>` : ''}${th}${o.actions ? '<th scope="col"><span class="sr-only">Actions</span></th>' : ''}</tr></thead><tbody>${body}</tbody></table></div>
      <div class="pager"><p class="text-small text-muted" aria-live="polite">Showing ${from}–${to} of ${total}</p><nav class="flex items-center gap-1" aria-label="Pagination"><button type="button" class="pg" data-page="${st.page - 1}" aria-label="Previous page"${st.page === 1 ? ' disabled' : ''}>${icon('chevronLeft')}</button>${pager}<button type="button" class="pg" data-page="${st.page + 1}" aria-label="Next page"${st.page === pages ? ' disabled' : ''}>${icon('chevronRight')}</button></nav></div>`;
    hydrateIcons(el);
    o.onSelect?.([...st.sel]);
  };
  el.addEventListener('click', (e) => {
    const s = e.target.closest('[data-sort]'); const p = e.target.closest('[data-page]'); const a = e.target.closest('[data-act]');
    if (s) { st.dir = st.key === s.dataset.sort && st.dir === 'asc' ? 'desc' : 'asc'; st.key = s.dataset.sort; draw(); $(`[data-sort="${st.key}"]`, el)?.focus(); }
    else if (p && !p.disabled) { st.page = +p.dataset.page; draw(); $('[data-page].is-on', el)?.focus(); }
    else if (a) { const id = a.closest('tr').dataset.id; o.onAction?.(a.dataset.act, id); }
    else if (o.onRow && e.target.closest('[data-row-open]')) { o.onRow(e.target.closest('tr').dataset.id); }
  });
  el.addEventListener('change', (e) => {
    if (e.target.matches('[data-sel-all]')) { const ids = $$('tbody tr[data-id]', el).map((t) => t.dataset.id); ids.forEach((id) => (e.target.checked ? st.sel.add(id) : st.sel.delete(id))); draw(); }
    else if (e.target.matches('[data-sel]')) { e.target.checked ? st.sel.add(e.target.dataset.sel) : st.sel.delete(e.target.dataset.sel); draw(); $(`[data-sel="${e.target.dataset.sel}"]`, el)?.focus(); }
  });
  return { draw, reset() { st.page = 1; draw(); }, selected: () => [...st.sel], clear() { st.sel.clear(); draw(); }, rows: rowsNow };
};

/* ---------- tabs (event delegation; panels are siblings with role=tabpanel) ---------- */
export const initTabs = (root) => {
  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-dtabs] [role="tab"]');
    if (tab) selectTab(tab);
  });
  root.addEventListener('keydown', (e) => {
    const tab = e.target.closest('[data-dtabs] [role="tab"]');
    if (!tab || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    const tabs = $$('[role="tab"]', tab.closest('[role="tablist"]')); const i = tabs.indexOf(tab);
    const rtl = document.documentElement.dir === 'rtl' ? -1 : 1;
    const next = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs.at(-1) : tabs[(i + (e.key === 'ArrowRight' ? rtl : -rtl) + tabs.length) % tabs.length];
    e.preventDefault(); selectTab(next); next.focus();
  });
};
export const selectTab = (tab) => {
  const group = tab.closest('[data-dtabs]');
  $$('[role="tab"]', group).forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; const p = $(`#${t.getAttribute('aria-controls')}`); if (p) p.hidden = !on; });
  group.dispatchEvent(new CustomEvent('tabchange', { detail: { id: tab.getAttribute('aria-controls'), tab } }));
};

/* ---------- page header ---------- */
export const pageHead = (title, sub = '', actions = '') => `<header class="page-head"><div class="min-w-0"><h1 class="h3" tabindex="-1">${esc(title)}</h1>${sub ? `<p class="mt-1 text-muted">${sub}</p>` : ''}</div>${actions ? `<div class="page-actions flex flex-wrap items-center gap-2">${actions}</div>` : ''}</header>`;
export const tabsBar = (id, tabs, active = 0) => `<div class="tablist" role="tablist" aria-label="${esc(id)}" data-dtabs>${tabs.map(([key, label], i) => `<button class="tab" type="button" role="tab" id="tab-${key}" aria-controls="panel-${key}" aria-selected="${i === active}" tabindex="${i === active ? 0 : -1}">${esc(label)}</button>`).join('')}</div>`;
