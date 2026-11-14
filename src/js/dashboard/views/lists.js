import { lists, segments, contacts, FIELDS, segmentCount, nextId, num } from '../store.js';
import { pageHead, tabsBar, hydrateIcons, esc, icon, field, validate, liveValidate, openModal, confirmBox, toast, $, $$ } from '../ui.js';
import { spark } from '../charts.js';

export const title = 'Lists & Segments';
const members = (id) => contacts.filter((c) => c.list === id).length;
const trend = (id) => Array.from({ length: 12 }, (_, i) => 20 + ((id.charCodeAt(1) * (i + 3)) % 11) + i * 1.6);
const summary = (s) => s.rules.map((r) => `${FIELDS[r.field].label} ${r.op} ${FIELDS[r.field].labels?.[r.value] || r.value}`).join(s.mode === 'all' ? ' AND ' : ' OR ');

export const render = () => `
${pageHead('Lists & Segments', 'Organise your audience into lists and dynamic segments.', `<button class="btn btn-outline" type="button" data-new-list>${icon('plus')}New list</button><button class="btn btn-primary" type="button" data-new-seg>${icon('filter')}New segment</button>`)}
${tabsBar('Audience groups', [['lists', 'Lists'], ['segments', 'Segments']])}
<div id="panel-lists" role="tabpanel" aria-labelledby="tab-lists" tabindex="0"></div>
<div id="panel-segments" role="tabpanel" aria-labelledby="tab-segments" tabindex="0" hidden></div>`;

export const mount = (root, { go }) => {
  const drawLists = () => {
    $('#panel-lists', root).innerHTML = `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">${lists.map((l) => `<article class="panel grid content-between gap-4"><div><div class="flex items-start justify-between gap-3"><h2 class="h5">${esc(l.name)}</h2><span class="${l.growth >= 0 ? 'pv-up' : 'pv-down'}">${l.growth >= 0 ? '+' : ''}${l.growth}%</span></div><p class="mt-1 text-small text-muted">${esc(l.desc)}</p></div><div class="flex items-end justify-between gap-4"><div><p class="kpi-num">${num(members(l.id))}</p><p class="caption">contacts</p></div><span class="w-28">${spark(trend(l.id), l.growth >= 0 ? 'var(--v-primary)' : 'var(--v-danger)')}</span></div><div class="flex gap-2"><button class="btn btn-outline btn-sm" type="button" data-view-list="${l.id}">View contacts</button><button class="btn btn-ghost btn-sm" type="button" data-del-list="${l.id}" aria-label="Delete ${esc(l.name)}">${icon('trash')}</button></div></article>`).join('')}</div>`;
  };
  const drawSegs = () => {
    $('#panel-segments', root).innerHTML = `<section class="panel !p-0"><div class="tbl-wrap" tabindex="0" role="region" aria-label="Segments"><table class="tbl"><thead><tr><th scope="col">Segment</th><th scope="col">Rules</th><th scope="col" class="text-end">Matches</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>${segments.map((s) => `<tr data-id="${s.id}"><td class="font-semibold">${esc(s.name)}</td><td class="text-muted">${esc(summary(s))}</td><td class="text-end font-bold">${num(segmentCount(s.rules, s.mode))}</td><td class="tbl-actions"><button class="btn-icon-sm" data-act="edit" aria-label="Edit ${esc(s.name)}">${icon('edit')}</button><button class="btn-icon-sm" data-act="delete" aria-label="Delete ${esc(s.name)}">${icon('trash')}</button></td></tr>`).join('') || '<tr><td colspan="4"><div class="empty"><p class="font-bold">No segments yet</p></div></td></tr>'}</tbody></table></div></section>`;
    hydrateIcons(root);
  };
  drawLists(); drawSegs();

  root.addEventListener('click', async (e) => {
    const v = e.target.closest('[data-view-list]'); const dl = e.target.closest('[data-del-list]'); const act = e.target.closest('#panel-segments [data-act]');
    if (v) go('contacts', { list: v.dataset.viewList });
    if (dl) { const l = lists.find((x) => x.id === dl.dataset.delList); if (await confirmBox({ title: 'Delete list?', message: `“${esc(l.name)}” will be removed. Its contacts stay in your audience.`, confirmLabel: 'Delete', danger: true })) { lists.splice(lists.indexOf(l), 1); drawLists(); hydrateIcons(root); toast('List deleted'); } }
    if (act) { const s = segments.find((x) => x.id === act.closest('tr').dataset.id); if (act.dataset.act === 'edit') segmentModal(s); else if (await confirmBox({ title: 'Delete segment?', message: `“${esc(s.name)}” will be removed.`, confirmLabel: 'Delete', danger: true })) { segments.splice(segments.indexOf(s), 1); drawSegs(); toast('Segment deleted'); } }
  });

  const redrawIcons = () => hydrateIcons(root);
  $('[data-new-list]', root).addEventListener('click', () => openModal({ title: 'New list', size: 'sm', html: `<form novalidate><div class="modal-body grid gap-4">${field({ id: 'nl-name', label: 'List name', required: true, minlength: 3 })}${field({ id: 'nl-desc', label: 'Description', type: 'textarea', rows: 3 })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Create list</button></footer></form>`,
    onOpen: (d) => { const f = $('form', d); liveValidate(f); $('#nl-name', d).focus(); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; lists.push({ id: nextId('l'), name: v['nl-name'], desc: v['nl-desc'] || 'No description yet', growth: 0 }); d.close(); drawLists(); redrawIcons(); toast(`List “${v['nl-name']}” created`); }); } }));

  const segmentModal = (existing) => {
    const rules = existing ? existing.rules.map((r) => ({ ...r })) : [{ field: 'tag', op: 'is', value: FIELDS.tag.values[0] }];
    const valueCtl = (r, i) => { const F = FIELDS[r.field]; return F.number ? `<input class="input" type="number" min="0" data-rule="${i}" data-k="value" value="${esc(r.value)}" aria-label="Value">` : `<select class="select" data-rule="${i}" data-k="value" aria-label="Value">${F.values.map((v) => `<option value="${esc(v)}"${String(v) === String(r.value) ? ' selected' : ''}>${esc(F.labels?.[v] || v)}</option>`).join('')}</select>`; };
    const row = (r, i) => `<div class="rule-row"><select class="select" data-rule="${i}" data-k="field" aria-label="Field">${Object.entries(FIELDS).map(([k, F]) => `<option value="${k}"${k === r.field ? ' selected' : ''}>${F.label}</option>`).join('')}</select><select class="select" data-rule="${i}" data-k="op" aria-label="Condition">${FIELDS[r.field].ops.map((o) => `<option${o === r.op ? ' selected' : ''}>${o}</option>`).join('')}</select>${valueCtl(r, i)}<button type="button" class="btn-icon-sm" data-rm="${i}" aria-label="Remove rule"${rules.length === 1 ? ' disabled' : ''}>${icon('close')}</button></div>`;
    const dlg = openModal({ title: existing ? 'Edit segment' : 'New segment', size: 'lg',
      html: `<form novalidate><div class="modal-body grid gap-4">${field({ id: 'sg-name', label: 'Segment name', required: true, minlength: 3, value: existing?.name || '' })}<div class="field"><label class="label" for="sg-mode">Contacts must match</label><select class="select !w-auto" id="sg-mode"><option value="all"${existing?.mode !== 'any' ? ' selected' : ''}>all of the rules</option><option value="any"${existing?.mode === 'any' ? ' selected' : ''}>any of the rules</option></select></div><div id="sg-rules" class="grid gap-2"></div><div><button class="btn btn-ghost btn-sm" type="button" data-add-rule>${icon('plus')}Add rule</button></div><p class="rounded-lg bg-primary-soft p-3 text-small font-semibold" aria-live="polite" id="sg-count"></p></div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Save segment</button></footer></form>`,
      onOpen: (d) => {
        const box = $('#sg-rules', d); const f = $('form', d); liveValidate(f);
        const draw = () => { box.innerHTML = rules.map(row).join(''); hydrateIcons(box); const n = segmentCount(rules, $('#sg-mode', d).value); $('#sg-count', d).textContent = `About ${num(n)} of ${num(contacts.length)} contacts match these rules.`; };
        draw();
        box.addEventListener('change', (e) => { const el = e.target; const i = +el.dataset.rule; if (Number.isNaN(i)) return; const r = rules[i]; r[el.dataset.k] = el.value; if (el.dataset.k === 'field') { r.op = FIELDS[r.field].ops[0]; r.value = FIELDS[r.field].number ? 50 : FIELDS[r.field].values[0]; } draw(); });
        box.addEventListener('input', (e) => { if (e.target.type === 'number') { rules[+e.target.dataset.rule].value = e.target.value; $('#sg-count', d).textContent = `About ${num(segmentCount(rules, $('#sg-mode', d).value))} of ${num(contacts.length)} contacts match these rules.`; } });
        box.addEventListener('click', (e) => { const rm = e.target.closest('[data-rm]'); if (rm) { rules.splice(+rm.dataset.rm, 1); draw(); } });
        $('[data-add-rule]', d).addEventListener('click', () => { rules.push({ field: 'status', op: 'is', value: 'Subscribed' }); draw(); });
        $('#sg-mode', d).addEventListener('change', draw);
        f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; const data = { name: v['sg-name'], mode: $('#sg-mode', d).value, rules: rules.map((r) => ({ ...r })) }; if (existing) Object.assign(existing, data); else segments.push({ id: nextId('s'), ...data }); d.close(); drawSegs(); redrawIcons(); toast(`Segment “${data.name}” saved`); });
      } });
    return dlg;
  };
  $('[data-new-seg]', root).addEventListener('click', () => { const t = $('#tab-segments', root); t.click(); segmentModal(); });
};
