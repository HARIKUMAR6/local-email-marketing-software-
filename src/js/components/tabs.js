// Accessible tabs: <div data-tabs> with [role=tablist] > [role=tab][aria-controls] and [role=tabpanel].
// Arrow keys, Home and End move between tabs.
import { $$ } from '../core/dom.js';

export const initTabs = () => {
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const panels = $$('[role="tabpanel"]', root);

    const select = (tab, focus = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const rtl = document.documentElement.dir === 'rtl' ? -1 : 1;
        const step = { ArrowRight: rtl, ArrowLeft: -rtl, ArrowDown: 1, ArrowUp: -1 }[e.key];
        let next = null;
        if (step) next = tabs[(i + step + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  });
};
