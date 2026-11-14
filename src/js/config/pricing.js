// Central pricing data (showcase only — no checkout). Edit prices, limits, features and FAQs here;
// the homepages, pricing page, calculator and comparison table all read from this file.

export const YEARLY_DISCOUNT = 0.2; // yearly prices are 20% lower

export const plans = [
  {
    id: 'starter', name: 'Starter', monthly: 19, yearly: 15, contacts: '2,500', emails: '10,000', featured: false,
    blurb: 'For founders sending their first campaigns.',
    features: ['10,000 emails / month', 'Drag-and-drop builder', '40+ responsive templates', 'Basic segments', 'Core analytics'],
    cta: { label: 'Get Started', href: 'signup.html' },
  },
  {
    id: 'growth', name: 'Growth', monthly: 59, yearly: 47, contacts: '25,000', emails: '250,000', featured: true,
    blurb: 'For teams running campaigns and automation together.',
    features: ['250,000 emails / month', 'Visual automation workflows', 'Advanced segmentation', 'A/B and send-time testing', 'Revenue reports & exports'],
    cta: { label: 'Get Started', href: 'signup.html' },
  },
  {
    id: 'professional', name: 'Professional', monthly: 149, yearly: 119, contacts: '100,000', emails: 'Unlimited', featured: false,
    blurb: 'For high-volume senders who need control.',
    features: ['Unlimited emails', 'Dedicated sending domain', 'Custom roles & approvals', 'Priority support', 'Full API and webhooks'],
    cta: { label: 'Get Started', href: 'signup.html' },
  },
  {
    id: 'enterprise', name: 'Enterprise', monthly: null, yearly: null, contacts: '100,000+', emails: 'Unlimited', featured: false,
    blurb: 'For organisations with advanced security and scale needs.',
    features: ['Custom volume and pricing', 'Single sign-on and audit logs', 'Dedicated success manager', '99.9% uptime SLA', 'Onboarding and migration'],
    cta: { label: 'Contact sales', href: 'contact.html?topic=enterprise' },
  },
];

/** Contact-volume steps for the calculator (monthly USD; price null = custom quote). */
export const volumeSteps = [
  { contacts: 1000, plan: 0, price: 19 },
  { contacts: 2500, plan: 0, price: 29 },
  { contacts: 5000, plan: 1, price: 59 },
  { contacts: 10000, plan: 1, price: 79 },
  { contacts: 25000, plan: 1, price: 119 },
  { contacts: 50000, plan: 2, price: 149 },
  { contacts: 100000, plan: 2, price: 249 },
  { contacts: 250000, plan: 3, price: null },
  { contacts: 500000, plan: 3, price: null },
];

const Y = true; const N = false;
/** Feature comparison rows. Values per plan in order: Starter, Growth, Professional, Enterprise. */
export const compare = [
  { group: 'Volume', rows: [
    { label: 'Contacts included', values: ['2,500', '25,000', '100,000', '100,000+'] },
    { label: 'Emails per month', values: ['10,000', '250,000', 'Unlimited', 'Unlimited'] },
    { label: 'Team members', values: ['2', '5', '15', 'Unlimited'] },
  ] },
  { group: 'Campaigns', rows: [
    { label: 'Drag-and-drop email builder', values: [Y, Y, Y, Y] },
    { label: 'Template library', values: ['40+', '100+', '100+', 'Custom + 100+'] },
    { label: 'A/B and send-time testing', values: [N, Y, Y, Y] },
    { label: 'Approval workflows', values: [N, N, Y, Y] },
  ] },
  { group: 'Audience and automation', rows: [
    { label: 'Contact segmentation', values: ['Basic', 'Advanced', 'Advanced', 'Advanced'] },
    { label: 'Automation journeys', values: [N, Y, Y, Y] },
    { label: 'Branching and goals', values: [N, Y, Y, Y] },
    { label: 'Integrations', values: ['5', '25', 'All', 'All + custom'] },
    { label: 'API and webhooks', values: [N, N, Y, Y] },
  ] },
  { group: 'Analytics and support', rows: [
    { label: 'Reports and exports', values: ['Core', 'Revenue', 'Revenue', 'Custom'] },
    { label: 'Support', values: ['Email', 'Email + chat', 'Priority', 'Dedicated manager'] },
    { label: 'Dedicated sending domain', values: [N, N, Y, Y] },
    { label: 'Single sign-on and audit logs', values: [N, N, N, Y] },
    { label: 'Uptime SLA', values: [N, N, N, '99.9%'] },
  ] },
];

export const pricingFaqs = [
  { q: 'Can I change plans at any time?', a: 'Yes. You can move up or down whenever your list changes. Upgrades apply immediately and downgrades start at the next billing period.' },
  { q: 'What counts as a contact?', a: 'A contact is any unique email address in your audience that is not unsubscribed or suppressed. Duplicates are merged automatically.' },
  { q: 'How does yearly billing work?', a: 'Choose yearly billing to save 20%. The full year is billed in one payment and you can switch back to monthly at renewal.' },
  { q: 'Is there a free trial?', a: 'Every plan starts with a 14-day free trial. No credit card is needed to explore the platform.' },
  { q: 'What happens if I go over my limits?', a: 'We will let you know before you reach a limit and suggest the plan that fits. Sending is never interrupted without notice.' },
  { q: 'Do you offer discounts for nonprofits or agencies?', a: 'Yes. Registered nonprofits and agencies managing several clients can request tailored pricing through our sales team.' },
];
