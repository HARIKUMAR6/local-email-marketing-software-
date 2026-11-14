import { reports, campaigns, contacts, lists, metrics, nextId, fmtDate, money, num } from '../store.js';
import { pageHead, esc, badge, icon, field, validate, liveValidate, openModal, confirmBox, toast, dataTable, download, toCsv, $ } from '../ui.js';

export const title = 'Reports';
const TYPES = ['Performance', 'Audience', 'Revenue', 'Deliverability'];
const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

/** Build the tabular data for a report type. */
const dataFor = (r) => {
  if (r.type === 'Audience') return [['List', 'Contacts', 'Subscribed'], ...lists.map((l) => [l.name, contacts.filter((c) => c.list === l.id).length, contacts.filter((c) => c.list === l.id && c.status === 'Subscribed').length])];
  if (r.type === 'Revenue') return [['Campaign', 'Clicks', 'Revenue'], ...campaigns.filter((c) => c.revenue).map((c) => [c.name, c.clicks, c.revenue])];
  if (r.type === 'Deliverability') return [['Metric', 'Value'], ['Delivery rate', '98.6%'], ['Inbox placement', '96.2%'], ['Spam complaints', '0.03%'], ['Hard bounces', '0.4%']];
  const days = r.range.includes('7') ? 7 : r.range.includes('90') ? 90 : 30; const m = metrics(days);
  return [['Date', 'Sent', 'Opens', 'Clicks', 'Revenue'], ...m.labels.map((d, i) => [d, m.sent[i], m.opens[i], m.clicks[i], m.revenue[i]])];
};
const fileOf = (r) => {
  const rows = dataFor(r); const name = `${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (r.format === 'JSON') { const [head, ...body] = rows; return [`${name}.json`, JSON.stringify(body.map((row) => Object.fromEntries(head.map((h, i) => [h, row[i]]))), null, 2), 'application/json']; }
  return [`${name}.csv`, toCsv(rows), 'text/csv'];
};

export const render = () => `
${pageHead('Reports', 'Generate, schedule and download performance reports.', `<button class="btn btn-primary" type="button" data-new>${icon('plus')}Generate report</button>`)}
<section class="panel !p-0"><div class="panel-head !p-4 !pb-0"><h2 class="h5">Your reports</h2></div><div id="rp-table"></div></section>
<section class="panel"><div class="panel-head"><div><h2 class="h5">Report schedule</h2><p class="caption">Choose how often each report is prepared for you.</p></div></div><ul id="rp-sched" class="grid gap-3"></ul></section>`;

export const mount = (root) => {
  const table = dataTable($('#rp-table', root), {
    label: 'Reports', rows: () => reports, pageSize: 6, sort: { key: 'created', dir: 'desc' }, empty: 'No reports yet',
    columns: [
      { key: 'name', label: 'Report', html: (r) => `<span class="font-semibold">${esc(r.name)}</span>` },
      { key: 'type', label: 'Type' }, { key: 'range', label: 'Range' }, { key: 'format', label: 'Format' },
      { key: 'status', label: 'Status', html: (r) => badge(r.status) },
      { key: 'created', label: 'Created', value: (r) => r.created, html: (r) => `<bdi>${fmtDate(r.created)}</bdi>` },
    ],
    actions: (r) => `<button class="btn-icon-sm" data-act="preview" aria-label="Preview ${esc(r.name)}"${r.status !== 'Ready' ? ' disabled' : ''}>${icon('eye')}</button><button class="btn-icon-sm" data-act="download" aria-label="Download ${esc(r.name)}"${r.status !== 'Ready' ? ' disabled' : ''}>${icon('download')}</button><button class="btn-icon-sm" data-act="delete" aria-label="Delete ${esc(r.name)}">${icon('trash')}</button>`,
    onAction: async (act, id) => {
      const r = reports.find((x) => x.id === id);
      if (act === 'download') { const [n, text, mime] = fileOf(r); download(n, text, mime); toast(`Downloaded ${n}`); }
      if (act === 'preview') { const rows = dataFor(r); openModal({ title: r.name, size: 'lg', html: `<div class="modal-body"><p class="mb-3 text-small text-muted">${esc(r.type)} · ${esc(r.range)} · first ${Math.min(8, rows.length - 1)} of ${rows.length - 1} rows</p><div class="tbl-wrap" tabindex="0" role="region" aria-label="Report preview"><table class="tbl"><thead><tr>${rows[0].map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1, 9).map((row) => `<tr>${row.map((c) => `<td>${esc(typeof c === 'number' && /revenue/i.test(rows[0][row.indexOf(c)] || '') ? money(c) : c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Close</button></footer>` }); }
      if (act === 'delete' && await confirmBox({ title: 'Delete report?', message: `“${esc(r.name)}” will be removed.`, confirmLabel: 'Delete', danger: true })) { reports.splice(reports.indexOf(r), 1); table.draw(); drawSched(); toast('Report deleted'); }
    },
  });
  const drawSched = () => {
    $('#rp-sched', root).innerHTML = reports.map((r) => `<li class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-3"><div><p class="font-bold">${esc(r.name)}</p><p class="caption">${esc(r.type)} · ${esc(r.range)}</p></div><label class="sr-only" for="sc-${r.id}">Schedule for ${esc(r.name)}</label><select class="select !w-auto" id="sc-${r.id}" data-sched="${r.id}">${['Off', 'Weekly', 'Monthly'].map((o) => `<option${o === r.schedule ? ' selected' : ''}>${o}</option>`).join('')}</select></li>`).join('') || '<li class="text-small text-muted">Generate a report to schedule it.</li>';
  };
  drawSched(); table.draw();
  root.addEventListener('change', (e) => { const s = e.target.closest('[data-sched]'); if (s) { const r = reports.find((x) => x.id === s.dataset.sched); r.schedule = s.value; toast(`${r.name}: ${s.value === 'Off' ? 'schedule turned off' : `prepared ${s.value.toLowerCase()}`}`, 'info'); } });
  $('[data-new]', root).addEventListener('click', () => openModal({ title: 'Generate report', size: 'sm',
    html: `<form novalidate><div class="modal-body grid gap-4">${field({ id: 'gr-name', label: 'Report name', required: true, minlength: 3, placeholder: 'Quarterly review' })}${field({ id: 'gr-type', label: 'Report type', options: TYPES })}${field({ id: 'gr-range', label: 'Date range', options: RANGES, value: 'Last 30 days' })}${field({ id: 'gr-format', label: 'Format', options: ['CSV', 'JSON'] })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Generate</button></footer></form>`,
    onOpen: (d) => { const f = $('form', d); liveValidate(f); $('#gr-name', d).focus(); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; const r = { id: nextId('r'), name: v['gr-name'], type: v['gr-type'], range: v['gr-range'], format: v['gr-format'], status: 'Generating', created: new Date(), schedule: 'Off' }; reports.unshift(r); d.close(); table.reset(); drawSched(); toast('Preparing your report…', 'info'); setTimeout(() => { r.status = 'Ready'; table.draw(); toast(`“${r.name}” is ready to download`); }, 1400); }); } }));
};
