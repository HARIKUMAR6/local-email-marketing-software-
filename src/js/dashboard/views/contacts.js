import { contacts, lists, FIELDS, nextId, fmtDate, num } from '../store.js';
import { pageHead, esc, badge, avatar, icon, field, validate, liveValidate, openModal, confirmBox, toast, dataTable, download, toCsv, $ } from '../ui.js';

export const title = 'Contacts';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const listName = (id) => lists.find((l) => l.id === id)?.name || '—';

export const render = () => `
${pageHead('Contacts', 'Everyone you email, with their tags, lists and engagement.', `<button class="btn btn-outline" type="button" data-import>${icon('upload')}Import</button><button class="btn btn-outline" type="button" data-export>${icon('download')}Export</button><button class="btn btn-primary" type="button" data-add>${icon('userPlus')}Add contact</button>`)}
<section class="panel !p-0">
  <div class="toolbar">
    <div class="search-box"><span class="search-ico">${icon('search')}</span><label class="sr-only" for="ct-q">Search contacts</label><input class="input" id="ct-q" type="search" placeholder="Search name or email…" autocomplete="off"></div>
    <label class="sr-only" for="ct-list">List</label><select class="select !w-auto" id="ct-list"><option value="">All lists</option>${lists.map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select>
    <label class="sr-only" for="ct-status">Status</label><select class="select !w-auto" id="ct-status"><option value="">Any status</option>${FIELDS.status.values.map((s) => `<option>${s}</option>`).join('')}</select>
    <label class="sr-only" for="ct-tag">Tag</label><select class="select !w-auto" id="ct-tag"><option value="">Any tag</option>${FIELDS.tag.values.map((s) => `<option>${s}</option>`).join('')}</select>
    <div class="bulk" data-bulk hidden><span class="text-small font-semibold" data-bulk-count></span><button class="btn btn-sm btn-outline" type="button" data-bulk-tag>${icon('tag')}Add tag</button><button class="btn btn-sm btn-outline" type="button" data-bulk-delete>${icon('trash')}Delete</button></div>
  </div>
  <div id="ct-table"></div>
</section>`;

export const mount = (root, { params }) => {
  const f = { q: params.q || '', list: params.list || '', status: '', tag: '' };
  $('#ct-q', root).value = f.q; $('#ct-list', root).value = f.list;
  const rows = () => contacts.filter((c) => (!f.q || `${c.name} ${c.email}`.toLowerCase().includes(f.q.toLowerCase())) && (!f.list || c.list === f.list) && (!f.status || c.status === f.status) && (!f.tag || c.tags.includes(f.tag)));

  const table = dataTable($('#ct-table', root), {
    label: 'Contacts', rows, pageSize: 10, selectable: true, sort: { key: 'added', dir: 'desc' }, empty: 'No contacts match',
    columns: [
      { key: 'name', label: 'Contact', html: (c) => `<div class="flex items-center gap-3">${avatar(c.name, contacts.indexOf(c))}<div class="min-w-0"><button type="button" class="font-semibold link-plain" data-row-open>${esc(c.name)}</button><div class="caption truncate">${esc(c.email)}</div></div></div>` },
      { key: 'status', label: 'Status', html: (c) => badge(c.status) },
      { key: 'list', label: 'List', value: (c) => listName(c.list), html: (c) => esc(listName(c.list)) },
      { key: 'tags', label: 'Tags', sort: false, html: (c) => `<div class="flex flex-wrap gap-1">${c.tags.map((t) => `<span class="chip !py-0.5 !text-xs">${esc(t)}</span>`).join('')}</div>` },
      { key: 'location', label: 'Location' },
      { key: 'score', label: 'Score', cls: 'text-end', html: (c) => `<span class="inline-flex items-center gap-2"><span class="pv-track hidden w-14 sm:block"><i class="pv-fill${c.score < 50 ? ' is-accent' : ''}" style="width:${c.score}%"></i></span><b>${c.score}</b></span>` },
      { key: 'added', label: 'Added', value: (c) => c.added, html: (c) => `<bdi>${fmtDate(c.added)}</bdi>` },
    ],
    onRow: (id) => profile(contacts.find((c) => c.id === id)),
    onSelect: (ids) => { $('[data-bulk]', root).hidden = !ids.length; $('[data-bulk-count]', root).textContent = `${ids.length} selected`; },
  });

  const profile = (c) => openModal({
    title: c.name, sheet: true,
    html: `<div class="modal-body grid gap-5"><div class="flex items-center gap-3">${avatar(c.name, contacts.indexOf(c), 'is-lg')}<div><p class="font-bold">${esc(c.email)}</p><p class="caption">${esc(c.location)} · added ${fmtDate(c.added)}</p></div></div>
      <div class="flex flex-wrap gap-2">${badge(c.status)}<span class="chip">${esc(listName(c.list))}</span>${c.tags.map((t) => `<span class="chip is-primary">${esc(t)}</span>`).join('')}</div>
      <div class="grid grid-cols-2 gap-3"><div class="pv-tile"><p class="pv-label">Engagement score</p><p class="pv-num">${c.score}</p></div><div class="pv-tile"><p class="pv-label">Emails opened</p><p class="pv-num">${c.opens}</p></div></div>
      <div><h3 class="h6 mb-3">Recent activity</h3><ol class="vflow"><li class="vflow-item"><span class="vflow-dot">${icon('mail')}</span><div><h4>Opened “Spring collection launch”</h4><p>2 days ago</p></div></li><li class="vflow-item"><span class="vflow-dot is-accent">${icon('cursor')}</span><div><h4>Clicked a product link</h4><p>2 days ago</p></div></li><li class="vflow-item"><span class="vflow-dot">${icon('userPlus')}</span><div><h4>Joined ${esc(listName(c.list))}</h4><p>${fmtDate(c.added)}</p></div></li></ol></div></div>
      <footer class="modal-foot"><button class="btn btn-outline" type="button" data-toggle>${c.status === 'Unsubscribed' ? 'Resubscribe' : 'Unsubscribe'}</button><button class="btn btn-danger" type="button" data-del>${icon('trash')}Delete</button></footer>`,
    onOpen: (d) => {
      $('[data-toggle]', d).addEventListener('click', () => { c.status = c.status === 'Unsubscribed' ? 'Subscribed' : 'Unsubscribed'; d.close(); table.draw(); toast(`${c.name} is now ${c.status.toLowerCase()}`); });
      $('[data-del]', d).addEventListener('click', async () => { d.close(); if (await confirmBox({ title: 'Delete contact?', message: `${esc(c.name)} will be removed from your audience.`, confirmLabel: 'Delete', danger: true })) { contacts.splice(contacts.indexOf(c), 1); table.clear(); toast('Contact deleted'); } });
    },
  });

  const add = () => openModal({
    title: 'Add contact',
    html: `<form novalidate><div class="modal-body grid gap-4 sm:grid-cols-2">${field({ id: 'ac-name', label: 'Full name', required: true, minlength: 2, cls: 'sm:col-span-2' })}${field({ id: 'ac-email', label: 'Email', type: 'email', required: true, cls: 'sm:col-span-2' })}${field({ id: 'ac-list', label: 'List', options: lists.map((l) => [l.id, l.name]) })}${field({ id: 'ac-status', label: 'Status', options: ['Subscribed', 'Pending'] })}${field({ id: 'ac-tags', label: 'Tags', placeholder: 'VIP, Customer', help: 'Separate tags with commas.', cls: 'sm:col-span-2' })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Add contact</button></footer></form>`,
    onOpen: (d) => {
      const form = $('form', d); liveValidate(form); $('#ac-name', d).focus();
      form.addEventListener('submit', (e) => {
        e.preventDefault(); const v = validate(form); if (!v) return;
        if (contacts.some((c) => c.email === v['ac-email'].toLowerCase())) { $('#ac-email-err', d).textContent = 'A contact with this email already exists.'; $('#ac-email', d).setAttribute('aria-invalid', 'true'); $('#ac-email', d).focus(); return; }
        const tags = v['ac-tags'].split(',').map((t) => t.trim()).filter(Boolean);
        contacts.unshift({ id: nextId('c'), name: v['ac-name'], email: v['ac-email'].toLowerCase(), status: v['ac-status'], tags: tags.length ? tags : ['Lead'], list: v['ac-list'], location: 'Chennai, IN', score: 50, opens: 0, added: new Date() });
        d.close(); table.reset(); toast(`${v['ac-name']} added`);
      });
    },
  });

  const importer = () => openModal({
    title: 'Import contacts',
    html: `<form novalidate><div class="modal-body grid gap-4"><p class="text-small text-muted">Paste rows as <code>name,email</code> or choose a CSV file. Invalid and duplicate rows are skipped.</p>
      <div class="field"><label class="label" for="im-file">CSV file</label><input class="input" id="im-file" type="file" accept=".csv,text/csv"></div>
      ${field({ id: 'im-text', label: 'Or paste rows', type: 'textarea', rows: 5, placeholder: 'Ava Brooks,ava@company.com\nLeo Park,leo@company.com' })}
      ${field({ id: 'im-list', label: 'Add to list', options: lists.map((l) => [l.id, l.name]) })}<p class="text-small" id="im-result" aria-live="polite"></p></div>
      <footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Import</button></footer></form>`,
    onOpen: (d) => {
      const form = $('form', d); const text = $('#im-text', d);
      $('#im-file', d).addEventListener('change', async (e) => { const file = e.target.files[0]; if (file) text.value = await file.text(); });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const lines = text.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !/^name\s*,\s*email/i.test(l));
        if (!lines.length) { $('#im-result', d).textContent = 'Add at least one row to import.'; text.focus(); return; }
        let ok = 0; let skip = 0;
        lines.forEach((l) => { const [name, email] = l.split(',').map((s) => s.replace(/^"|"$/g, '').trim()); if (!name || !EMAIL.test(email || '') || contacts.some((c) => c.email === email.toLowerCase())) { skip++; return; } contacts.unshift({ id: nextId('c'), name, email: email.toLowerCase(), status: 'Subscribed', tags: ['Lead'], list: $('#im-list', d).value, location: 'Chennai, IN', score: 40, opens: 0, added: new Date() }); ok++; });
        d.close(); table.reset(); toast(`Imported ${ok} contact${ok === 1 ? '' : 's'}${skip ? ` · ${skip} skipped` : ''}`, ok ? 'success' : 'error');
      });
    },
  });

  $('[data-add]', root).addEventListener('click', add);
  $('[data-import]', root).addEventListener('click', importer);
  $('[data-export]', root).addEventListener('click', () => { const sel = table.selected(); const list = sel.length ? contacts.filter((c) => sel.includes(c.id)) : rows(); download('contacts.csv', toCsv([['Name', 'Email', 'Status', 'List', 'Tags', 'Location', 'Score'], ...list.map((c) => [c.name, c.email, c.status, listName(c.list), c.tags.join('; '), c.location, c.score])])); toast(`Exported ${num(list.length)} contacts`); });
  [['#ct-q', 'q', 'input'], ['#ct-list', 'list', 'change'], ['#ct-status', 'status', 'change'], ['#ct-tag', 'tag', 'change']].forEach(([sel, key, ev]) => $(sel, root).addEventListener(ev, (e) => { f[key] = e.target.value; table.reset(); }));
  $('[data-bulk-delete]', root).addEventListener('click', async () => { const ids = table.selected(); if (await confirmBox({ title: `Delete ${ids.length} contacts?`, message: 'They will be removed from your audience.', confirmLabel: 'Delete', danger: true })) { ids.forEach((id) => { const i = contacts.findIndex((c) => c.id === id); if (i >= 0) contacts.splice(i, 1); }); table.clear(); toast(`${ids.length} contacts deleted`); } });
  $('[data-bulk-tag]', root).addEventListener('click', () => openModal({ title: 'Add a tag', size: 'sm', html: `<form novalidate><div class="modal-body">${field({ id: 'bt-tag', label: 'Tag name', required: true, minlength: 2, placeholder: 'Spring promo' })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Apply</button></footer></form>`,
    onOpen: (d) => { const form = $('form', d); liveValidate(form); form.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(form); if (!v) return; const ids = table.selected(); contacts.filter((c) => ids.includes(c.id)).forEach((c) => { if (!c.tags.includes(v['bt-tag'])) c.tags.push(v['bt-tag']); }); d.close(); table.draw(); toast(`Tag “${v['bt-tag']}” added to ${ids.length} contacts`); }); } }));
  table.draw();
};
