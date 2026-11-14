import { campaigns, contacts, activity, metrics, num, money, pct, user, lists } from '../store.js';
import { pageHead, esc, badge, icon } from '../ui.js';
import { lineChart, spark, donut } from '../charts.js';

export const title = 'Overview';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export const render = () => `
${pageHead(`${greeting()}, ${esc(user.name.split(' ')[0])}`, 'Here is how your campaigns and audience are performing.',
  `<label class="sr-only" for="ov-range">Date range</label><select class="select !w-auto" id="ov-range"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option></select>
   <button class="btn btn-primary" type="button" data-new-campaign>${icon('plus')}New campaign</button>`)}
<div id="ov-kpis" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-live="polite"></div>
<div class="grid gap-4 xl:grid-cols-3">
  <section class="panel xl:col-span-2" aria-labelledby="ov-eng"><div class="panel-head"><div><h2 class="h5" id="ov-eng">Engagement</h2><p class="caption">Emails sent, opened and clicked</p></div></div><div id="ov-chart"></div></section>
  <section class="panel" aria-labelledby="ov-aud"><div class="panel-head"><div><h2 class="h5" id="ov-aud">Audience growth</h2><p class="caption" id="ov-aud-sub"></p></div></div><div id="ov-growth"></div></section>
</div>
<div class="grid gap-4 xl:grid-cols-3">
  <section class="panel xl:col-span-2" aria-labelledby="ov-camp"><div class="panel-head"><div><h2 class="h5" id="ov-camp">Campaign performance</h2><p class="caption">Your best recent sends by open rate</p></div><a class="btn btn-ghost btn-sm" href="#/campaigns">View all</a></div><div class="tbl-wrap" tabindex="0" role="region" aria-label="Top campaigns"><table class="tbl" id="ov-table"></table></div></section>
  <div class="grid content-start gap-4">
    <section class="panel" aria-labelledby="ov-lists"><div class="panel-head"><h2 class="h5" id="ov-lists">Audience by list</h2></div><div id="ov-donut"></div></section>
    <section class="panel" aria-labelledby="ov-act"><div class="panel-head"><h2 class="h5" id="ov-act">Recent activity</h2></div>
      <ol class="grid gap-3" aria-label="Recent activity">${activity.map((a) => `<li class="flex gap-3"><span class="icon-tile !h-9 !w-9 shrink-0">${icon(a.icon)}</span><div class="min-w-0"><p class="text-small">${esc(a.text)}</p><p class="caption">${esc(a.time)}</p></div></li>`).join('')}</ol></section>
  </div>
</div>`;

const deltas = [8.2, 2.4, 1.1, 12.6, 5.3, -0.4];

export const mount = (root) => {
  const sel = root.querySelector('#ov-range');
  const draw = () => {
    const m = metrics(+sel.value); const t = m.totals;
    const cards = [
      ['Emails sent', num(t.sent), m.sent, 'send', deltas[0], 'var(--v-primary)'],
      ['Open rate', pct((t.opens / t.sent) * 100), m.opens.map((o, i) => o / m.sent[i]), 'eye', deltas[1], 'var(--v-accent)'],
      ['Click rate', pct((t.clicks / t.sent) * 100), m.clicks.map((c, i) => c / m.sent[i]), 'cursor', deltas[2], 'var(--v-primary)'],
      ['Revenue', money(t.revenue), m.revenue, 'dollar', deltas[3], 'var(--v-accent)'],
      ['New subscribers', num(t.subs), m.subs, 'userPlus', deltas[4], 'var(--v-primary)'],
      ['Unsubscribe rate', pct((t.unsubs / t.sent) * 100, 2), m.unsubs, 'minus', deltas[5], 'var(--v-danger)'],
    ];
    root.querySelector('#ov-kpis').innerHTML = cards.map(([label, value, series, ico, d, color]) => {
      const good = label === 'Unsubscribe rate' ? d <= 0 : d >= 0;
      return `<article class="kpi"><div class="flex items-center justify-between gap-2"><p class="pv-label">${label}</p><span class="icon-tile !h-8 !w-8">${icon(ico)}</span></div><p class="kpi-num">${value}</p><div class="flex items-end justify-between gap-3"><span class="${good ? 'pv-up' : 'pv-down'}">${d >= 0 ? '+' : ''}${d}% <span class="font-medium text-muted">vs previous</span></span><span class="w-20">${spark(series, color)}</span></div></article>`;
    }).join('');
    lineChart(root.querySelector('#ov-chart'), { labels: m.labels, aria: `Engagement over the last ${sel.value} days`, series: [{ name: 'Sent', color: 'var(--v-border-strong)', values: m.sent }, { name: 'Opened', color: 'var(--v-primary)', values: m.opens }, { name: 'Clicked', color: 'var(--v-accent)', values: m.clicks }] });
    let run = contacts.length - t.subs; const growth = m.subs.map((s) => (run += s));
    root.querySelector('#ov-aud-sub').textContent = `${num(contacts.length)} contacts · +${num(t.subs)} in this period`;
    lineChart(root.querySelector('#ov-growth'), { labels: m.labels, height: '12rem', aria: 'Total contacts over time', series: [{ name: 'Contacts', color: 'var(--v-primary)', values: growth }] });
  };
  sel.addEventListener('change', draw);
  draw();
  const top = campaigns.filter((c) => c.sent).map((c) => ({ ...c, rate: (c.opens / c.sent) * 100 })).sort((a, b) => b.rate - a.rate).slice(0, 6);
  root.querySelector('#ov-table').innerHTML = `<thead><tr><th scope="col">Campaign</th><th scope="col">Status</th><th scope="col" class="text-end">Sent</th><th scope="col" class="text-end">Opens</th><th scope="col" class="text-end">Clicks</th><th scope="col" class="text-end">Revenue</th></tr></thead><tbody>${top.map((c) => `<tr><td class="font-semibold">${esc(c.name)}</td><td>${badge(c.status)}</td><td class="text-end">${num(c.sent)}</td><td class="text-end">${pct(c.rate)}</td><td class="text-end">${pct((c.clicks / c.sent) * 100)}</td><td class="text-end">${money(c.revenue)}</td></tr>`).join('')}</tbody>`;
  const colors = ['var(--v-primary)', 'var(--v-accent)', '#9aacff', '#6de0d3', 'var(--v-border-strong)'];
  root.querySelector('#ov-donut').innerHTML = donut(lists.map((l, i) => ({ label: l.name, value: contacts.filter((c) => c.list === l.id).length, color: colors[i] })), { center: `<b class="text-xl font-extrabold leading-none">${num(contacts.length)}</b><span class="caption">contacts</span>` });
};
