// Pricing: plan cards, global monthly/yearly toggle, contact-volume calculator,
// comparison table and FAQs. Data lives in config/pricing.js (showcase only — no checkout).
import { plans as homePlans, volumeSteps as homeSteps } from '../config/site.js';
import { plans as allPlans, volumeSteps as allSteps, compare, pricingFaqs, YEARLY_DISCOUNT } from '../config/pricing.js';
import { url, $, $$ } from '../core/dom.js';
import { icon } from './icons.js';

const money = (n) => `$${n.toLocaleString('en-US')}`;
const num = (n) => n.toLocaleString('en-US');
const state = { yearly: false };

const priceBlock = (p) => (p.monthly == null
  ? '<div class="plan-price"><span class="amount">Custom</span></div>'
  : `<div class="plan-price"><span class="amount" data-monthly="${p.monthly}" data-yearly="${p.yearly}">${money(p.monthly)}</span><span class="per">/ month</span></div>`);

const planCard = (p, detailed) => `
<article class="card plan${p.featured ? ' is-featured' : ''} reveal">
  <div class="flex items-center justify-between gap-3">
    <h3 class="h4">${p.name}</h3>
    ${p.featured ? '<span class="badge badge-primary">Most popular</span>' : ''}
  </div>
  <p class="card-text">${p.blurb}</p>
  <div>
    ${priceBlock(p)}
    <p class="caption mt-1">${p.monthly == null ? 'Volume pricing for large audiences' : `Up to ${p.contacts} contacts`}</p>
    ${detailed && p.monthly != null ? '<p class="caption" data-billing-note>Billed monthly</p>' : ''}
  </div>
  <ul class="check-list">${p.features.map((f) => `<li><span data-icon="check"></span><span>${f}</span></li>`).join('')}</ul>
  <a class="btn ${p.featured ? 'btn-primary' : 'btn-outline'} btn-block" href="${url(p.cta.href)}">${p.cta.label}</a>
</article>`;

const renderPlans = () => $$('[data-component="plans"]').forEach((el) => {
  const all = el.hasAttribute('data-all');
  const list = all ? allPlans : homePlans;
  const cols = all ? 'sm:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3';
  el.outerHTML = `<div class="grid items-stretch gap-6 ${cols}">${list.map((p) => planCard(p, all)).join('')}</div>`;
});

// Per-plan savings table for the billing section.
const renderSavings = () => $$('[data-component="savings"]').forEach((el) => {
  const rows = allPlans.filter((p) => p.monthly != null).map((p) => `
    <li class="pv-row">
      <span class="grow font-bold">${p.name}</span>
      <span class="text-muted line-through" aria-label="Monthly price">${money(p.monthly)}</span>
      <span class="font-extrabold" data-monthly="${p.monthly}" data-yearly="${p.yearly}">${money(p.monthly)}</span>
      <span class="badge badge-success" data-saving="${(p.monthly - p.yearly) * 12}">Save ${money((p.monthly - p.yearly) * 12)} / yr</span>
    </li>`).join('');
  el.outerHTML = `<ul class="pv-tile !py-1" aria-label="Yearly savings by plan">${rows}</ul>`;
});

const cell = (v) => {
  if (v === true) return `${icon('check', 'text-accent-text')}<span class="sr-only">Included</span>`;
  if (v === false) return `${icon('minus', 'text-muted')}<span class="sr-only">Not included</span>`;
  return v;
};

const renderCompare = () => $$('[data-component="compare"]').forEach((el) => {
  const head = allPlans.map((p) => `<th scope="col" class="${p.featured ? 'is-featured' : ''}">${p.name}</th>`).join('');
  const priceRow = `<tr><th scope="row">Price per month</th>${allPlans.map((p) => `<td data-label="${p.name}" class="${p.featured ? 'is-featured' : ''}">${p.monthly == null ? 'Custom' : `<b data-monthly="${p.monthly}" data-yearly="${p.yearly}">${money(p.monthly)}</b>`}</td>`).join('')}</tr>`;
  const body = compare.map((g) => `
    <tr class="group"><th scope="colgroup" colspan="5">${g.group}</th></tr>
    ${g.rows.map((r) => `<tr><th scope="row">${r.label}</th>${r.values.map((v, i) => `<td data-label="${allPlans[i].name}" class="${allPlans[i].featured ? 'is-featured' : ''}">${cell(v)}</td>`).join('')}</tr>`).join('')}`).join('');
  el.outerHTML = `<div class="compare-wrap"><table class="compare"><caption class="sr-only">Plan feature comparison</caption><thead><tr><th scope="col"><span class="sr-only">Feature</span></th>${head}</tr></thead><tbody>${priceRow}${body}</tbody></table></div>`;
});

const renderFaqs = () => $$('[data-component="faq-pricing"]').forEach((el) => {
  el.outerHTML = `<div class="faq-list">${pricingFaqs.map((f) => `<details class="faq"><summary>${f.q}${icon('chevronDown', 'chev')}</summary><p>${f.a}</p></details>`).join('')}</div>`;
});

// Billing toggle: one state for every price on the page.
const applyBilling = (yearly) => {
  state.yearly = yearly;
  $$('[data-monthly]').forEach((el) => { el.textContent = money(yearly ? +el.dataset.yearly : +el.dataset.monthly); });
  $$('[data-billing-toggle]').forEach((t) => { t.checked = yearly; });
  $$('[data-billing-label]').forEach((el) => el.classList.toggle('text-muted', el.dataset.billingLabel === (yearly ? 'monthly' : 'yearly')));
  $$('[data-billing-note]').forEach((el) => { el.textContent = yearly ? `Billed yearly — save ${Math.round(YEARLY_DISCOUNT * 100)}%` : 'Billed monthly'; });
  $$('[data-billing-state]').forEach((el) => { el.textContent = yearly ? 'yearly' : 'monthly'; });
  document.dispatchEvent(new CustomEvent('velora:billing', { detail: { yearly } }));
};

const initCalc = (root) => {
  const steps = root.dataset.calcSteps === 'all' ? allSteps : homeSteps;
  const range = $('[data-calc-range]', root);
  const yearlyBox = $('[data-calc-yearly]', root);
  const out = Object.fromEntries(['contacts', 'plan', 'price', 'emails', 'note', 'per', 'why', 'cta'].map((k) => [k, $(`[data-calc-${k}]`, root)]));
  range.max = String(steps.length - 1);
  const update = () => {
    const i = +range.value;
    const step = steps[i];
    const plan = allPlans[step.plan];
    const yearly = yearlyBox ? yearlyBox.checked : state.yearly;
    const custom = step.price == null;
    range.style.setProperty('--fill', `${(i / (steps.length - 1)) * 100}%`);
    range.setAttribute('aria-valuetext', `${num(step.contacts)}${step === steps[steps.length - 1] && custom ? '+' : ''} contacts`);
    out.contacts.textContent = num(step.contacts) + (custom && i === steps.length - 1 ? '+' : '');
    out.plan.textContent = plan.name;
    out.price.textContent = custom ? 'Custom' : money(yearly ? Math.round(step.price * (1 - YEARLY_DISCOUNT)) : step.price);
    if (out.per) out.per.hidden = custom;
    out.emails.textContent = step.plan >= 2 ? 'Unlimited' : num(step.contacts * 10);
    if (out.note) out.note.textContent = custom ? 'Quoted for your volume' : (yearly ? 'Billed yearly — 20% saved' : 'Billed monthly');
    if (out.why) out.why.textContent = plan.blurb;
    if (out.cta) { out.cta.href = url(plan.cta.href); out.cta.textContent = plan.cta.label; }
    $$('[data-plan-tile]', root).forEach((t) => t.classList.toggle('is-active', t.dataset.planTile === plan.id));
  };
  range.addEventListener('input', update);
  yearlyBox?.addEventListener('change', update);
  document.addEventListener('velora:billing', update);
  update();
};

export const initPricing = () => {
  renderPlans();
  renderSavings();
  renderCompare();
  renderFaqs();

  const toggles = $$('[data-billing-toggle]');
  toggles.forEach((t) => t.addEventListener('change', () => applyBilling(t.checked)));
  applyBilling(new URLSearchParams(location.search).get('billing') === 'yearly');

  $$('[data-calc]').forEach(initCalc);
};
