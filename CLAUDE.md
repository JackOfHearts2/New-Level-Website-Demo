# CLAUDE.md — project context

Read this first. It captures decisions and gotchas that aren't obvious from the code.
User-facing setup/deploy instructions live in `README.md`.

## What this is

A **demo** marketing site for **New Level** (South Florida real estate group) and its first
property, **1331 NW 87th Street, Miami**. Built for Jack to share for feedback — it is explicitly
NOT live, and every fake number is deliberately marked as a placeholder.

Static, dependency-free HTML/CSS/JS. No framework, no build step for the site itself.
One Netlify Function provides shared image storage.

## Architecture

```
index.html       New Level brand landing (hero · about · purpose selector · team ·
                 services · testimonials · events)
about.html       Fuller "About New Level" page
properties.html  Property list, filtered by purpose (?a=corporate etc.)
property.html    The 87th St property page — the big one
content.js       ALL copy + config: audiences, photos, pricing, tax, i18n, footer, reviews
app.js           Everything behavioral. One IIFE. Page dispatch at the bottom.
styles.css       Design tokens at the top, then components
netlify/functions/images.mjs   Shared image uploads (Netlify Blobs)
assets/photos/   39 real property photos, 00.jpg–38.jpg
```

`app.js` dispatches on `document.body.dataset.page` → `landing | properties | property | about`.

## Locked design decisions — do not drift

These came from the client brief and were corrected several times. Don't "improve" them:

- **Colors: black / white / ONE green.** Brand green is **`#72D35B`** (confirmed from the live
  logo). No gold, no serif, no second accent — an early brief draft wrongly said gold+Georgia.
- **Type: Poppins** (display) + **DM Sans** (body). No serif anywhere.
- **Logo** (`assets/logo.png`) is the real asset from newlevelassociates.com. Its white space is
  pure `#FFFFFF`, so any surface it sits on uses `--true-white` — otherwise you get a visible seam.
  It is **centered** in the nav; menu + back arrow group on the left.
- **Brand-level copy says "South Florida," never "Miami"** so the template works for future
  properties. Property-specific copy may name Miami.
- **Audience icons are shape-differentiated, never color-coded.** The Church/Ministry icon
  deliberately has **no cross** (a gathering under an arch) to stay welcoming across traditions.
- Long-form content (property descriptions, reviews, house rules) stays English even when the UI
  is translated.

## Key subsystems

**Pricing** (`RATE_TIERS`, `EVENT_ADDONS`, `SECURITY_DEPOSIT` in content.js)
Two tiers, chosen by the guest — **not** derived from which audience icon they clicked:
- *Event*: full **24-hour** rental, $1,000 flat. Has check-in AND check-out **date + time**, with a
  24h minimum enforced. Offers 4 add-on services with real demo prices. $500 refundable deposit.
- *Stay*: multi-night, $500/night, no times, no add-ons, no deposit.
Taxes are **real** Miami-Dade law (6% + 1% + 6% = 13%). The 3% CDT is deliberately shown as an
**unresolved** line, neither silently included nor excluded.

**Photos** (`PHOTO_SOURCE` in content.js)
`"remote"` (default) streams from the photographer's CDN → deploy is ~322KB with no image files.
`"local"` uses `assets/photos/`. A missing local file auto-falls back to the CDN — never breaks.

**Image uploads** (`?edit=1`)
Every image slot is tagged `data-img-key`. Edit mode adds Upload badges. Uploads are downscaled,
stored locally, and — if `ADMIN_TOKEN` is set on Netlify — published via `/api/images` so all
visitors see them. Falls back silently to local-only when the function isn't deployed.

**i18n** (`I18N` in content.js, `translatePage` in app.js)
ES / FR / PT / HT. Keyed by English string. Re-run `translatePage(currentLang)` after any dynamic
render or new text won't translate.

## Gotchas discovered the hard way

- **The property page rewrites its own URL** (`history.replaceState`) when a purpose is selected.
  Anything reading `location.search` must run *before* render, or preserve its params — this
  silently broke `?edit=1` once.
- **Don't add `position: relative` to already-positioned elements.** Doing this to `.a-hero__bg` /
  `.nl-hero__bg` (absolute) collapsed the hero and made white text land on white.
- **`[hidden]` loses to `display:grid/flex`** — there's a `[hidden] { display: none !important }`
  rule for this reason.
- **Element widths read 0 before images load**, so size-dependent logic must re-check on
  `load`/rAF (the nav upload badge got this wrong first time).
- The `#25D366` green in the codebase is **WhatsApp's brand color** and is correct — don't
  "fix" it to the New Level green.

## Testing on this machine

**There is no Node/npm and no Python here.** Don't reach for `npx serve` or `python -m http.server`.
Serve with a PowerShell one-off (see scratchpad scripts from prior sessions) or open files directly.

Preferred verification: drive the page via the browser tool's `javascript_tool` and assert on the
DOM. Screenshots in this environment are unreliable — they often fail on scrolled positions — so
DOM assertions are the trustworthy check. Always finish with a console-error sweep.

## Current state (as of last session)

Complete and verified: all four pages, tiered pricing, 24h event flow, photo tour + lightbox,
menu, reviews, map embed, fees/policies, i18n, currency, privacy controls, image upload system.

**Deployment is mid-flight:**
- ✅ Git repo initialized, committed, pushed to
  https://github.com/JackOfHearts2/New-Level-Website-Demo
- ⏳ **Netlify not yet connected.** Jack still needs to: import the repo on Netlify, then set an
  `ADMIN_TOKEN` env var and redeploy. Until that env var exists, image uploads are refused by
  design (fail closed, so a public link can't be defaced).

**Known placeholders** (intentional, flagged in the UI): rates, agent phone/WhatsApp, broker
license number, social URLs, team photos, floor plan, event gallery, and `INQUIRY_ENDPOINT`
(empty ⇒ the inquiry form confirms without actually sending).
