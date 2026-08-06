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
index.html         New Level brand landing (hero · about · search box · event CTA · team ·
                   services · testimonials · events) — each section links to its own
                   dedicated landing page below via "Learn more" + the nav
about.html         Fuller "About New Level" page
properties.html    Property list — categorized (PROPERTY_CATEGORIES) by default;
                   filtered to one property when ?a=<audience> is present, or to a single
                   category (with optional keyword) when ?category=<id>&q=<keyword> is present
property.html      The 87th St property page — the big one
team.html          Agents & Partners — full team carousel
services.html      Full services list, anchor-linkable per service (#brokerage etc.)
testimonials.html  Full testimonials carousel + link out to property reviews
events.html        Events/networking gallery placeholder + link to event booking
contact.html       Point-of-contact card (phone/WhatsApp/email) + cross-page nav
content.js         ALL copy + config: audiences, photos, pricing, tax, i18n, footer, reviews,
                   event packages/types, property categories, PAGES (per-page hero copy)
app.js             Everything behavioral. One IIFE. Page dispatch at the bottom.
styles.css         Design tokens at the top, then components
netlify/functions/images.mjs   Shared image uploads (Netlify Blobs)
assets/photos/     39 real property photos, 00.jpg–38.jpg
```

`app.js` dispatches on `document.body.dataset.page` →
`landing | properties | property | about | team | services | testimonials | events | contact`.

Every dedicated page (team/services/testimonials/events/contact/about/properties) renders a
`#crossNavLinks` pill row (`buildCrossNav()`, driven by the `SITE_PAGES` list in app.js) so a
visitor can jump straight to any other page without backing out to the homepage. The hamburger
menu (`menuNav`/`menuContext`) does the same thing for every page.

**Primary nav** (`NAV_MENU` in content.js, `buildTopNav()`/`buildMenuSiteNav()` in app.js) is one
data source rendered two ways: hover/click dropdowns in index.html's desktop top bar, and a
collapsible accordion under "Explore" in the hamburger menu on every page. `.nav__links` is
hidden below **1200px** (not a typical phone-only breakpoint) — verified empirically that the
7-item dropdown nav's ~900px min-content width squeezes the centered logo to 0px width in the
`1fr auto 1fr` nav grid anywhere from ~641px up to ~1150px, so the cutoff has to clear that whole
range, not just phone widths. If nav items are ever added/removed, re-check this breakpoint
rather than assuming 1200px still clears it.

The nav has since been rebuilt as a left/right flex layout (not the `1fr auto 1fr` grid described
above — that grid is gone). `.nav__left` (logo only) is pinned with `flex: 0 0 auto` so it can
never shrink. `.nav__right` holds the back-link (on dedicated pages), `#navLinks`, and the
language switcher inside a scrollable `.nav__right-track`, with small `.nav-scroll__arrow`
buttons (`initNavRightScroll()` in app.js) that only render when the track actually overflows —
this replaced hiding `.nav__links` below 1200px as the fix for logo-squeeze, so if you ever touch
nav layout, don't reintroduce a fixed-column grid that lets `.nav__right` content compress the
logo. On index.html and property.html the nav is also `.nav--overlay`: transparent over the hero,
solidifies on scroll, and hides on scroll-down/reappears on scroll-up (`initNavScroll()`).

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

**Pricing** (`RATE_TIERS`, `EVENT_ADDONS`, `EVENT_PACKAGES`, `SECURITY_DEPOSIT` in content.js)
Two tiers, chosen by the guest — **not** derived from which audience icon they clicked:
- *Event*: full **24-hour** rental, $1,000 flat. Has check-in AND check-out **date + time**, with a
  24h minimum enforced. $500 refundable deposit. Guests pick ONE **package tier**
  (`EVENT_PACKAGES`: Self-Provided / Essentials / Signature / All-Inclusive) instead of toggling
  each service — `EVENT_ADDONS` is now just the à-la-carte price catalog a package's `includes`
  array references, not something the guest interacts with directly.
- *Stay*: multi-night, $500/night, no times, no packages, no deposit.
Taxes are **real** Miami-Dade law (6% + 1% + 6% = 13%). The 3% CDT is deliberately shown as an
**unresolved** line, neither silently included nor excluded.

**Event type** (`EVENT_TYPES` in content.js, `buildEventTypePicker()` in app.js)
Once "Private Events" is the chosen purpose, a chip picker (Birthday / Baby Shower / Wedding /
Graduation / Religious Retreat / Corporate Celebration / Other) plus a free-text field appears
right under the purpose selector. Selection flows into the "Attached to your inquiry" carried
list and the inquiry payload's `event_type` field — it doesn't affect pricing.

**Property categories** (`PROPERTY_CATEGORIES` in content.js)
properties.html groups listings by category (grown to 7: Luxury Short-Term / Short-Term /
Long-Term / Extended Stay / Private Events / For Sale / Investment — not exhaustive, more can be
added) unless `?a=` or `?category=` is present. Each property (including the "coming soon"
placeholders in `OTHER_PROPERTIES`) tags itself via a `categories` array.

**Search box & event CTA** (`SEARCH_CATEGORIES`, `EVENT_CTA` in content.js, `buildSearchBox()` /
`buildEventCta()` in app.js)
index.html's old 5-icon `#audienceGrid` purpose selector is gone, replaced by two separate
entry points below the hero: a search box (For Sale / For Rent [with a Long-Term / Short-Term /
Extended sub-menu] / Investment Properties, plus a free-text keyword field) and a distinct
"Hosting an event?" CTA band. They're kept separate deliberately — event-hosting is a different
question from what-are-you-shopping-for, not a 4th search chip. The search box submits to
`properties.html?category=<id>&q=<keyword>`; the event CTA links straight to
`properties.html?category=events`. Both route into `renderPropertyList()`'s `?category=` branch
(single-category view with keyword soft-matching via `matchesKeyword()`), reusing the existing
category/card rendering rather than a parallel results view. property.html's own `#purposeGrid`
5-icon audience selector (Family/Corporate/Ministry/etc. content personalization) was
deliberately left as-is in this pass — only the homepage entry point changed.

**Currency & language** (`CURRENCIES`/`LANGUAGES` in content.js, `initPreferences()` in app.js)
Any element with class `.currency-select` / `.lang-select` is auto-wired and kept in sync —
there's one of each in the footer, plus a prominent one in the main nav (`.nav__lang`, all
pages) and a currency one right beside the booking quote (`.quote__currency`, property.html).

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

**Carousels** (`initCarousel()` in app.js, `.carousel`/`.carousel__track` in styles.css)
Bounded left/right arrow-scroll (no infinite loop) used for Team and Testimonials on index.html
and their dedicated pages. Reusable: `initCarousel(trackSelector, prevArrowSelector, nextArrowSelector)`.

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
- **`initScrollReveal()`'s IntersectionObserver threshold must stay `0`, not a fraction.** A
  `threshold: 0.12` (requiring 12% of a target's own height in view before it fires) looked fine
  on short sections but never reliably fired on tall single-wrapper sections — e.g.
  properties.html's ~6000px results container — leaving the **entire page** stuck at
  `opacity: 0` from nav to footer. DOM/text-content assertions don't catch this (they pass fine
  on an invisible page); only a real screenshot or a computed-style/opacity check does. There's
  now also a defensive 2500ms timeout that force-reveals any still-stuck `.reveal` element as a
  safety net, but don't rely on that — keep the threshold at `0`.

## Testing on this machine

**Tooling varies by session environment — check before assuming.** Some sessions have no
Node/npm/Python at all (don't reach for `npx serve` or `python -m http.server` there; use a
PowerShell one-off or open files directly). Other sessions (e.g. this repo's Claude Code Remote
container) have `python3`, Node 22, and a globally-installed Playwright + Chromium
(`/opt/pw-browsers`) — there, `python3 -m http.server` plus a small Playwright script
(`NODE_PATH=/opt/node22/lib/node_modules node script.js`) works well and screenshots are reliable.

Preferred verification either way: drive the page and assert on the DOM (`page.locator`,
`textContent`, etc.), not just visual screenshots. Always finish with a console-error sweep.

## Current state (as of last session)

Complete and verified: all nine pages (see Architecture), tiered pricing with event **packages**,
the event-type picker, 24h event flow, photo tour + lightbox, menu, reviews, map embed,
fees/policies, i18n, prominent + booking-adjacent currency/language switchers, team/testimonials
carousels, categorized properties list, cross-page nav on every dedicated page, privacy controls,
image upload system.

Verified this session via a headless-Chromium/Playwright smoke pass across every page (booking
flow end-to-end including package selection + currency + language switch, plus a console-error
sweep) — see "Testing on this machine" above for how to repeat it.

**Most recent session:** rebuilt the top nav (logo pinned left, scrollable+arrowed right side,
transparent-over-hero/hide-on-scroll motion), replaced the homepage 5-icon purpose selector with
a search box + separate event CTA, added `?category=` search-result routing to properties.html,
grew property categories to 7, and fixed the scroll-reveal threshold bug described above. Verified
via Playwright across desktop + mobile widths with a console-error sweep; not yet re-confirmed
against a live newlevelassociates.com pull (still returning 403 to this environment as of last
check) or pushed live to Netlify.

**Content note:** newlevelassociates.com returned HTTP 403 to this session's fetch attempts (bot
protection), so the new pages' copy is informed by the content already captured in `content.js`
(SERVICES, TESTIMONIALS, TEAM, FOOTER_NAV — previously pulled from the live site) plus
clearly-illustrative placeholder text for anything not already captured, rather than a fresh
scrape. Worth a real pull once the site is reachable from wherever this runs next.

**Deployment is mid-flight:**
- ✅ Git repo initialized, committed, pushed to
  https://github.com/JackOfHearts2/New-Level-Website-Demo
- ⏳ **Netlify not yet connected.** Jack still needs to: import the repo on Netlify, then set an
  `ADMIN_TOKEN` env var and redeploy. Until that env var exists, image uploads are refused by
  design (fail closed, so a public link can't be defaced).

**Known placeholders** (intentional, flagged in the UI): rates (including the new event package
prices), agent phone/WhatsApp, broker license number, social URLs (Instagram/Facebook/TikTok —
see `SOCIALS` in content.js, all three render and link correctly, just to the main site until
real handles exist), team photos, floor plan, event gallery, and `INQUIRY_ENDPOINT` (empty ⇒ the
inquiry form confirms without actually sending).
