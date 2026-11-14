// In-memory workspace data for the dashboard. Everything here lives in the page only:
// changes made in the UI last for the current visit and are not saved to a server.
import { currentUser } from '../core/session.js';
import { plans } from '../config/pricing.js';

/* ---------- helpers ---------- */
const mulberry = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rnd = mulberry(20260);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const between = (a, b) => Math.round(a + rnd() * (b - a));
export const DAY = 86400000;
export const daysAgo = (n) => new Date(Date.now() - n * DAY);
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtShort = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const num = (n) => Math.round(n).toLocaleString('en-US');
export const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
export const pct = (n, d = 1) => `${n.toFixed(d)}%`;
let uid = 1000;
export const nextId = (p) => `${p}${++uid}`;

/* ---------- user, workspaces, plan ---------- */
export const user = currentUser();
export const workspaces = [
  { id: 'w1', name: user.workspace || 'Alder & Co.', role: 'Owner' },
  { id: 'w2', name: 'Alder Studio', role: 'Admin' },
  { id: 'w3', name: 'Northwind Outdoors', role: 'Editor' },
];
export const session = { workspace: workspaces[0], plan: plans[1] };

/* ---------- lists ---------- */
export const lists = [
  { id: 'l1', name: 'Newsletter subscribers', desc: 'People who signed up through website forms', growth: 6.4 },
  { id: 'l2', name: 'Customers', desc: 'Contacts with at least one order', growth: 3.1 },
  { id: 'l3', name: 'VIP members', desc: 'Top customers and early-access guests', growth: 9.8 },
  { id: 'l4', name: 'Trial users', desc: 'Contacts currently in a 14-day trial', growth: -1.2 },
  { id: 'l5', name: 'Webinar attendees', desc: 'Registered for or watched a webinar', growth: 4.5 },
];

/* ---------- contacts (320) ---------- */
const FIRST = ['Amara', 'Priya', 'Jonas', 'Lena', 'Mateo', 'Aisha', 'Noah', 'Mei', 'Omar', 'Sofia', 'Kenji', 'Ines', 'Liam', 'Zara', 'Ravi', 'Elena', 'Tariq', 'Hana', 'Diego', 'Fatima', 'Oliver', 'Nia', 'Arjun', 'Chloe'];
const LAST = ['Mensah', 'Shah', 'Keller', 'Novak', 'Rivera', 'Khan', 'Bennett', 'Chen', 'Haddad', 'Rossi', 'Tanaka', 'Duarte', 'Murphy', 'Ali', 'Nair', 'Petrov', 'Aziz', 'Sato', 'Lopez', 'Hassan', 'Walker', 'Okafor', 'Menon', 'Dubois'];
const DOMAINS = ['northwind.co', 'brightlane.io', 'fieldnotes.com', 'cedarworks.net', 'mapleandco.com', 'harborsoft.io', 'lumenlabs.co', 'oakstreet.org'];
const PLACES = ['Chennai, IN', 'London, UK', 'Austin, US', 'Berlin, DE', 'Toronto, CA', 'Singapore, SG', 'Sydney, AU', 'Lagos, NG'];
const TAGS = ['VIP', 'Customer', 'Lead', 'Newsletter', 'Webinar', 'Trial'];
const STATUS = ['Subscribed', 'Subscribed', 'Subscribed', 'Subscribed', 'Subscribed', 'Pending', 'Unsubscribed', 'Cleaned'];
export const contacts = Array.from({ length: 320 }, (_, i) => {
  const first = FIRST[i % FIRST.length]; const last = LAST[(i * 7 + Math.floor(i / 24)) % LAST.length];
  const status = pick(STATUS);
  const n = between(1, 3); const tags = [...new Set(Array.from({ length: n }, () => pick(TAGS)))];
  return {
    id: `c${i + 1}`, name: `${first} ${last}`, email: `${first}.${last}${i > 70 ? i : ''}@${pick(DOMAINS)}`.toLowerCase(),
    status, tags, list: pick(lists).id, location: pick(PLACES), score: between(18, 99), opens: between(0, 48), added: daysAgo(between(2, 380)),
  };
});

/* ---------- campaigns ---------- */
const listCount = (id) => contacts.filter((c) => c.list === id && c.status === 'Subscribed').length;
const CAMPS = [
  ['Spring collection launch', 'Sent', 'l1'], ['Weekend flash offer', 'Scheduled', 'l2'], ['Customer thank-you', 'Draft', 'l2'], ['Product update — June', 'Sent', 'l1'],
  ['Welcome series · Email 1', 'Sent', 'l4'], ['Back-in-stock alerts', 'Sent', 'l1'], ['Loyalty rewards', 'Sending', 'l3'], ['Webinar invitation', 'Scheduled', 'l5'],
  ['Holiday gift guide', 'Sent', 'l2'], ['Re-engagement: we miss you', 'Sent', 'l1'], ['Free shipping week', 'Sent', 'l2'], ['New feature announcement', 'Draft', 'l4'],
  ['Summer survey', 'Sent', 'l5'], ['Referral programme', 'Draft', 'l3'],
];
export const campaigns = CAMPS.map(([name, status, list], i) => {
  const audience = listCount(list); const sent = ['Sent', 'Sending'].includes(status) ? Math.round(audience * (0.96 + rnd() * 0.035)) : 0;
  const opens = Math.round(sent * (0.34 + rnd() * 0.28)); const clicks = Math.round(opens * (0.18 + rnd() * 0.2));
  return {
    id: `m${i + 1}`, name, subject: `${name} — don’t miss it`, status, list, audience, sent, opens, clicks,
    revenue: status === 'Sent' ? Math.round(clicks * (14 + rnd() * 30)) : 0, type: i % 4 === 0 ? 'Automated' : 'Regular',
    date: status === 'Scheduled' ? new Date(Date.now() + between(1, 9) * DAY) : status === 'Draft' ? daysAgo(between(0, 4)) : daysAgo(between(1, 85)),
  };
});

/* ---------- segments ---------- */
export const FIELDS = {
  tag: { label: 'Tag', ops: ['is', 'is not'], values: TAGS },
  location: { label: 'Location', ops: ['is', 'is not'], values: PLACES },
  status: { label: 'Status', ops: ['is', 'is not'], values: ['Subscribed', 'Pending', 'Unsubscribed', 'Cleaned'] },
  list: { label: 'List', ops: ['is', 'is not'], values: lists.map((l) => l.id), labels: Object.fromEntries(lists.map((l) => [l.id, l.name])) },
  score: { label: 'Engagement score', ops: ['greater than', 'less than'], number: true },
  opens: { label: 'Emails opened', ops: ['greater than', 'less than'], number: true },
};
export const ruleMatch = (c, r) => {
  const v = r.field === 'tag' ? c.tags : c[r.field];
  const has = r.field === 'tag' ? v.includes(r.value) : String(v) === String(r.value);
  if (r.op === 'is') return has; if (r.op === 'is not') return !has;
  return r.op === 'greater than' ? Number(v) > Number(r.value) : Number(v) < Number(r.value);
};
export const segmentCount = (rules, mode = 'all') => contacts.filter((c) => (mode === 'all' ? rules.every((r) => ruleMatch(c, r)) : rules.some((r) => ruleMatch(c, r)))).length;
export const segments = [
  { id: 's1', name: 'High-intent buyers', mode: 'all', rules: [{ field: 'score', op: 'greater than', value: 70 }, { field: 'status', op: 'is', value: 'Subscribed' }] },
  { id: 's2', name: 'VIP in Europe', mode: 'all', rules: [{ field: 'tag', op: 'is', value: 'VIP' }, { field: 'location', op: 'is', value: 'London, UK' }] },
  { id: 's3', name: 'Needs a nudge', mode: 'all', rules: [{ field: 'opens', op: 'less than', value: 5 }, { field: 'status', op: 'is', value: 'Subscribed' }] },
  { id: 's4', name: 'Trial leads', mode: 'any', rules: [{ field: 'tag', op: 'is', value: 'Trial' }, { field: 'tag', op: 'is', value: 'Lead' }] },
];

/* ---------- automations ---------- */
const flow = (...s) => s.map(([type, title, sub]) => ({ type, title, sub }));
export const automations = [
  { id: 'a1', name: 'Welcome series', trigger: 'Joins Newsletter subscribers', status: 'Active', enrolled: 1284, completed: 1012, revenue: 4820, steps: flow(['trigger', 'Subscriber joins', 'Newsletter subscribers'], ['email', 'Welcome email', 'Sent instantly'], ['wait', 'Wait 2 days', 'Pause'], ['condition', 'Opened the email?', 'Yes → offer · No → reminder'], ['email', 'First-order offer', '10% welcome code'], ['goal', 'Goal', 'Purchase completed']) },
  { id: 'a2', name: 'Abandoned cart', trigger: 'Cart left for 1 hour', status: 'Active', enrolled: 642, completed: 488, revenue: 9150, steps: flow(['trigger', 'Cart abandoned', 'After 1 hour'], ['email', 'Reminder with items', 'Cart contents'], ['wait', 'Wait 1 day', 'Skip if purchased'], ['email', 'Incentive', '10% single-use code'], ['goal', 'Goal', 'Order placed']) },
  { id: 'a3', name: 'Win-back', trigger: '90 days inactive', status: 'Paused', enrolled: 318, completed: 201, revenue: 1760, steps: flow(['trigger', 'Inactive 90 days', 'No opens'], ['email', 'We miss you', 'Best recent content'], ['condition', 'Clicked?', 'Yes → keep · No → sunset'], ['goal', 'Goal', 'Re-engaged']) },
  { id: 'a4', name: 'Post-purchase follow-up', trigger: 'Order completed', status: 'Active', enrolled: 905, completed: 774, revenue: 3240, steps: flow(['trigger', 'Order placed', 'Any order'], ['email', 'Thank you + receipt', 'Instant'], ['wait', 'Wait 7 days', 'Delivery time'], ['email', 'Review request', 'Product link'], ['goal', 'Goal', 'Review submitted']) },
  { id: 'a5', name: 'Webinar reminders', trigger: 'Registers for webinar', status: 'Draft', enrolled: 0, completed: 0, revenue: 0, steps: flow(['trigger', 'Registration', 'Webinar form'], ['email', 'Confirmation', 'Calendar invite'], ['wait', 'Wait until 1 day before', 'Reminder'], ['email', 'Starting soon', '1 hour before']) },
];

/* ---------- templates ---------- */
export const templates = [
  ['Monthly newsletter', 'Newsletter', 'hero'], ['Product launch', 'Promotion', 'circle'], ['Flash sale', 'Promotion', 'sale'], ['Welcome aboard', 'Welcome', 'split'],
  ['Order receipt', 'Transactional', 'receipt'], ['Webinar invitation', 'Event', 'date'], ['Customer story', 'Newsletter', 'hero'], ['Back in stock', 'Promotion', 'circle'],
  ['Shipping update', 'Transactional', 'receipt'], ['Annual summit', 'Event', 'date'], ['Thanks for joining', 'Welcome', 'split'], ['Holiday offer', 'Promotion', 'sale'],
].map(([name, category, layout], i) => ({ id: `t${i + 1}`, name, category, layout, star: i % 5 === 0 }));

/* ---------- reports ---------- */
export const reports = [
  { id: 'r1', name: 'Monthly performance summary', type: 'Performance', range: 'Last 30 days', format: 'CSV', status: 'Ready', created: daysAgo(2), schedule: 'Monthly' },
  { id: 'r2', name: 'Audience growth', type: 'Audience', range: 'Last 90 days', format: 'CSV', status: 'Ready', created: daysAgo(6), schedule: 'Weekly' },
  { id: 'r3', name: 'Revenue by campaign', type: 'Revenue', range: 'Last 30 days', format: 'JSON', status: 'Ready', created: daysAgo(9), schedule: 'Off' },
  { id: 'r4', name: 'Deliverability health', type: 'Deliverability', range: 'Last 7 days', format: 'CSV', status: 'Ready', created: daysAgo(14), schedule: 'Weekly' },
];

/* ---------- team, activity, notifications ---------- */
export const team = [
  { id: 'u1', name: user.name, email: user.email, role: 'Owner', status: 'Active' },
  { id: 'u2', name: 'Priya Shah', email: 'priya.shah@alderandco.com', role: 'Admin', status: 'Active' },
  { id: 'u3', name: 'Jonas Keller', email: 'jonas.keller@alderandco.com', role: 'Editor', status: 'Active' },
  { id: 'u4', name: 'Lena Novak', email: 'lena.novak@alderandco.com', role: 'Viewer', status: 'Invited' },
];
export const activity = [
  { icon: 'send', text: '“Spring collection launch” finished sending to 214 contacts', time: '12 min ago' },
  { icon: 'userPlus', text: '38 new subscribers joined Newsletter subscribers', time: '1 hour ago' },
  { icon: 'workflow', text: 'Abandoned cart recovered 6 orders worth $412', time: '3 hours ago' },
  { icon: 'shieldCheck', text: 'Sending domain check passed for alderandco.com', time: 'Yesterday' },
  { icon: 'edit', text: 'Priya Shah edited “Weekend flash offer”', time: 'Yesterday' },
  { icon: 'download', text: 'Report “Monthly performance summary” is ready', time: '2 days ago' },
];
export const notifications = [
  { id: 'n1', title: 'Campaign sent', body: '“Spring collection launch” reached 214 contacts.', time: '12 min ago', unread: true },
  { id: 'n2', title: 'Automation paused', body: 'Win-back needs attention: 3 emails failed review.', time: '2 hours ago', unread: true },
  { id: 'n3', title: 'Report ready', body: 'Monthly performance summary is ready to download.', time: 'Yesterday', unread: false },
  { id: 'n4', title: 'Team invite sent', body: 'Lena Novak was invited as a Viewer.', time: '2 days ago', unread: false },
];

/* ---------- time series ---------- */
const wave = (n, base, amp, seed, trend = 0) => { const r = mulberry(seed); return Array.from({ length: n }, (_, i) => Math.max(0, base + trend * i + Math.sin((i / 7) * Math.PI * 2 + seed) * amp + (r() - 0.5) * amp)); };
export const metrics = (range) => {
  const n = range;
  const sent = wave(n, 130, 55, 3, 0.1).map(Math.round);
  const opens = sent.map((s, i) => Math.round(s * (0.42 + 0.06 * Math.sin(i / 3 + 1))));
  const clicks = opens.map((o, i) => Math.round(o * (0.22 + 0.03 * Math.cos(i / 4))));
  const revenue = clicks.map((c, i) => Math.round(c * (16 + 5 * Math.sin(i / 5))));
  const subs = wave(n, 6, 4, 9, 0.02).map(Math.round);
  const unsubs = subs.map((s) => Math.max(0, Math.round(s * 0.12)));
  const labels = Array.from({ length: n }, (_, i) => fmtShort(daysAgo(n - 1 - i)));
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  return { labels, sent, opens, clicks, revenue, subs, unsubs, totals: { sent: sum(sent), opens: sum(opens), clicks: sum(clicks), revenue: sum(revenue), subs: sum(subs), unsubs: sum(unsubs) } };
};

export const builderTemplates = {
  hero: [{ type: 'header' }, { type: 'hero' }, { type: 'text' }, { type: 'button' }, { type: 'footer' }],
  circle: [{ type: 'header' }, { type: 'heading' }, { type: 'image' }, { type: 'text' }, { type: 'button' }, { type: 'footer' }],
  sale: [{ type: 'header' }, { type: 'hero', title: '30% off this weekend', sub: 'Our biggest offer of the season.', cta: 'Shop the sale', bg: 'navy' }, { type: 'columns' }, { type: 'footer' }],
  split: [{ type: 'header' }, { type: 'heading', text: 'Welcome aboard' }, { type: 'text' }, { type: 'divider' }, { type: 'button', label: 'Get started' }, { type: 'footer' }],
  receipt: [{ type: 'header' }, { type: 'heading', text: 'Thanks for your order' }, { type: 'columns' }, { type: 'text' }, { type: 'footer' }],
  date: [{ type: 'header' }, { type: 'hero', title: 'You are invited', sub: 'Join us on 14 June at 10:00 IST.', cta: 'Save my seat', bg: 'aqua' }, { type: 'text' }, { type: 'footer' }],
};
