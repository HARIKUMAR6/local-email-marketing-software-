import { templates } from '../store.js';
import { pageHead, esc, icon, hydrateIcons, openModal, toast, $, $$ } from '../ui.js';

export const title = 'Templates';
const CATS = ['All', 'Newsletter', 'Promotion', 'Welcome', 'Transactional', 'Event', 'Favourites'];

/** CSS-built email thumbnails (always light, like a real inbox message). */
const thumb = (layout) => {
  const L = {
    hero: '<div class="h-5 bg-navy-900"></div><div class="h-14 bg-gradient-to-br from-indigo-300 to-aqua-300"></div><div class="grid gap-1.5 p-3"><i class="h-2 w-4/5 rounded bg-navy-900"></i><i class="h-1.5 w-full rounded bg-navy-200"></i><i class="h-1.5 w-3/4 rounded bg-navy-200"></i><i class="mt-1 h-4 w-1/2 rounded-full bg-indigo-600"></i></div>',
    circle: '<div class="grid place-items-center bg-indigo-50 p-4"><i class="h-14 w-14 rounded-full bg-indigo-500"></i></div><div class="grid justify-items-center gap-1.5 p-3"><i class="h-2.5 w-3/4 rounded bg-navy-900"></i><i class="h-1.5 w-2/3 rounded bg-navy-300"></i><i class="mt-1 h-4 w-1/3 rounded-full bg-navy-900"></i></div>',
    sale: '<div class="grid h-full place-content-center gap-1 bg-indigo-700 p-3 text-center text-white"><p class="text-3xl font-extrabold leading-none">30%</p><p class="text-xs font-bold tracking-widest">OFF TODAY</p><i class="mx-auto mt-2 h-4 w-14 rounded-full bg-aqua-400"></i></div>',
    split: '<div class="grid h-full grid-cols-[2fr_3fr]"><div class="bg-gradient-to-b from-aqua-300 to-indigo-400"></div><div class="grid content-center gap-1.5 p-2"><i class="h-2 w-full rounded bg-navy-900"></i><i class="h-1.5 w-full rounded bg-navy-200"></i><i class="h-1.5 w-2/3 rounded bg-navy-200"></i><i class="mt-1 h-3.5 w-3/5 rounded-full bg-navy-900"></i></div></div>',
    receipt: '<div class="grid gap-2 p-3"><i class="mb-1 block h-2.5 w-1/2 rounded bg-navy-900"></i><div class="flex justify-between"><i class="h-1.5 w-1/3 rounded bg-navy-300"></i><i class="h-1.5 w-1/6 rounded bg-navy-300"></i></div><div class="flex justify-between"><i class="h-1.5 w-2/5 rounded bg-navy-300"></i><i class="h-1.5 w-1/6 rounded bg-navy-300"></i></div><hr class="border-navy-200"><div class="flex justify-between"><i class="h-2 w-1/4 rounded bg-navy-900"></i><i class="h-2 w-1/5 rounded bg-aqua-600"></i></div></div>',
    date: '<div class="p-3"><div class="mb-2 grid h-14 place-items-center rounded-lg bg-aqua-100 text-center"><p class="text-xl font-extrabold leading-none text-aqua-900">14</p><p class="text-[10px] font-bold tracking-widest text-aqua-900">JUN</p></div><i class="mb-1.5 block h-2 w-4/5 rounded bg-navy-900"></i><i class="mb-1.5 block h-1.5 w-full rounded bg-navy-200"></i><i class="block h-4 w-1/2 rounded-full bg-indigo-600"></i></div>',
  };
  return `<div class="paper aspect-[4/5] overflow-hidden" aria-hidden="true">${L[layout]}</div>`;
};

export const render = () => `
${pageHead('Templates', 'Start from a professionally designed layout and make it yours.', '')}
<section class="panel !p-0">
  <div class="toolbar">
    <div class="search-box"><span class="search-ico">${icon('search')}</span><label class="sr-only" for="tp-q">Search templates</label><input class="input" id="tp-q" type="search" placeholder="Search templates…" autocomplete="off"></div>
    <div class="chips" role="group" aria-label="Category">${CATS.map((c, i) => `<button type="button" class="chip-btn" data-cat="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div>
  </div>
  <div id="tp-grid" class="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" aria-live="polite"></div>
</section>`;

export const mount = (root, { go }) => {
  const st = { cat: 'All', q: '' }; const grid = $('#tp-grid', root);
  const draw = () => {
    const rows = templates.filter((t) => (st.cat === 'All' || (st.cat === 'Favourites' ? t.star : t.category === st.cat)) && (!st.q || t.name.toLowerCase().includes(st.q.toLowerCase())));
    grid.innerHTML = rows.map((t) => `<article class="tpl card !p-3"><div class="tpl-thumb">${thumb(t.layout)}<div class="tpl-over"><button class="btn btn-sm btn-primary" type="button" data-use="${t.id}">Use template</button><button class="btn btn-sm btn-outline !bg-surface" type="button" data-prev="${t.id}">Preview</button></div></div><div class="mt-3 flex items-start justify-between gap-2"><div class="min-w-0"><h2 class="h6 truncate">${esc(t.name)}</h2><span class="badge mt-1">${esc(t.category)}</span></div><button class="btn-icon-sm${t.star ? ' is-star' : ''}" type="button" data-star="${t.id}" aria-pressed="${t.star}" aria-label="${t.star ? 'Remove' : 'Add'} ${esc(t.name)} ${t.star ? 'from' : 'to'} favourites">${icon('star')}</button></div></article>`).join('') || '<div class="empty col-span-full"><p class="font-bold">No templates found</p><p class="text-small">Try another category or search.</p></div>';
    hydrateIcons(grid);
  };
  draw();
  $('#tp-q', root).addEventListener('input', (e) => { st.q = e.target.value; draw(); });
  $('.chips', root).addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (!b) return; st.cat = b.dataset.cat; $$('[data-cat]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
  grid.addEventListener('click', (e) => {
    const use = e.target.closest('[data-use]'); const prev = e.target.closest('[data-prev]'); const star = e.target.closest('[data-star]');
    if (use) go('builder', { template: use.dataset.use });
    if (star) { const t = templates.find((x) => x.id === star.dataset.star); t.star = !t.star; draw(); toast(t.star ? 'Added to favourites' : 'Removed from favourites', 'info'); $(`[data-star="${t.id}"]`, grid)?.focus(); }
    if (prev) { const t = templates.find((x) => x.id === prev.dataset.prev); openModal({ title: t.name, size: 'sm', html: `<div class="modal-body"><div class="mx-auto max-w-[14rem]">${thumb(t.layout)}</div><p class="mt-4 text-small text-muted">${esc(t.category)} layout. Use it to start a new campaign in the builder.</p></div><footer class="modal-foot"><button class="btn btn-ghost" type="button" data-close>Close</button><button class="btn btn-primary" type="button" data-go>Use template</button></footer>`, onOpen: (d) => $('[data-go]', d).addEventListener('click', () => { d.close(); go('builder', { template: t.id }); }) }); }
  });
};
