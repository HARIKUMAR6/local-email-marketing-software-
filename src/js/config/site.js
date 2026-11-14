// Single source of truth for navigation, CTAs, contact, social, pricing and dashboard data.
// Paths are project-relative; components resolve them with url() for sub-folder pages.

export const brand = {
  name: 'VELORA',
  tagline: 'Make Every Message Matter.',
  summary: 'Email marketing and automation that turns every send into a conversation worth having.',
};

export const primaryNav = [
  {
    label: 'Home',
    children: [
      { label: 'Home 1', desc: 'Campaign-led overview', href: 'index.html' },
      { label: 'Home 2', desc: 'Automation-led overview', href: 'index-2.html' },
    ],
  },
  { label: 'About', href: 'about.html' },
  { label: 'Features', href: 'features.html' },
  { label: 'Pricing', href: 'pricing.html' },
  { label: 'Contact', href: 'contact.html' },
  { label: 'Dashboard', href: 'dashboard/index.html', icon: 'layout', accent: true },
];

export const ctas = {
  login: { label: 'Login', href: 'login.html' },
  primary: { label: 'Get Started', href: 'login.html#signup' },
};

export const footerNav = [
  { title: 'Navigation', links: [
    { label: 'Home 1', href: 'index.html' },
    { label: 'Home 2', href: 'index-2.html' },
    { label: 'About', href: 'about.html' },
    { label: 'Features', href: 'features.html' },
    { label: 'Pricing', href: 'pricing.html' },
    { label: 'Contact', href: 'contact.html' },
  ] },
  { title: 'Product', links: [
    { label: 'Email campaigns', href: 'index.html#campaigns' },
    { label: 'Contacts & segments', href: 'index.html#audience' },
    { label: 'Automation', href: 'index.html#automation' },
    { label: 'Templates', href: 'index-2.html#personalization' },
    { label: 'Analytics & reports', href: 'index.html#analytics' },
    { label: 'Integrations', href: 'index-2.html#integrations' },
  ] },
];

export const contact = [
  { icon: 'mail', label: 'hello@velora.io', href: 'mailto:hello@velora.io' },
  { icon: 'phone', label: '+91 44 5550 0142', href: 'tel:+914455500142' },
  { icon: 'mapPin', label: 'Nandambakkam, Chennai, Tamil Nadu, India', href: 'contact.html#map' },
  { icon: 'clock', label: 'Mon–Fri, 9:00–18:00 IST' },
];

export const social = [
  { icon: 'linkedin', label: 'VELORA on LinkedIn', href: '#' },
  { icon: 'x', label: 'VELORA on X', href: '#' },
  { icon: 'instagram', label: 'VELORA on Instagram', href: '#' },
  { icon: 'youtube', label: 'VELORA on YouTube', href: '#' },
];

import { plans as allPlans, volumeSteps as allSteps } from './pricing.js';

/** Homepage plan cards and calculator: the three priced plans (see config/pricing.js). */
export const plans = allPlans.filter((p) => p.monthly != null);
export const volumeSteps = allSteps.filter((s) => s.plan < 3);

export const dashboardNav = [
  { section: 'Workspace', items: [
    { icon: 'layout', label: 'Overview', view: 'overview' },
    { icon: 'send', label: 'Campaigns', view: 'campaigns' },
    { icon: 'edit', label: 'Email Builder', view: 'builder' },
    { icon: 'users', label: 'Contacts', view: 'contacts' },
    { icon: 'filter', label: 'Lists & Segments', view: 'lists' },
    { icon: 'workflow', label: 'Automation', view: 'automation' },
    { icon: 'template', label: 'Templates', view: 'templates' },
  ] },
  { section: 'Insights', items: [
    { icon: 'chart', label: 'Analytics', view: 'analytics' },
    { icon: 'fileText', label: 'Reports', view: 'reports' },
  ] },
  { section: 'Account', items: [
    { icon: 'settings', label: 'Settings', view: 'settings' },
  ] },
];
