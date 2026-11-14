# VELORA — Email Marketing & Automation SaaS

> Make Every Message Matter.

HTML5 · Tailwind CSS v4 (CLI) · Vanilla JavaScript (ES modules). No frameworks, no bundler.

## Commands

```bash
npm install        # tailwindcss + @tailwindcss/cli (dev only)
npm run dev        # watch src/css → assets/css/velora.css
npm run build      # minified production CSS
```

Pages use native ES modules, so serve the project root over HTTP (e.g. VS Code Live Server or `npx serve .`), not `file://`.

## Structure

```
index.html                      Home 1 — campaign-led homepage
index-2.html                    Home 2 — automation-led homepage
about.html, features.html       Company and product pages
pricing.html, contact.html      Showcase pricing (no checkout) and enquiry page
styleguide.html                 Design-system reference
dashboard/index.html            Dashboard pages (set <html data-base="../">)
src/css/main.css                Tailwind entry: sources, variants, @theme
src/css/tokens.css              Semantic tokens, light + dark
src/css/base.css                Typography, a11y, overflow guard
src/css/components/*.css        Layout, buttons, forms, cards, badges, nav, hero, footer, dashboard,
                                pv (product-preview primitives), sections (split, flow, tabs, orbit, pricing, CTA, reveal)
src/js/config/site.js           Nav, CTAs, footer, contact details, social, dashboard nav (single source)
src/js/config/pricing.js        Plans, prices, volume steps, comparison table and pricing FAQs (edit prices here)
src/js/core/                    theme, direction, scroll-top, reveal, storage, dom helpers
src/js/components/              header (+ drawer), dropdown, mobile-menu, footer, logo, icons, controls,
                                tabs, pricing (plans, billing toggle, calculator, table), form (validation), map (OpenStreetMap embed),
                                charts (heatmap), workflow (hero canvas)
src/js/dashboard/               sidebar, topbar
src/js/main.js | dashboard.js   Page entry points
assets/css/velora.css           Build output (generated)
assets/svg/                     logo.svg (lockup), logo-mark.svg (emblem / favicon)
assets/images/{public,dashboard}/  Future visuals — one unique image per use, never reused
```

## Page conventions

- Shared UI mounts into placeholders: `<div data-component="header|footer|sidebar|topbar">`.
- Keep the inline theme/direction `<script>` in `<head>` (prevents a flash of the wrong theme).
- Hero: `.hero` + `.hero-start` or `.hero-center` (viewport height below the header). Use `.hero-compact` for inner pages.
- Text alignment: start or center only. `.cta-group` centers on mobile.
- Use logical utilities (`ms-*`, `pe-*`, `start-*`, `text-start`) so RTL works automatically.
- Theme: `data-theme="light|dark"` on `<html>` (`dark:` variant). Direction: `dir="ltr|rtl"` (`rtl:` / `ltr:` variants).
- No image credits or source attribution in the public UI.

## Homepage conventions

- Visuals are real markup + inline SVG product previews (`.pv`, `.paper`, `.phone`), wrapped in a `role="img"` figure with an `aria-label`. Add one new, unique preview per section.
- `<span data-icon="name">` is replaced by an inline SVG at load (`hydrateIcons`); add icons in `icons.js`.
- `.scope-dark` re-themes any section to the dark tokens in either theme; `.paper` keeps a light surface in both.
- Add `.reveal` (optional `data-delay="1–4"`) for scroll-in motion; the inline `<head>` script adds `.js` so content stays visible without scripts.
- Plans and calculator steps live in `config/site.js`; tabs use `[data-tabs]` + `role="tab"/"tabpanel"`.

## Pricing and contact notes

- Edit plan names, prices, limits, features, comparison rows and FAQs in `src/js/config/pricing.js`; homepages and the pricing page update together. Yearly prices use `YEARLY_DISCOUNT`.
- The enquiry form validates in the browser and shows a confirmation, but is not yet connected to a backend.
- The contact map is a temporary OpenStreetMap embed of Chennai Trade Centre (13.0135, 80.1893), not a verified office. Update `data-src` in `contact.html` and the `contact` entries in `config/site.js` when real details exist.
