import { metrics, campaigns, contacts, automations, num, money, pct } from '../store.js';
import { pageHead, tabsBar, esc, icon, toast, $, hydrateIcons } from '../ui.js';
import { lineChart, barChart, donut, heatmap, hbars } from '../charts.js';

export const title = 'Analytics';
const TABS = [['engagement', 'Engagement'], ['audience', 'Audience'], ['revenue', 'Revenue'], ['deliverability', 'Deliverability']];

export const render = () => `
${pageHead('Analytics', 'Understand what works, then do more of it.', `<label class="sr-only" for="an-range">Date range</label><select class="select !w-auto" id="an-range"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option></select>`)}
${tabsBar('Analytics sections', TABS)}
${TABS.map(([k], i) => `<div id="panel-${k}" role="tabpanel" aria-labelledby="tab-${k}" tabindex="0" class="grid gap-4"${i ? ' hidden' : ''}></div>`).join('')}`;

const kpi = (label, value, note, good = true) => `<article class="kpi"><p class="pv-label">${label}</p><p class="kpi-num">${value}</p><p class="${good ? 'pv-up' : 'pv-down'}">${note}</p></article>`;
const panel = (title, body, cls = '') => `<section class="panel ${cls}"><div class="panel-head"><h2 class="h5">${title}</h2></div>${body}</section>`;

export const mount = (root) => {
  const sel = $('#an-range', root);
  const draw = () => {
    const m = metrics(+sel.value); const t = m.totals;
    // Engagement
    $('#panel-engagement', root).innerHTML = `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${kpi('Open rate', pct((t.opens / t.sent) * 100), '+2.4% vs previous')}${kpi('Click rate', pct((t.clicks / t.sent) * 100), '+1.1% vs previous')}${kpi('Click-to-open', pct((t.clicks / t.opens) * 100), '+0.6% vs previous')}${kpi('Bounce rate', '1.1%', '-0.2% vs previous')}</div>
      <div class="grid gap-4 xl:grid-cols-3">${panel('Opens and clicks', '<div id="an-eng"></div>', 'xl:col-span-2')}${panel('Conversion funnel', hbars([{ label: 'Delivered', value: t.sent }, { label: 'Opened', value: t.opens, display: `${num(t.opens)} · ${pct((t.opens / t.sent) * 100)}` }, { label: 'Clicked', value: t.clicks, display: `${num(t.clicks)} · ${pct((t.clicks / t.sent) * 100)}` }, { label: 'Purchased', value: Math.round(t.clicks * 0.18), display: num(Math.round(t.clicks * 0.18)) }]))}</div>
      <div class="grid gap-4 lg:grid-cols-2">${panel('Best time to send', heatmap())}${panel('Opens by device', donut([{ label: 'Mobile', value: 58, color: 'var(--v-primary)' }, { label: 'Desktop', value: 28, color: 'var(--v-accent)' }, { label: 'Tablet', value: 14, color: 'var(--v-border-strong)' }]))}</div>`;
    lineChart($('#an-eng', root), { labels: m.labels, aria: 'Opens and clicks over time', series: [{ name: 'Opens', color: 'var(--v-primary)', values: m.opens }, { name: 'Clicks', color: 'var(--v-accent)', values: m.clicks }] });
    // Audience
    const loc = Object.entries(contacts.reduce((a, c) => ((a[c.location] = (a[c.location] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
    $('#panel-audience', root).innerHTML = `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${kpi('Total contacts', num(contacts.length), `+${num(t.subs)} new`)}${kpi('Subscribed', num(contacts.filter((c) => c.status === 'Subscribed').length), '84% of audience')}${kpi('Unsubscribes', num(t.unsubs), 'Low churn')}${kpi('Avg. score', Math.round(contacts.reduce((a, c) => a + c.score, 0) / contacts.length), 'Healthy engagement')}</div>
      <div class="grid gap-4 xl:grid-cols-3">${panel('Subscriber growth', '<div id="an-subs"></div>', 'xl:col-span-2')}${panel('Where contacts come from', donut([{ label: 'Signup forms', value: 48, color: 'var(--v-primary)' }, { label: 'Imports', value: 22, color: 'var(--v-accent)' }, { label: 'Integrations', value: 18, color: '#9aacff' }, { label: 'Referrals', value: 12, color: 'var(--v-border-strong)' }]))}</div>
      ${panel('Top locations', hbars(loc))}`;
    lineChart($('#an-subs', root), { labels: m.labels, height: '13rem', aria: 'New subscribers and unsubscribes', series: [{ name: 'New subscribers', color: 'var(--v-primary)', values: m.subs }, { name: 'Unsubscribes', color: 'var(--v-danger)', values: m.unsubs }] });
    // Revenue
    const weeks = []; for (let i = 0; i < m.revenue.length; i += 7) weeks.push(m.revenue.slice(i, i + 7).reduce((a, b) => a + b, 0));
    const top = [...campaigns].filter((c) => c.revenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((c) => ({ label: c.name, value: c.revenue, display: money(c.revenue) }));
    $('#panel-revenue', root).innerHTML = `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${kpi('Revenue', money(t.revenue), '+12.6% vs previous')}${kpi('Revenue per email', `$${(t.revenue / t.sent).toFixed(2)}`, '+4.1%')}${kpi('Automation revenue', money(automations.reduce((a, x) => a + x.revenue, 0)), 'All journeys')}${kpi('Orders attributed', num(Math.round(t.clicks * 0.18)), '+8.0%')}</div>
      <div class="grid gap-4 xl:grid-cols-2">${panel('Revenue by week', '<div id="an-rev"></div>')}${panel('Top campaigns by revenue', hbars(top, { color: 'var(--v-accent)' }))}</div>`;
    barChart($('#an-rev', root), { labels: weeks.map((_, i) => `Wk ${i + 1}`).slice(0, 13), values: weeks.slice(0, 13), aria: 'Revenue by week', fmt: money });
    // Deliverability
    $('#panel-deliverability', root).innerHTML = `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${kpi('Delivery rate', '98.6%', '+0.3%')}${kpi('Inbox placement', '96.2%', 'Stable')}${kpi('Spam complaints', '0.03%', 'Below 0.1% limit')}${kpi('Hard bounces', '0.4%', '-0.1%')}</div>
      <div class="grid gap-4 lg:grid-cols-2">${panel('Authentication', `<ul class="grid gap-3">${['SPF', 'DKIM', 'DMARC'].map((k) => `<li class="flex items-center justify-between gap-3 rounded-lg border border-line p-3"><span class="font-bold">${k}</span><span class="badge badge-success badge-dot">Passing</span></li>`).join('')}</ul>`)}${panel('Sender reputation', hbars([{ label: 'Domain reputation', value: 94, display: 'High' }, { label: 'Engagement quality', value: 82, display: 'Good' }, { label: 'List hygiene', value: 88, display: 'Good' }], { color: 'var(--v-accent)' }))}</div>`;
    hydrateIcons(root);
  };
  sel.addEventListener('change', () => { draw(); toast(`Showing the last ${sel.value} days`, 'info'); });
  draw();
};
