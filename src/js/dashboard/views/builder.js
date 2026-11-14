import { campaigns, lists, templates, builderTemplates, nextId, contacts } from '../store.js';
import { pageHead, esc, icon, field, validate, liveValidate, openModal, toast, $, $$ } from '../ui.js';

export const title = 'Email Builder';

const COLORS = { navy: '#101d38', indigo: '#3b57e0', aqua: '#43d6c5', white: '#ffffff' };
const ON = { navy: '#ffffff', indigo: '#ffffff', aqua: '#101d38', white: '#101d38' };
const DEFAULTS = {
  header: { brand: 'Alder & Co.', bg: 'navy' },
  hero: { title: 'Spring is here', sub: 'Fresh arrivals, lighter fabrics and free delivery this week.', cta: 'Shop the collection', bg: 'indigo' },
  heading: { text: 'Your headline goes here', align: 'start' },
  text: { text: 'Write a short, friendly paragraph that gets to the point. Tell readers what is new, why it matters and what to do next.' },
  button: { label: 'Shop now', color: 'indigo', align: 'start' },
  image: { caption: 'The new seasonal collection' },
  columns: { a: 'Everyday tote', b: 'Weekend jacket' },
  divider: {},
  footer: { text: 'You are receiving this email because you subscribed. Unsubscribe at any time.' },
};
const PALETTE = [['header', 'Header', 'layers'], ['hero', 'Hero banner', 'image'], ['heading', 'Heading', 'type'], ['text', 'Text', 'type'], ['button', 'Button', 'cursor'], ['image', 'Image', 'image'], ['columns', 'Product columns', 'layout'], ['divider', 'Divider', 'minus'], ['footer', 'Footer', 'mail']];
const PROPS = {
  header: [['brand', 'Brand name'], ['bg', 'Background', 'color']],
  hero: [['title', 'Title'], ['sub', 'Subtitle', 'area'], ['cta', 'Button label'], ['bg', 'Background', 'color']],
  heading: [['text', 'Heading'], ['align', 'Alignment', 'align']],
  text: [['text', 'Text', 'area']],
  button: [['label', 'Button label'], ['color', 'Colour', 'color'], ['align', 'Alignment', 'align']],
  image: [['caption', 'Caption']],
  columns: [['a', 'First product'], ['b', 'Second product']],
  divider: [], footer: [['text', 'Footer text', 'area']],
};

const doc = { subject: 'Spring is here — fresh arrivals inside', preheader: 'Free delivery this week only', blocks: [], sel: 0, device: 'desktop', campaign: null };
const mk = (type, extra = {}) => ({ id: nextId('b'), type, ...DEFAULTS[type], ...extra });
const seed = (layout) => { doc.blocks = (builderTemplates[layout] || builderTemplates.hero).map(({ type, ...o }) => mk(type, o)); doc.sel = 1; };
if (!doc.blocks.length) seed('hero');

const art = '<svg viewBox="0 0 360 140" class="block w-full" aria-hidden="true"><rect width="360" height="140" fill="#dde3fd"/><circle cx="290" cy="38" r="58" fill="#43d6c5" opacity=".55"/><circle cx="60" cy="130" r="86" fill="#526ff5" opacity=".35"/><path d="M0 108C60 80 110 118 180 92S300 74 360 100V140H0Z" fill="#3b57e0"/></svg>';
const blockHtml = (b) => {
  switch (b.type) {
    case 'header': return `<div style="background:${COLORS[b.bg]};color:${ON[b.bg]}" class="px-5 py-3 text-xs font-extrabold tracking-widest">${esc(b.brand.toUpperCase())}</div>`;
    case 'hero': return `<div style="background:${COLORS[b.bg]};color:${ON[b.bg]}" class="px-5 py-8 text-center"><p class="text-2xl font-extrabold leading-tight">${esc(b.title)}</p><p class="mx-auto mt-2 max-w-sm text-sm opacity-90">${esc(b.sub)}</p><span class="mt-4 inline-block rounded-full px-5 py-2 text-xs font-bold" style="background:${ON[b.bg]};color:${COLORS[b.bg]}">${esc(b.cta)}</span></div>`;
    case 'heading': return `<p class="px-5 pt-5 text-xl font-extrabold" style="text-align:${b.align}">${esc(b.text)}</p>`;
    case 'text': return `<p class="px-5 py-3 text-sm leading-relaxed text-[#4a5878]">${esc(b.text)}</p>`;
    case 'button': return `<div class="px-5 py-3" style="text-align:${b.align}"><span class="inline-block rounded-full px-5 py-2.5 text-xs font-bold" style="background:${COLORS[b.color]};color:${ON[b.color]}">${esc(b.label)}</span></div>`;
    case 'image': return `<figure>${art}<figcaption class="px-5 py-2 text-xs text-[#4a5878]">${esc(b.caption)}</figcaption></figure>`;
    case 'columns': return `<div class="grid grid-cols-2 gap-3 px-5 py-3">${[b.a, b.b].map((n) => `<div class="rounded-lg bg-[#eef2fa] p-3 text-center"><i class="mb-2 block h-14 rounded bg-[#ccf5f0]"></i><p class="text-xs font-bold">${esc(n)}</p></div>`).join('')}</div>`;
    case 'divider': return '<hr class="mx-5 my-3 border-[#dce3f0]">';
    default: return `<p class="bg-[#eef2fa] px-5 py-4 text-center text-xs text-[#4a5878]">${esc(b.text)}</p>`;
  }
};

const propField = (b, [key, label, kind]) => {
  const id = `bp-${key}`; const v = b[key] ?? '';
  const ctl = kind === 'area' ? `<textarea class="textarea" id="${id}" data-prop="${key}" rows="3">${esc(v)}</textarea>`
    : kind === 'color' ? `<select class="select" id="${id}" data-prop="${key}">${Object.keys(COLORS).map((c) => `<option value="${c}"${c === v ? ' selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`).join('')}</select>`
    : kind === 'align' ? `<select class="select" id="${id}" data-prop="${key}">${['start', 'center', 'end'].map((c) => `<option value="${c}"${c === v ? ' selected' : ''}>${c[0].toUpperCase() + c.slice(1)}</option>`).join('')}</select>`
    : `<input class="input" id="${id}" data-prop="${key}" value="${esc(v)}">`;
  return `<div class="field"><label class="label" for="${id}">${label}</label>${ctl}</div>`;
};

export const render = () => `
${pageHead('Email Builder', 'Design a campaign with drag-free blocks, then save, test or schedule it.', `<button class="btn btn-outline" type="button" data-test>${icon('mail')}Send test</button><button class="btn btn-outline" type="button" data-save>${icon('check')}Save draft</button><button class="btn btn-primary" type="button" data-schedule>${icon('calendar')}Schedule</button>`)}
<div class="grid gap-3 md:grid-cols-2">
  <div class="field"><label class="label" for="bd-subject">Subject line</label><input class="input" id="bd-subject" aria-describedby="bd-subject-err" aria-invalid="false"><p class="error-text" id="bd-subject-err"></p></div>
  <div class="field"><label class="label" for="bd-pre">Preheader</label><input class="input" id="bd-pre"></div>
</div>
<div class="builder">
  <aside class="panel" aria-labelledby="bd-blocks"><h2 class="h6 mb-3" id="bd-blocks">Add a block</h2><div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">${PALETTE.map(([t, l, i]) => `<button type="button" class="palette-btn" data-add="${t}">${icon(i)}<span>${l}</span></button>`).join('')}</div></aside>
  <section aria-label="Email canvas" class="min-w-0">
    <div class="mb-3 flex items-center justify-between gap-3"><p class="text-small text-muted" id="bd-hint">Select a block to edit it.</p><div class="segmented" role="group" aria-label="Preview size"><button type="button" data-device="desktop" aria-pressed="true">${icon('monitor')}<span class="sr-only">Desktop</span></button><button type="button" data-device="mobile" aria-pressed="false">${icon('smartphone')}<span class="sr-only">Mobile</span></button></div></div>
    <div class="canvas"><div class="paper canvas-paper" id="bd-canvas"></div></div>
  </section>
  <aside class="panel" aria-labelledby="bd-props"><h2 class="h6 mb-3" id="bd-props">Block settings</h2><div id="bd-form" class="grid gap-3"></div></aside>
</div>`;

export const mount = (root, { params, go }) => {
  const tpl = params.template && templates.find((t) => t.id === params.template);
  if (tpl) { seed(tpl.layout); doc.campaign = null; doc.subject = `${tpl.name} — fresh from Alder & Co.`; }
  if (params.campaign) { const c = campaigns.find((x) => x.id === params.campaign); if (c) { doc.campaign = c.id; doc.subject = c.subject; } }
  const canvas = $('#bd-canvas', root); const form = $('#bd-form', root); const subj = $('#bd-subject', root); const pre = $('#bd-pre', root);
  subj.value = doc.subject; pre.value = doc.preheader;

  const drawCanvas = () => {
    canvas.parentElement.classList.toggle('is-mobile', doc.device === 'mobile');
    canvas.innerHTML = doc.blocks.map((b, i) => `<div class="blk${i === doc.sel ? ' is-sel' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(b.type)} block${i === doc.sel ? ', selected' : ''}">${blockHtml(b)}${i === doc.sel ? `<div class="blk-tools"><button type="button" data-op="up" aria-label="Move up"${i === 0 ? ' disabled' : ''}>${icon('arrowDown', 'rotate-180')}</button><button type="button" data-op="down" aria-label="Move down"${i === doc.blocks.length - 1 ? ' disabled' : ''}>${icon('arrowDown')}</button><button type="button" data-op="dup" aria-label="Duplicate block">${icon('copy')}</button><button type="button" data-op="del" aria-label="Delete block">${icon('trash')}</button></div>` : ''}</div>`).join('') || '<p class="p-8 text-center text-small text-[#4a5878]">Your email is empty. Add a block from the left.</p>';
  };
  const drawForm = () => {
    const b = doc.blocks[doc.sel];
    form.innerHTML = b ? `<p class="chip is-primary w-fit">${esc(b.type)}</p>${PROPS[b.type].map((p) => propField(b, p)).join('') || '<p class="text-small text-muted">This block has no settings.</p>'}` : '<p class="text-small text-muted">Select a block on the canvas to edit it.</p>';
  };
  const redraw = () => { drawCanvas(); drawForm(); $$('[data-device]', root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.device === doc.device))); };
  redraw();

  root.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]'); const op = e.target.closest('[data-op]'); const blk = e.target.closest('.blk'); const dev = e.target.closest('[data-device]');
    if (dev) { doc.device = dev.dataset.device; redraw(); return; }
    if (add) { const at = doc.sel + 1 || doc.blocks.length; doc.blocks.splice(at, 0, mk(add.dataset.add)); doc.sel = at; redraw(); toast(`${add.textContent.trim()} added`, 'info'); return; }
    if (op) {
      const i = doc.sel; const b = doc.blocks;
      if (op.dataset.op === 'up' && i > 0) { [b[i - 1], b[i]] = [b[i], b[i - 1]]; doc.sel--; }
      if (op.dataset.op === 'down' && i < b.length - 1) { [b[i + 1], b[i]] = [b[i], b[i + 1]]; doc.sel++; }
      if (op.dataset.op === 'dup') { b.splice(i + 1, 0, { ...b[i], id: nextId('b') }); doc.sel++; }
      if (op.dataset.op === 'del') { b.splice(i, 1); doc.sel = Math.min(i, b.length - 1); }
      redraw(); return;
    }
    if (blk) { doc.sel = +blk.dataset.i; redraw(); $(`.blk[data-i="${doc.sel}"]`, root)?.focus(); }
  });
  canvas.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.blk') && !e.target.matches('.is-sel')) { e.preventDefault(); doc.sel = +e.target.dataset.i; redraw(); $(`.blk[data-i="${doc.sel}"]`, root)?.focus(); } });
  form.addEventListener('input', (e) => { const k = e.target.dataset.prop; if (k) { doc.blocks[doc.sel][k] = e.target.value; drawCanvas(); } });
  subj.addEventListener('input', () => { doc.subject = subj.value; subj.setAttribute('aria-invalid', 'false'); $('#bd-subject-err', root).textContent = ''; });
  pre.addEventListener('input', () => { doc.preheader = pre.value; });

  const needSubject = () => { if (doc.subject.trim().length >= 5) return true; subj.setAttribute('aria-invalid', 'true'); $('#bd-subject-err', root).textContent = 'Add a subject line of at least 5 characters.'; subj.focus(); return false; };
  const persist = (status, date) => {
    let c = campaigns.find((x) => x.id === doc.campaign);
    if (!c) { c = { id: nextId('m'), name: doc.subject.split(' — ')[0], list: 'l1', audience: contacts.filter((x) => x.list === 'l1' && x.status === 'Subscribed').length, sent: 0, opens: 0, clicks: 0, revenue: 0, type: 'Regular' }; campaigns.unshift(c); doc.campaign = c.id; }
    Object.assign(c, { subject: doc.subject, status, date: date || new Date() });
    return c;
  };
  $('[data-save]', root).addEventListener('click', () => { if (needSubject()) { persist('Draft'); toast('Draft saved to Campaigns'); } });
  $('[data-test]', root).addEventListener('click', () => {
    if (!needSubject()) return;
    openModal({ title: 'Send a test email', size: 'sm', html: `<form novalidate><div class="modal-body grid gap-3">${field({ id: 'te-email', label: 'Send test to', type: 'email', required: true, value: 'alex@alderandco.com' })}<p class="text-small text-muted">Test sends are simulated: no email is delivered from this build.</p></div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Send test</button></footer></form>`,
      onOpen: (d) => { const f = $('form', d); liveValidate(f); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (v) { d.close(); toast(`Test to ${v['te-email']} recorded (simulated)`, 'info'); } }); } });
  });
  $('[data-schedule]', root).addEventListener('click', () => {
    if (!needSubject()) return;
    const min = new Date(Date.now() + 36e5).toISOString().slice(0, 16);
    openModal({ title: 'Schedule campaign', size: 'sm', html: `<form novalidate><div class="modal-body grid gap-3">${field({ id: 'sc-list', label: 'Send to', options: lists.map((l) => [l.id, l.name]) })}${field({ id: 'sc-when', label: 'Send date and time', type: 'datetime-local', required: true, value: min })}<p class="text-small text-muted">Scheduling updates this campaign in your list. Nothing is sent from this build.</p></div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Cancel</button><button class="btn btn-primary" type="submit">Schedule</button></footer></form>`,
      onOpen: (d) => { const f = $('form', d); liveValidate(f); f.addEventListener('submit', (e) => { e.preventDefault(); const v = validate(f); if (!v) return; if (new Date(v['sc-when']) < new Date()) { $('#sc-when-err', d).textContent = 'Choose a time in the future.'; $('#sc-when', d).setAttribute('aria-invalid', 'true'); return; } const c = persist('Scheduled', new Date(v['sc-when'])); c.list = v['sc-list']; d.close(); toast(`“${c.name}” scheduled`); go('campaigns'); }); } });
  });
};
