import { automations, nextId, num, money } from '../store.js';
import { pageHead, esc, badge, icon, hydrateIcons, field, validate, liveValidate, openModal, confirmBox, toast, $ } from '../ui.js';

export const title = 'Automation';
const ICON = { trigger: 'zap', email: 'mail', wait: 'clock', condition: 'split', goal: 'target', tag: 'tag' };
const RECIPES = { blank: 'Start from scratch', a1: 'Welcome series', a2: 'Abandoned cart', a3: 'Win-back', a4: 'Post-purchase follow-up' };

export const render = () => `
${pageHead('Automation', 'Journeys that send the right message at the right moment.', `<button class="btn btn-primary" type="button" data-new>${icon('plus')}New automation</button>`)}
<div class="grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]">
  <section class="panel !p-3" aria-label="Automations"><ul id="au-list" class="grid gap-2"></ul></section>
  <section class="panel" id="au-detail" aria-live="polite"></section>
</div>`;

export const mount = (root) => {
  let sel = automations[0]?.id;
  const list = $('#au-list', root); const detail = $('#au-detail', root);

  const drawList = () => {
    list.innerHTML = automations.map((a) => `<li><button type="button" class="au-item${a.id === sel ? ' is-on' : ''}" data-pick="${a.id}" aria-pressed="${a.id === sel}"><span class="min-w-0 text-start"><span class="block truncate font-bold">${esc(a.name)}</span><span class="caption block truncate">${esc(a.trigger)}</span></span>${badge(a.status)}</button></li>`).join('');
  };
  const drawDetail = () => {
    const a = automations.find((x) => x.id === sel);
    if (!a) { detail.innerHTML = '<div class="empty"><p class="font-bold">No automation selected</p></div>'; return; }
    const rate = a.enrolled ? Math.round((a.completed / a.enrolled) * 100) : 0;
    detail.innerHTML = `<div class="flex flex-wrap items-start justify-between gap-3"><div><h2 class="h4">${esc(a.name)}</h2><p class="text-small text-muted">Trigger: ${esc(a.trigger)}</p></div>
      <label class="check-label"><input class="switch" type="checkbox" role="switch" data-toggle${a.status === 'Active' ? ' checked' : ''} aria-label="${esc(a.name)} is active"> <span data-state>${a.status === 'Active' ? 'Active' : a.status}</span></label></div>
      <div class="my-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div class="pv-tile"><p class="pv-label">Enrolled</p><p class="pv-num">${num(a.enrolled)}</p></div><div class="pv-tile"><p class="pv-label">Completed</p><p class="pv-num">${num(a.completed)}</p></div><div class="pv-tile"><p class="pv-label">Completion rate</p><p class="pv-num">${rate}%</p></div><div class="pv-tile"><p class="pv-label">Revenue</p><p class="pv-num">${money(a.revenue)}</p></div></div>
      <div class="mb-3 flex items-center justify-between gap-3"><h3 class="h6">Journey steps</h3><div class="flex gap-2"><button class="btn btn-outline btn-sm" type="button" data-add-step>${icon('plus')}Add step</button><button class="btn btn-ghost btn-sm" type="button" data-del aria-label="Delete ${esc(a.name)}">${icon('trash')}</button></div></div>
      <ol class="vflow" aria-label="Steps in ${esc(a.name)}">${a.steps.map((s, i) => `<li class="vflow-item"><span class="vflow-dot${s.type === 'email' || s.type === 'goal' ? ' is-accent' : ''}">${icon(ICON[s.type] || 'zap')}</span><div class="flex items-start justify-between gap-3"><div><h4>${esc(s.title)}</h4><p>${esc(s.sub)}</p></div>${s.type !== 'trigger' ? `<button class="btn-icon-sm" type="button" data-rm="${i}" aria-label="Remove step ${esc(s.title)}">${icon('close')}</button>` : ''}</div></li>`).join('')}</ol>`;
    hydrateIcons(detail);
  };
  const redraw = () => { drawList(); drawDetail(); };
  redraw();

  root.addEventListener('click', async (e) => {
    const pick = e.target.closest('[data-pick]'); const rm = e.target.closest('[data-rm]');
    const a = automations.find((x) => x.id === sel);
    if (pick) { sel = pick.dataset.pick; redraw(); }
    if (rm && a) { a.steps.splice(+rm.dataset.rm, 1); drawDetail(); toast('Step removed', 'info'); }
    if (e.target.closest('[data-del]') && a && await confirmBox({ title: 'Delete automation?', message: `“${esc(a.name)}” and its journey steps will be removed.`, confirmLabel: 'Delete', danger: true })) { automations.splice(automations.indexOf(a), 1); sel = automations[0]?.id; redraw(); toast('Automation deleted'); }
    if (e.target.closest('[data-add-step]') && a) openModal({ title: 'Add a step', size: 'sm', html: `<form novalidate><div class="modal-body grid gap-4">${field({ id: 'st-type', label: 'Step type', options: [['email', 'Send an email'], ['wait', 'Wait'], ['condition', 'Condition'], ['tag', 'Add a tag']] })}${field({ id: 'st-title', label: 'Step name', required: true, minlength: 3, placeholder: 'Send follow-up' })}${field({ id: 'st-sub', label: 'Details', placeholder: 'Optional description' })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Add step</button></footer></form>`,
      onOpen: (d) => { const f = $('form', d); liveValidate(f); f.addEventListener('submit', (ev) => { ev.preventDefault(); const v = validate(f); if (!v) return; const at = a.steps.at(-1)?.type === 'goal' ? a.steps.length - 1 : a.steps.length; a.steps.splice(at, 0, { type: v['st-type'], title: v['st-title'], sub: v['st-sub'] || '—' }); d.close(); drawDetail(); toast('Step added'); }); } });
  });
  root.addEventListener('change', (e) => {
    if (!e.target.matches('[data-toggle]')) return;
    const a = automations.find((x) => x.id === sel);
    a.status = e.target.checked ? 'Active' : 'Paused';
    redraw(); toast(`${a.name} is now ${a.status.toLowerCase()}`, 'info');
  });
  $('[data-new]', root).addEventListener('click', () => openModal({ title: 'New automation', size: 'sm',
    html: `<form novalidate><div class="modal-body grid gap-4">${field({ id: 'na-name', label: 'Automation name', required: true, minlength: 3, placeholder: 'Birthday offer' })}${field({ id: 'na-recipe', label: 'Start from', options: Object.entries(RECIPES) })}</div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Create</button></footer></form>`,
    onOpen: (d) => { const f = $('form', d); liveValidate(f); $('#na-name', d).focus(); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; const src = automations.find((x) => x.id === v['na-recipe']); const a = { id: nextId('a'), name: v['na-name'], trigger: src?.trigger || 'Choose a trigger', status: 'Draft', enrolled: 0, completed: 0, revenue: 0, steps: src ? src.steps.map((s) => ({ ...s })) : [{ type: 'trigger', title: 'Choose a trigger', sub: 'Tell VELORA when to start' }] }; automations.unshift(a); sel = a.id; d.close(); redraw(); toast(`“${a.name}” created as a draft`); }); } }));
};
