// Hash router: #/overview, #/campaigns?status=Sent … Each view exports { title, render(ctx), mount?(root, ctx) }.
import { $ } from '../core/dom.js';
import { hydrateIcons } from '../components/icons.js';
import { setActiveLink } from './sidebar.js';
import * as overview from './views/overview.js';
import * as campaigns from './views/campaigns.js';
import * as builder from './views/builder.js';
import * as contacts from './views/contacts.js';
import * as lists from './views/lists.js';
import * as automation from './views/automation.js';
import * as templates from './views/templates.js';
import * as analytics from './views/analytics.js';
import * as reports from './views/reports.js';
import * as settings from './views/settings.js';

export const VIEWS = { overview, campaigns, builder, contacts, lists, automation, templates, analytics, reports, settings };

export const parse = () => {
  const [name, qs = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { name: VIEWS[name] ? name : 'overview', params: Object.fromEntries(new URLSearchParams(qs)) };
};

export const go = (name, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  location.hash = `#/${name}${qs ? `?${qs}` : ''}`;
};

const render = () => {
  const { name, params } = parse();
  const view = VIEWS[name];
  // Each view gets a fresh container so its event listeners are discarded with it.
  const host = $('#view');
  host.replaceChildren();
  const root = document.createElement('div');
  root.className = 'view-body';
  host.append(root);
  const ctx = { params, go };
  root.innerHTML = view.render(ctx);
  hydrateIcons(root);
  view.mount?.(root, ctx);
  setActiveLink(name);
  document.title = `${view.title} — VELORA Dashboard`;
  window.scrollTo(0, 0);
  $('h1', root)?.focus({ preventScroll: true });
};

export const initRouter = () => {
  window.addEventListener('hashchange', render);
  document.addEventListener('velora:new-campaign', () => go('campaigns', { new: Date.now() }));
  if (!location.hash) history.replaceState(null, '', '#/overview');
  render();
};
