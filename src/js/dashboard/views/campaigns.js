import { campaigns, contacts, lists, nextId, fmtDate, num, money, pct } from '../store.js';
import { pageHead, esc, badge, icon, field, validate, liveValidate, openModal, confirmBox, toast, dataTable, download, toCsv, $ } from '../ui.js';
import { hbars } from '../charts.js';

export const title = 'Campaigns';
const STATUSES = ['All', 'Sent', 'Sending', 'Scheduled', 'Draft'];
const listName = (id) => lists.find((l) => l.id === id)?.name || '—';
const rate = (a, b) => (b ? (a / b) * 100 : 0);

export const render = () => `
${pageHead('Campaigns', 'Create, schedule and review every email you send.', `<button class="btn btn-outline" type="button" data-export>${icon('download')}Export CSV</button><button class="btn btn-primary" type="button" data-new>${icon('plus')}New campaign</button>`)}
<section class="panel !p-0">
  <div class="toolbar">
    <div class="search-box"><span class="search-ico">${icon('search')}</span><label class="sr-only" for="cp-q">Search campaigns</label><input class="input" id="cp-q" type="search" placeholder="Search campaigns…" autocomplete="off"></div>
    <div class="chips" role="group" aria-label="Filter by status">${STATUSES.map((s, i) => `<button type="button" class="chip-btn" data-status="${s}" aria-pressed="${i === 0}">${s}<span class="count" data-count="${s}"></span></button>`).join('')}</div>
    <div class="bulk" data-bulk hidden><span class="text-small font-semibold" data-bulk-count></span><button class="btn btn-sm btn-outline" type="button" data-bulk-delete>${icon('trash')}Delete</button></div>
  </div>
  <div id="cp-table"></div>
</section>`;

export const mount = (root, { params, go }) => {
  const st = { status: 'All', q: params.q || '' };
  const q = $('#cp-q', root); q.value = st.q;
  const rows = () => campaigns.filter((c) => (st.status === 'All' || c.status === st.status) && (!st.q || `${c.name} ${c.subject}`.toLowerCase().includes(st.q.toLowerCase())));
  const counts = () => STATUSES.forEach((s) => { $(`[data-count="${s}"]`, root).textContent = s === 'All' ? campaigns.length : campaigns.filter((c) => c.status === s).length; });

  const table = dataTable($('#cp-table', root), {
    label: 'Campaigns', rows, pageSize: 8, selectable: true, sort: { key: 'date', dir: 'desc' }, empty: 'No campaigns found',
    columns: [
      { key: 'name', label: 'Campaign', html: (c) => `<div class="font-semibold">${esc(c.name)}</div><div class="caption">${esc(c.subject)}</div>` },
      { key: 'status', label: 'Status', html: (c) => badge(c.status) },
      { key: 'list', label: 'Audience', value: (c) => listName(c.list), html: (c) => `${esc(listName(c.list))}<div class="caption">${num(c.audience)} contacts</div>` },
      { key: 'sent', label: 'Sent', cls: 'text-end', html: (c) => (c.sent ? num(c.sent) : '—') },
      { key: 'open', label: 'Opens', cls: 'text-end', value: (c) => rate(c.opens, c.sent), html: (c) => (c.sent ? pct(rate(c.opens, c.sent)) : '—') },
      { key: 'click', label: 'Clicks', cls: 'text-end', value: (c) => rate(c.clicks, c.sent), html: (c) => (c.sent ? pct(rate(c.clicks, c.sent)) : '—') },
      { key: 'revenue', label: 'Revenue', cls: 'text-end', html: (c) => (c.revenue ? money(c.revenue) : '—') },
      { key: 'date', label: 'Date', value: (c) => c.date, html: (c) => `<bdi>${fmtDate(c.date)}</bdi><div class="caption">${c.status === 'Scheduled' ? 'Scheduled' : c.status === 'Draft' ? 'Last edited' : 'Sent'}</div>` },
    ],
    actions: (c) => `<button class="btn-icon-sm" data-act="view" aria-label="View ${esc(c.name)}">${icon('eye')}</button><button class="btn-icon-sm" data-act="edit" aria-label="Edit ${esc(c.name)} in the builder">${icon('edit')}</button><button class="btn-icon-sm" data-act="copy" aria-label="Duplicate ${esc(c.name)}">${icon('copy')}</button><button class="btn-icon-sm" data-act="delete" aria-label="Delete ${esc(c.name)}">${icon('trash')}</button>`,
    onSelect: (ids) => { $('[data-bulk]', root).hidden = !ids.length; $('[data-bulk-count]', root).textContent = `${ids.length} selected`; },
    onAction: async (act, id) => {
      const c = campaigns.find((x) => x.id === id);
      if (act === 'view') details(c);
      if (act === 'edit') go('builder', { campaign: id });
      if (act === 'copy') { campaigns.unshift({ ...c, id: nextId('m'), name: `${c.name} (copy)`, status: 'Draft', sent: 0, opens: 0, clicks: 0, revenue: 0, date: new Date() }); counts(); table.reset(); toast('Campaign duplicated as a draft'); }
      if (act === 'delete' && await confirmBox({ title: 'Delete campaign?', message: `“${esc(c.name)}” will be removed from this workspace view.`, confirmLabel: 'Delete', danger: true })) { campaigns.splice(campaigns.indexOf(c), 1); counts(); table.clear(); toast('Campaign deleted'); }
    },
  });

  const details = (c) => openModal({
    title: c.name, sheet: true, size: 'md',
    html: `<div class="modal-body grid gap-5"><div class="flex flex-wrap items-center gap-2">${badge(c.status)}<span class="chip">${esc(c.type)}</span><span class="chip">${esc(listName(c.list))}</span></div>
      <p class="text-muted">Subject: <strong class="text-fg">${esc(c.subject)}</strong></p>
      ${c.sent ? `<div class="grid grid-cols-2 gap-3"><div class="pv-tile"><p class="pv-label">Delivered</p><p class="pv-num">${num(c.sent)}</p></div><div class="pv-tile"><p class="pv-label">Revenue</p><p class="pv-num">${money(c.revenue)}</p></div></div>
      ${hbars([{ label: 'Opened', value: c.opens, display: `${num(c.opens)} · ${pct(rate(c.opens, c.sent))}` }, { label: 'Clicked', value: c.clicks, display: `${num(c.clicks)} · ${pct(rate(c.clicks, c.sent))}` }, { label: 'Unsubscribed', value: Math.max(1, Math.round(c.sent * 0.004)), display: `${Math.max(1, Math.round(c.sent * 0.004))}` }])}`
      : `<p class="rounded-lg bg-surface-2 p-3 text-small">This campaign has not been sent yet. ${c.status === 'Scheduled' ? `It is scheduled for ${fmtDate(c.date)}.` : 'Open it in the builder to finish and schedule it.'}</p>`}</div>
      <footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Close</button><button class="btn btn-primary" type="button" data-edit>${icon('edit')}Open in builder</button></footer>`,
    onOpen: (d) => $('[data-edit]', d).addEventListener('click', () => { d.close(); go('builder', { campaign: c.id }); }),
  });

  const create = () => openModal({
    title: 'New campaign', size: 'md',
    html: `<form novalidate><div class="modal-body grid gap-4">
      ${field({ id: 'nc-name', label: 'Campaign name', required: true, minlength: 3, placeholder: 'Summer collection launch' })}
      ${field({ id: 'nc-subject', label: 'Subject line', required: true, minlength: 5, placeholder: 'Fresh arrivals you will love', help: 'Keep it under 60 characters for the best open rates.' })}
      ${field({ id: 'nc-list', label: 'Send to', options: lists.map((l) => [l.id, l.name]) })}
      ${field({ id: 'nc-type', label: 'Campaign type', options: ['Regular', 'A/B test', 'Automated'] })}
      </div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-outline" type="submit" data-mode="draft">Save draft</button><button class="btn btn-primary" type="submit" data-mode="builder">Create &amp; open builder</button></footer></form>`,
    onOpen: (d) => {
      const form = $('form', d); liveValidate(form); let mode = 'draft';
      form.addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) mode = b.dataset.mode; });
      $('#nc-name', d).focus();
      form.addEventListener('submit', (e) => {
        e.preventDefault(); const v = validate(form); if (!v) return;
        const audience = contacts.filter((x) => x.list === v['nc-list'] && x.status === 'Subscribed').length;
        const c = { id: nextId('m'), name: v['nc-name'], subject: v['nc-subject'], status: 'Draft', list: v['nc-list'], audience, sent: 0, opens: 0, clicks: 0, revenue: 0, type: v['nc-type'], date: new Date() };
        campaigns.unshift(c); counts(); table.reset(); d.close(); toast(`“${c.name}” saved as a draft`);
        if (mode === 'builder') go('builder', { campaign: c.id });
      });
    },
  });

  $('[data-new]', root).addEventListener('click', create);
  $('[data-export]', root).addEventListener('click', () => { download('campaigns.csv', toCsv([['Name', 'Status', 'Audience', 'Sent', 'Opens', 'Clicks', 'Revenue', 'Date'], ...rows().map((c) => [c.name, c.status, listName(c.list), c.sent, c.opens, c.clicks, c.revenue, fmtDate(c.date)])])); toast('Exported campaigns.csv'); });
  q.addEventListener('input', () => { st.q = q.value; table.reset(); });
  $('.chips', root).addEventListener('click', (e) => { const b = e.target.closest('[data-status]'); if (!b) return; st.status = b.dataset.status; $$chips(root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); table.reset(); });
  $('[data-bulk-delete]', root).addEventListener('click', async () => {
    const ids = table.selected();
    if (await confirmBox({ title: `Delete ${ids.length} campaign${ids.length > 1 ? 's' : ''}?`, message: 'The selected campaigns will be removed from this workspace view.', confirmLabel: 'Delete', danger: true })) {
      ids.forEach((id) => { const i = campaigns.findIndex((c) => c.id === id); if (i >= 0) campaigns.splice(i, 1); }); counts(); table.clear(); toast(`${ids.length} campaign${ids.length > 1 ? 's' : ''} deleted`);
    }
  });
  counts(); table.draw();
  if (params.new) create();
};
const $$chips = (root) => [...root.querySelectorAll('[data-status]')];
