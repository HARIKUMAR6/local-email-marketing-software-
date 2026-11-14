// Automation canvas for the Home 2 hero: nodes + animated connectors, drawn as one SVG.
import { icon } from './icons.js';
import { mount } from '../core/dom.js';

const NODES = [
  { x: 24,  y: 152, icon: 'userPlus', tone: 'primary', title: 'New subscriber', sub: 'Joins “Newsletter” list' },
  { x: 262, y: 152, icon: 'mail',     tone: 'primary', title: 'Welcome email',  sub: 'Instant · 68% opens' },
  { x: 500, y: 152, icon: 'split',    tone: 'accent',  title: 'Clicked offer?',  sub: 'Wait up to 2 days' },
  { x: 738, y: 40,  icon: 'sparkles', tone: 'primary', title: 'Send product tips', sub: 'Segment: Engaged' },
  { x: 738, y: 264, icon: 'repeat',   tone: 'accent',  title: 'Nurture series',    sub: 'Weekly · 3 emails' },
];
const W = 190;
const H = 76;

const node = (n) => `
  <g>
    <rect x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="16" class="fill-surface stroke-line" stroke-width="1.5"/>
    <circle cx="${n.x + 34}" cy="${n.y + H / 2}" r="19" class="${n.tone === 'accent' ? 'fill-accent-soft' : 'fill-primary-soft'}"/>
    ${icon(n.icon, n.tone === 'accent' ? 'text-accent-text' : 'text-primary').replace('<svg ', `<svg x="${n.x + 24}" y="${n.y + H / 2 - 10}" width="20" height="20" `)}
    <text x="${n.x + 62}" y="${n.y + 32}" class="fill-fg" font-size="14" font-weight="700">${n.title}</text>
    <text x="${n.x + 62}" y="${n.y + 51}" class="fill-muted" font-size="11.5" font-weight="500">${n.sub}</text>
  </g>`;

const pill = (x, y, label, tone) => `
  <g>
    <rect x="${x}" y="${y}" width="46" height="24" rx="12" class="${tone}"/>
    <text x="${x + 23}" y="${y + 16}" text-anchor="middle" class="fill-fg" font-size="11.5" font-weight="700">${label}</text>
  </g>`;

export const workflowCanvas = () => `
<svg viewBox="0 0 960 380" class="hidden md:block w-full h-auto" aria-hidden="true" focusable="false">
  <g fill="none" class="stroke-primary" stroke-width="2" stroke-linecap="round">
    <path class="flow-path" d="M214 190H262"/>
    <path class="flow-path" d="M452 190H500"/>
    <path class="flow-path" d="M690 190C716 190 712 78 738 78"/>
    <path class="flow-path" d="M690 190C716 190 712 302 738 302"/>
  </g>
  ${NODES.map(node).join('')}
  ${pill(706, 112, 'Yes', 'fill-primary-soft')}
  ${pill(706, 246, 'No', 'fill-accent-soft')}
  <g>
    <rect x="262" y="60" width="132" height="34" rx="17" class="fill-surface stroke-line" stroke-width="1.5"/>
    <circle cx="282" cy="77" r="5" class="fill-success"/>
    <text x="296" y="82" class="fill-fg" font-size="12.5" font-weight="700">Live · 1,284 in flow</text>
  </g>
  <g>
    <rect x="500" y="304" width="150" height="34" rx="17" class="fill-surface stroke-line" stroke-width="1.5"/>
    <text x="575" y="326" text-anchor="middle" class="fill-fg" font-size="12.5" font-weight="700">+18% revenue per send</text>
  </g>
</svg>`;

export const initWorkflow = () => mount('workflow-canvas', workflowCanvas());
