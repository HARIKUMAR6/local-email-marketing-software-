// Dependency-free SVG/HTML charts with accessible labels and hover/keyboard tooltips.
import { $ } from '../core/dom.js';
import { esc } from './ui.js';

const nf = (v) => Math.round(v).toLocaleString('en-US');

/** Multi-series line chart. series: [{ name, color, values, fmt? }] */
export const lineChart = (el, { labels, series, height = '15rem', fmt = nf, aria = 'Line chart', area = true }) => {
  const n = labels.length;
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.12;
  const X = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const Y = (v) => 96 - (v / max) * 90;
  const d = (s) => s.values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(2)} ${Y(v).toFixed(2)}`).join('');
  const grid = [0, 25, 50, 75, 100].map((p) => `<path d="M0 ${p}H100" class="chart-grid"/>`).join('');
  const shapes = series.map((s) => `${area ? `<path d="${d(s)}L100 100L0 100Z" style="fill:${s.color};opacity:.1"/>` : ''}<path d="${d(s)}" class="chart-line" style="stroke:${s.color}"/>`).join('');
  const xl = [0, Math.floor((n - 1) / 2), n - 1].map((i) => `<span>${esc(labels[i])}</span>`).join('');
  el.innerHTML = `<div class="chart" style="--ch:${height}" tabindex="0" role="img" aria-label="${esc(aria)}">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${grid}${shapes}</svg>
    <span class="chart-guide" hidden></span><div class="chart-tip" hidden></div>
    <div class="chart-y" aria-hidden="true"><span>${fmt(max)}</span><span>${fmt(max / 2)}</span><span>0</span></div>
    <div class="chart-x" aria-hidden="true">${xl}</div></div>
    <ul class="legend">${series.map((s) => `<li><i style="background:${s.color}"></i>${esc(s.name)}</li>`).join('')}</ul>`;
  const box = $('.chart', el); const tip = $('.chart-tip', el); const guide = $('.chart-guide', el);
  const show = (i) => {
    i = Math.max(0, Math.min(n - 1, i));
    const x = X(i);
    tip.hidden = false; guide.hidden = false;
    guide.style.insetInlineStart = `${x}%`;
    tip.style.insetInlineStart = `${Math.min(78, Math.max(2, x - 10))}%`;
    tip.innerHTML = `<b>${esc(labels[i])}</b>${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)} <b>${(s.fmt || fmt)(s.values[i])}</b></span>`).join('')}`;
    box.dataset.i = i;
  };
  const hide = () => { tip.hidden = true; guide.hidden = true; };
  box.addEventListener('pointermove', (e) => {
    const r = box.getBoundingClientRect(); let f = (e.clientX - r.left) / r.width;
    if (document.documentElement.dir === 'rtl') f = 1 - f;
    show(Math.round(f * (n - 1)));
  });
  box.addEventListener('pointerleave', hide);
  box.addEventListener('blur', hide);
  box.addEventListener('keydown', (e) => {
    const rtl = document.documentElement.dir === 'rtl' ? -1 : 1;
    const i = +(box.dataset.i ?? -1);
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + rtl); } else if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - rtl); } else if (e.key === 'Escape') hide();
  });
};

/** Vertical bar chart (HTML). */
export const barChart = (el, { labels, values, color = 'var(--v-primary)', height = '12rem', fmt = nf, aria = 'Bar chart', highlight = true }) => {
  const max = Math.max(1, ...values); const top = values.indexOf(Math.max(...values));
  el.innerHTML = `<div class="bars" style="--ch:${height}" role="img" aria-label="${esc(aria)}">${values.map((v, i) => `<div class="bar-col" title="${esc(labels[i])}: ${fmt(v)}"><i style="height:${Math.max(3, (v / max) * 100)}%;background:${highlight && i === top ? 'var(--v-accent)' : color}"></i><span>${esc(labels[i])}</span></div>`).join('')}</div>`;
};

/** Donut chart as an HTML string. parts: [{ label, value, color }] */
export const donut = (parts, { size = 'h-36 w-36', center = '' } = {}) => {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1; let off = 0;
  const arcs = parts.map((p) => { const len = (p.value / total) * 100; const a = `<circle cx="18" cy="18" r="14" fill="none" stroke-width="5" pathLength="100" stroke-dasharray="${len} ${100 - len}" stroke-dashoffset="${-off}" style="stroke:${p.color}"/>`; off += len; return a; }).join('');
  return `<div class="flex flex-wrap items-center gap-5"><div class="relative ${size} shrink-0"><svg viewBox="0 0 36 36" class="h-full w-full -rotate-90" role="img" aria-label="${esc(parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', '))}"><circle cx="18" cy="18" r="14" fill="none" stroke-width="5" class="stroke-surface-2"/>${arcs}</svg>${center ? `<div class="absolute inset-0 grid place-content-center text-center">${center}</div>` : ''}</div>
    <ul class="legend grid gap-1.5 text-small font-semibold">${parts.map((p) => `<li><i style="background:${p.color}"></i>${esc(p.label)} <span class="text-muted font-medium">${Math.round((p.value / total) * 100)}%</span></li>`).join('')}</ul></div>`;
};

/** Tiny sparkline path as an HTML string. */
export const spark = (raw, color = 'var(--v-primary)') => {
  const step = Math.max(1, Math.ceil(raw.length / 14));
  const values = Array.from({ length: Math.ceil(raw.length / step) }, (_, i) => { const part = raw.slice(i * step, i * step + step); return part.reduce((a, b) => a + b, 0) / part.length; });
  const min = Math.min(...values); const max = Math.max(...values) || 1; const n = values.length;
  const pts = values.map((v, i) => `${i ? 'L' : 'M'}${((i / (n - 1)) * 100).toFixed(1)} ${(22 - ((v - min) / (max - min || 1)) * 20).toFixed(1)}`).join('');
  return `<svg viewBox="0 0 100 24" preserveAspectRatio="none" class="spark" aria-hidden="true"><path d="${pts}" fill="none" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" style="stroke:${color}"/></svg>`;
};

/** Send-time heatmap (HTML string). */
export const heatmap = (rows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm']) => {
  const cells = rows.map((r, ri) => `<div class="heat-row"><span>${r}</span>${hours.map((_, hi) => { const v = Math.max(0.1, 1 - Math.abs(hi - 1.4) * 0.28 - ri * 0.06 + (hi === 4 ? 0.12 : 0)); return `<i style="opacity:${v.toFixed(2)}"></i>`; }).join('')}</div>`).join('');
  return `<div class="heatmap" role="img" aria-label="Opens peak on weekday mornings and early evenings">${cells}<div class="heat-row"><span></span>${hours.map((h) => `<b>${h}</b>`).join('')}</div></div>`;
};

/** Horizontal progress rows: items [{ label, value, display }] */
export const hbars = (items, { color = 'var(--v-primary)' } = {}) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  return `<ul class="grid gap-3">${items.map((i) => `<li><div class="mb-1 flex justify-between text-small font-semibold"><span>${esc(i.label)}</span><span>${esc(i.display ?? nf(i.value))}</span></div><span class="pv-track block"><i class="pv-fill" style="width:${(i.value / max) * 100}%;background:${color}"></i></span></li>`).join('')}</ul>`;
};
