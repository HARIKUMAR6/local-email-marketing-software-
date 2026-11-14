// Click-only dropdowns. Closed by default; never opened on hover.
//   [data-dropdown]            → floating menu (closes on outside click / Esc)
//   [data-dropdown="accordion"] → inline drawer menu (toggles only on its trigger)
import { $$ } from '../core/dom.js';

const setOpen = (dd, open) => {
  dd.classList.toggle('is-open', open);
  dd.querySelector('[data-dropdown-trigger]')?.setAttribute('aria-expanded', String(open));
};

const closeFloating = (except) =>
  $$('[data-dropdown].is-open').forEach((dd) => {
    if (dd !== except && dd.dataset.dropdown !== 'accordion') setOpen(dd, false);
  });

export const closeAllDropdowns = () => $$('[data-dropdown].is-open').forEach((dd) => setOpen(dd, false));

export const initDropdowns = () => {
  $$('[data-dropdown]').forEach((dd) => setOpen(dd, false));

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dropdown-trigger]');
    if (trigger) {
      const dd = trigger.closest('[data-dropdown]');
      closeFloating(dd);
      setOpen(dd, !dd.classList.contains('is-open'));
      return;
    }
    const inside = e.target.closest('[data-dropdown]');
    if (inside && e.target.closest('a[href]')) { setOpen(inside, false); return; }
    closeFloating(inside);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $$('[data-dropdown].is-open').find((dd) => dd.dataset.dropdown !== 'accordion');
    if (!open) return;
    setOpen(open, false);
    open.querySelector('[data-dropdown-trigger]')?.focus();
  });
};
