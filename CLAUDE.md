# CLAUDE.md — project context

Read this first. It captures decisions and gotchas that aren't obvious from the code.
User-facing setup/deploy instructions live in `README.md`.

## What this is

A **demo** marketing site for **New Level** (South Florida real estate group) and its first
property, **1331 NW 87th Street, Miami**. Built for Jack to share for feedback — it is explicitly
NOT live, and every fake number is deliberately marked as a placeholder.

Static, dependency-free HTML/CSS/JS. No framework, no build step for the site itself.
One Netlify Function provides shared image storage.

## Migration in progress: Next.js rebuild in `web/`

As of 2026-08-20, the client decided to fully replace this static site with a Next.js rebuild —
**not** run both permanently side by side. The plan is one clean cutover once the rebuild covers
everything the static site does, not an incremental swap page-by-page. Until then:

- The static site described in the rest of this file (root `index.html`/`app.js`/`content.js`/
  etc.) is still what's live in production and still gets no further feature work beyond what's
  needed to keep it running — new work goes into `web/` from here on.
- `web/` is a separate Next.js 16 + Tailwind v4 + shadcn/base-ui app. Brand tokens (black/white/
  `#72D35B` green, Poppins/DM Sans) are already mapped into its `globals.css`. So far it only has
  the homepage (hero, about, services, event CTA, team, testimonials, footer) — none of the other
  ten pages, the booking/pricing logic, image uploads, i18n, or forms have been ported yet. The
  "no framework, no build step" rule above describes the *current production site only* — it does
  not apply inside `web/`, which is the intended replacement for all of it.
- **Two separate Netlify sites exist.** Production (the one described in "Deployment" near the
  bottom of this file) builds the repo root from `main`. A second, separate Netlify site was added
  as a preview-only deploy target for this rebuild — it watches the `claude/nextjs-foundation`
  branch directly (no PR needed for that one), with base directory `web`, and has its own
  `web/netlify.toml` + `web/.nvmrc` (Next 16 requires Node ≥20.9, newer than Netlify's default).
  Don't let the two configs blend — `web/netlify.toml`'s `[build] command` must stay scoped to
  `web/`, and must never fall back to the root `netlify.toml`'s `command = "npm install"` (which
  has no actual build step and would silently produce a broken/blank deploy for the Next app).

**Workflow / autonomy, confirmed with the client 2026-08-20:** Claude pushes commits to branches
and can push directly to `main` only when explicitly told to for that specific change. The default
is to keep the existing human-review checkpoint — push to a branch, client reviews the diff and
merges the PR themselves — because the production Netlify site auto-deploys the instant something
lands on `main`, with no staging pause. A Netlify MCP connector is available (`claude mcp list`
should show `claude.ai Netlify` as Connected) for checking deploy status/logs/env vars directly
instead of relaying through the client — note a fresh session may be needed after the connector is
first added before its tools actually appear (confirmed via `ToolSearch`, not just `claude mcp
list`, since the two can disagree during the same session the connector was added in).

## Architecture

```
index.html         New Level brand landing (hero · about · search box · event CTA · team ·
                   services · testimonials · events) — each section links to its own
                   dedicated landing page below via "Learn more" + the nav
about.html         Fuller "About New Level" page — mission/story + values grid + "what we do"
properties.html    Property list — categorized (PROPERTY_CATEGORIES) by default;
                   filtered to one property when ?a=<audience> is present, or to a single
                   category (with optional keyword) when ?category=<id>&q=<keyword> is present
property.html      The 87th St property page — the big one
team.html          Agents & Partners — full team carousel
services.html      Full services list, detailed cards (long copy + capability lists),
                   anchor-linkable per service (#brokerage / #management / #investment)
testimonials.html  Full testimonials carousel + link out to property reviews
events.html        Events/networking gallery placeholder + link to event booking
contact.html       Topic-chip selector (property/investment/management/events/join/general) +
                   point-of-contact card + inline FAQ teaser + cross-page nav
brokers-corner.html  Shelley's video-insights series — bio + "latest episode" placeholder
faq.html           Full FAQ list (shared FAQS array, also teased inline on contact.html)
content.js         ALL copy + config: audiences, photos, pricing, tax, i18n, footer, reviews,
                   event packages/types, property categories, values, FAQs, contact topics,
                   PAGES (per-page hero copy)
app.js             Everything behavioral. One IIFE. Page dispatch at the bottom.
styles.css         Design tokens at the top, then components
netlify/functions/images.mjs   Shared image uploads (Netlify Blobs)
assets/photos/     39 real property photos, 00.jpg–38.jpg
```

`app.js` dispatches on `document.body.dataset.page` →
`landing | properties | property | about | team | services | testimonials | events | contact |
brokers-corner | faq`.

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
above — that grid is gone), and the logo has moved out of it entirely. `.nav__right` holds the
back-link (on dedicated pages), `#navLinks`, and the language switcher inside a scrollable
`.nav__right-track`, with small `.nav-scroll__arrow` buttons (`initNavRightScroll()` in app.js)
that only render when the track actually overflows — this replaced hiding `.nav__links` below
1200px as the fix for logo-squeeze, so if you ever touch nav layout, don't reintroduce a
fixed-column grid that lets `.nav__right` content compress anything. On index.html and
property.html the nav is also `.nav--overlay`: transparent over the hero, solidifies on scroll,
and hides on scroll-down/reappears on scroll-up (`initNavScroll()`).

To keep the top nav from growing a 7th/8th top-level item every time a new page is added, new
pages get nested into an existing dropdown rather than appended flat. `NAV_MENU` is now 6
top-level items: Properties, **About** (dropdown: About New Level / Team / The Broker's Corner —
Team was pulled out of its own flat slot and folded in here), Services (dropdown: Brokerage &
Consulting / Property Management / Investment), Testimonials, Events, Contact. FAQs isn't in the
top nav at all — it lives in the footer and as an inline teaser block on contact.html, on the
theory that FAQs are a "looked for, not browsed to" page. If another page gets added later,
default to nesting it under the nearest existing dropdown before adding a new top-level item.

**"Reach out" is available everywhere, not just from Contact-flavored sections.** `.contact-float`
is a persistent top-right cluster — a round WhatsApp icon plus a "Get in Touch" button — rendered
on every page except contact.html itself (would be redundant there) and hidden below 640px
(mobile has the hamburger + in-page CTAs for this instead — see `@media (max-width:640px)` in
styles.css). It mirrors `.brand-float`'s fixed positioning on the opposite side and is driven by
the same `initNavScroll()` top-offset/hide-on-scroll logic (`contactFloat` alongside `brandFloat`
in that function) so the two stay in sync as the demo banner/nav show and hide. Clicking
"Get in Touch" opens a lightweight quick-contact panel (`initQuickContact()` in app.js — Name /
Email / Message / Send, built the same way as the report/privacy modals) rather than always
navigating to contact.html, so a visitor can send a message without losing their place on the
page; it links out to the full contact page too. **Both anchors inside `.contact-float` need
`text-decoration:none` set directly on themselves** (not just an inner child) — an ancestor
`<a>`'s default underline still gets drawn across a descendant that sets its own
`text-decoration:none`, since the line belongs to the ancestor's box. Missing this was the earlier
"black line appears under the button on hover" bug: the underline sat at the anchor's original
baseline, invisible behind the pill until `:hover`'s `translateY(-2px)` moved the pill up and
exposed it. Separately, contact.html itself now opens with a `CONTACT_TOPICS` chip selector
(`buildContactTopics()`) so "reach out" isn't implicitly property-inquiry-only — a visitor can
flag *why* they're reaching out (property / investment / management / events / join the team /
general) before the point-of-contact card. `?topic=<id>` preselects a chip (e.g. the footer's
"Join Our Network" link is `contact.html?topic=join`).

**The logo (`.brand-float`)** is a fixed-position sibling of `.nav`, not a nav child — see the
`.brand-float` comment block in styles.css for the full rationale. Short version: on desktop it
sits flush against the true left edge of the viewport (there's dead space between the true edge
and where `.wrap`'s centered `max-width` column starts on wide screens — `.brand-float` sits
outside that column on purpose, "on its own"), and it stays visible even while the nav bar hides
on scroll-down, since `.nav--hidden`'s transform never touches it. On mobile (`max-width:640px`)
both of those flip: the flush-left placement reads as oversized on a narrow screen, so it centers
instead (smaller, with the hamburger anchoring the right side) and hides/reappears together with
the rest of the bar again, like the classic mobile pattern. `initNavScroll()` in app.js drives all
of this — it mirrors `.nav`'s hidden state onto `.brand-float` every scroll tick (inert on desktop,
active only inside the mobile breakpoint). If you ever need to change the logo's position or
visibility behavior, that function plus the `.brand-float` rules in styles.css (base + the
`max-width:640px` override) are the only two places to touch.

**The logo's white background AND card chrome are both permanent now — nothing about
`.brand__logo-slot` toggles with scroll state anymore.** `assets/logo.png` is fully opaque
(baked-in white background, no transparency), so the white backing was already unconditional (an
earlier version faded it away and that was reverted — the raw white PNG landing on non-white
content with nothing to blend into looked broken). A later round then tried a *hysteresis-based
melt*: the nav bar solidifying on scroll-down would strip the logo's card (rounded corners,
padding, shadow) so it read as flush with the solid bar instead of a second white panel stacked on
top of it, popping the card back only once the bar went transparent over the hero again. **That
melt behavior has since been reverted per direct client feedback** — the client watched it live
and reported the logo "losing its frame" while scrolling: because `solid` is `true` for basically
the entire scroll depth of every page (and is *permanently* `true` on every non-overlay page —
about/team/services/testimonials/events/contact/brokers-corner/faq/properties — since those pages
have no hero to be transparent over in the first place), the card was effectively never showing
except in the first instant at the very top of index.html/property.html. The fix: `.brand__logo-slot`
now carries the rounded/padded/shadowed card look unconditionally in its base rule — no
`.brand-float--card` modifier, no `solid`-driven toggle in `initNavScroll()`. **Don't reintroduce
a scroll-state-driven card toggle here without re-reading this note first** — it's been tried
twice now and both times looked wrong in practice, for opposite-sounding reasons (a mismatched
white panel vs. a logo with no visual separation from the page at all). The nav bar's own
solid/transparent hysteresis (see next paragraph) is unrelated and untouched — only the logo's
own card chrome stopped being conditional on it.

**The nav bar itself still solidifies with hysteresis** (this part is unchanged and the client
confirmed they like it): on `.nav--overlay` pages, once the transparent-over-hero bar solidifies
on scroll-down, it stays solid through the whole climb back up and only goes transparent again
right at the very top — not the instant you cross the same threshold going up. `initNavScroll()`
in app.js: a `solid` boolean uses two different thresholds depending on direction — flips to
`true` only when `y > solidifyAt` (`heroH - 90`, scrolling down) and flips to `false` only when
`y <= desolidifyAt` (`40`, scrolling up) — so a partial scroll-up that doesn't reach the top leaves
`solid` unchanged. Don't collapse this back to a single shared threshold; that's what caused the
original flicker. `.contact-float` (see the "reach out" paragraph above) shares the same fixed
top-offset bookkeeping in `initNavScroll()` as `.brand-float`, so the two stay vertically in sync
as the demo banner/nav show and hide.

## Locked design decisions — do not drift

These came from the client brief and were corrected several times. Don't "improve" them:

- **Colors: black / white / ONE green.** Brand green is **`#72D35B`** (confirmed from the live
  logo). No gold, no serif, no second accent — an early brief draft wrongly said gold+Georgia.
- **Type: Poppins** (display) + **DM Sans** (body). No serif anywhere.
- **Logo** (`assets/logo.png`) is the real asset from newlevelassociates.com. Its white space is
  pure `#FFFFFF`, so any surface it sits on uses `--true-white` — otherwise you get a visible seam.
  Its position has moved a few times as the client refined the brief — see `.brand-float` above
  for current placement (flush-left + always-visible on desktop, centered on mobile).
- **Brand-level copy says "South Florida," never "Miami"** so the template works for future
  properties. Property-specific copy may name Miami.
- **Audience icons are shape-differentiated, never color-coded.** The Church/Ministry icon
  deliberately has **no cross** (a gathering under an arch) to stay welcoming across traditions.
- Long-form content (property descriptions, reviews, house rules) stays English even when the UI
  is translated.

## Working with design references (21st.dev etc.)

The client periodically pastes a component's full source — a 21st.dev "integrate this React
component" prompt has come up more than once — as a way to communicate a *visual direction* they
want, not as literal code to run. **Standing instruction from the client: extract the design
feel (layering, motion, depth, boldness, composition) and rebuild it with this project's existing
tokens/markup patterns — never the literal code, exact layout, copy, or stack.** This project
stays framework-free (see "What this is" above) — that's a locked decision a pasted reference
doesn't override, even when the reference's own instructions explicitly ask for shadcn/Tailwind/
TypeScript setup steps. If the literal ask genuinely can't be done as written (e.g. it assumes a
project structure this one doesn't have), say so plainly and explain what it would actually take —
don't just silently reinterpret and also don't flatly refuse; see "Homepage hero redesign" below
for a worked example of this exact pattern end to end.

## Key subsystems

**Homepage hero redesign** (`.hero-badge`/`.nl-hero__glow` in styles.css, `initHeroReveal()` in
app.js) A "borrow the design feel, not the literal code" pass in response to client feedback that
the site read as flat — the client shared a 21st.dev React/Tailwind reference component and was
explicit that only its overall visual composition should carry over, reskinned in our brand, not
its markup/stack/copy (this project stays framework-free — see "What this is" above; that's a
locked decision, not something a reference component changes). What got adapted, all scoped to
index.html's `.nl-hero` (property.html's differently-structured `.a-hero` wasn't touched):
- The plain-text eyebrow became `.hero-badge` — a white pill with a green gradient chip (brand
  name) + supporting text (tagline), reusing existing copy rather than inventing new marketing
  lines. This is a hero-specific device, not a change to `.eyebrow` used elsewhere.
- `.nl-hero__glow` — two blurred CSS radial-gradient circles (no image assets) layered behind the
  hero content for depth, replacing what was a flat dark gradient + stripe texture.
- `.nl-hero__title` got a bigger clamp (was inheriting `.display`'s `clamp(2.4rem,6vw,4.6rem)`,
  now its own `clamp(2.6rem,7vw,5.6rem)`) for more visual weight.
- `.search-bar` went from solid `var(--paper)` to a translucent `rgba(255,255,255,.88)` +
  `backdrop-filter: blur(20px)` background, so the card reads as tied to the hero/glow it overlaps
  rather than a flat slab dropped on top. Internal controls (tabs, fields) stay opaque.
- `initHeroReveal()` — a one-time staggered entrance for the hero's own content on page load
  (badge → headline → subtext → search bar), reusing `.reveal-item`'s timing/easing from
  `initScrollReveal()` but triggered directly rather than via IntersectionObserver, since the hero
  is already in view at load. It needed its own CSS hook (`.reveal-item.is-revealed`, applied
  directly per-item) rather than the scroll-reveal pattern's shared `.reveal` ancestor wrapper,
  because `.nl-hero__inner` and `.search-bar` are separate DOM subtrees with no close common
  ancestor to toggle. `initScrollReveal()` itself still deliberately skips hero bands — unrelated,
  unchanged.
- The nav bar's transparent-over-hero state (`.nav--overlay:not(.nav--solid)`) changed from plain
  edge-to-edge transparent white text to a floating glass pill: `.nav__inner` gets a translucent
  white background, `backdrop-filter: blur(16px)`, rounded corners and a shadow, inset within the
  page's centered column rather than spanning edge-to-edge. Text switched from forced white (needed
  when there was nothing but the raw hero photo behind it) to the normal ink color, since the glass
  pill itself now provides a light backdrop regardless of what's behind it. The solidified state
  (`.nav--solid`, scrolled past the hero) is completely unchanged — same full-width white bar the
  client already confirmed they like; only the pre-scroll appearance changed.
If you're asked to pull in another visual reference later: extract the composition/feel (layering,
motion, depth, boldness) and rebuild it with our existing tokens/markup patterns, the way this
round did — don't add a second framework or copy foreign markup wholesale.

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

**Search bar & event CTA** (`SEARCH_CATEGORIES`, `SEARCH_FILTERS`, `EVENT_CTA` in content.js,
`buildSearchBox()` / `buildEventCta()` in app.js)
index.html's old 5-icon `#audienceGrid` purpose selector is gone. In its place: a search bar
that overlaps the seam between the hero photo and the page body (`.search-overlay`, pulled up
over `.nl-hero--search` with a negative margin — see reference layout the client shared), plus a
separate "Hosting an event?" CTA band further down the page. They're kept separate deliberately
— event-hosting is a different question from what-are-you-shopping-for, not a 4th search tab.
The bar itself is tabs (For Sale / For Rent / Investment Properties — `SEARCH_CATEGORIES`), a
keyword field, and Neighborhood/Min Beds/Min Baths/Min Price/Max Price dropdowns
(`SEARCH_FILTERS`) plus Reset/Search buttons. **Those five filter dropdowns are decorative** —
populated and selectable, but not wired into filtering. This demo has one real listing plus a
handful of placeholders, not a real MLS inventory, so there's nothing for "Min Beds: 3+" to
filter against yet; only the tab + keyword field affect results. Picking "For Rent" reveals a
Rental Type dropdown (Long-Term/Short-Term/Extended) that gates the Search button. The bar
submits to `properties.html?category=<id>&q=<keyword>`; the event CTA links straight to
`properties.html?category=events`. Both route into `renderPropertyList()`'s `?category=` branch
(single-category view with keyword soft-matching via `matchesKeyword()`), reusing the existing
category/card rendering rather than a parallel results view. property.html's own `#purposeGrid`
5-icon audience selector (Family/Corporate/Ministry/etc. content personalization) was
deliberately left as-is in this pass — only the homepage entry point changed.

**Events calendar** (`EVENTS_CALENDAR` in content.js, `renderEventsCalendar()` in app.js)
events.html shows a single-month calendar (marked event days) plus a list of every upcoming
event, both driven by one `EVENTS_CALENDAR` array (`{ date: "YYYY-MM-DD", title, type, time,
blurb }`). It's purely informational — day cells aren't clickable/pickable like the booking
calendar's are, they just carry a native tooltip; each card in the list is the real detail
surface and links to contact.html so a visitor can actually RSVP or ask about it. The calendar
opens on the first *upcoming* event's month (not always the current month) so it doesn't land on
an empty grid when the nearest event is a few weeks out. All entries are currently placeholders —
updating this means editing the array (or handing dates to Claude) until the admin login planned
for later lets the team do it themselves.

**Currency & language** (`CURRENCIES`/`LANGUAGES` in content.js, `initPreferences()` in app.js)
Any element with class `.currency-select` / `.lang-select` is auto-wired and kept in sync —
there's one of each in the footer, plus a prominent one in the main nav (`.nav__lang`, all
pages) and a currency one right beside the booking quote (`.quote__currency`, property.html).

**Photos** (`PHOTO_SOURCE` in content.js)
`"remote"` (default) streams from the photographer's CDN → deploy is ~322KB with no image files.
`"local"` uses `assets/photos/`. A missing local file auto-falls back to the CDN — never breaks.

**About page content** (`NLG_BRAND.mission`/`.story`, `VALUES` in content.js, `buildValues()` in
app.js) `mission`/`story` are real founding-story copy migrated from the client's existing site
(see "Content migrated from the live site" below), rendered into `#aboutMission`/`#aboutStory`.
`VALUES` is a 5-entry `{t, d}` array (Integrity / Excellence / Wealth Creation / Innovation /
Client Focus) rendered as a card grid via `buildValues()`.

**Broker's Corner** (`BROKERS_CORNER` in content.js, `renderBrokersCornerPage()` in app.js)
A dedicated page (`brokers-corner.html`) for Shelley Lozier's video-insights series — real intro/
bio copy migrated from the live site, plus a "Latest Episode" placeholder block (no real video yet).
Reachable via the About dropdown and the footer.

**FAQs** (`FAQS` in content.js, `buildFaqList()` in app.js)
5 real Q&As migrated from the live site, rendered as `<details>` accordions. Shared by the
dedicated `faq.html` page and a teaser block on contact.html (same `buildFaqList(sel)` call,
different container id) — there's one array, two render sites, so edit `FAQS` once and both stay
in sync.

**Contact topics** (`CONTACT_TOPICS` in content.js, `buildContactTopics()` in app.js)
A chip selector at the top of contact.html (property / investment / management / events / join
the team / general) so the page reads as a general "reach out to New Level" surface, not just a
property-inquiry form. `?topic=<id>` preselects a chip — the footer's "Join Our Network" link
uses `contact.html?topic=join`; link to other topics the same way if you add more entry points.
Purely a UI affordance for now (not yet wired into the inquiry payload).

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
Each carousel also auto-nudges as a "there's more here" hint: an IntersectionObserver fires once
the track is ≥60% in view, nudges it ~88px right, holds ~2s, then eases back to the start. This
now **repeats every time the section re-enters the viewport** (scroll away and back, either
direction) rather than firing once per page load — the observer is never `unobserve()`d, and a
`nudging` guard just prevents re-triggering mid-animation. Same repeat-on-every-visit change was
made to `initScrollReveal()` (see the gotcha below) — both were changed together for the same
client request ("make it something that happens every time we get to that section, not once").

**Hover motion** — clickable/selectable elements (property cards, testimonial cards, team photos,
tier/package options, event-type chips, search bar tabs & fields, link-arrows, the floating logo)
get a lift/scale/tint on `:hover` so the site doesn't read as static. Deliberately **not** applied
to purely informational, non-clickable blocks (`.fact`, `.amenity`, `.step`, `.other-card` — the
"coming soon" placeholder property cards, which are plain `<div>`s with no link or handler) —
adding hover feedback there would imply an interaction that doesn't exist. Keep that distinction
if you add more hover states later: hover means "this does something," not decoration.

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
  safety net, but don't rely on that — keep the threshold at `0`. This got riskier once the
  observer was changed to repeat (toggle `is-revealed` on `entry.isIntersecting`, never
  `unobserve()`, so sections re-animate every time they re-enter the viewport instead of once per
  page load) — a repeating observer means the tall-section failure mode could now also manifest as
  content flickering back to invisible on scroll-up, not just staying invisible forever. Re-verified
  by scrolling properties.html's full ~7000px height down and back up in 800px steps and checking
  for any `.reveal:not(.is-revealed)` or low-opacity-while-in-viewport element at each step — came
  back clean both directions, but re-run that same check (not just a static page load) after any
  future change here.
- **Setting only `overflow-x` on an element silently forces `overflow-y` to compute as `auto` too
  — it never stays `visible`.** This is spec behavior (CSS Overflow Module), not a browser bug, and
  it broke the desktop dropdown nav completely: `.nav__right-track` sets `overflow-x: auto` (so the
  nav row scrolls horizontally when it overflows — see the nav-layout paragraph above), which meant
  its computed `overflow-y` was *also* `auto`, clipping `.nav-dropdown` panels that used to live
  nested inside `.nav-item` inside that track — the panel extended ~140px below the track's own
  ~26px height, so it was invisible on every hover even though `:hover`/`.is-open` were toggling
  correctly (Playwright's `.isVisible()` doesn't catch ancestor-overflow clipping, only a real
  screenshot or a bounding-box comparison against the clipping ancestor does — that's how this one
  was actually confirmed, not just inferred). Fixed by portaling `.nav-dropdown` panels out to be
  direct children of `.nav` itself (not `.nav-item`) — see `buildTopNav()` in app.js and the
  `.nav-dropdown` comment in styles.css. Because that breaks the ancestor/descendant relationship
  the old pure-CSS `:hover` cascade relied on, show/hide + position are now handled in JS
  (`mouseenter`/`mouseleave` + a shared close-delay so moving the cursor from the trigger down into
  the now-sibling panel doesn't immediately close it — see the `closeTimer` comment in the same
  function). If you ever add another `overflow-x`-only container, check whether anything
  absolutely-positioned needs to escape it vertically before assuming `overflow-y` stayed `visible`.
- **A same-document hash change (`services.html#a` → `services.html#b`) does not reload the page
  or re-run any script.** That's spec behavior, not a bug — but it means anchor targets that only
  exist because JS injected them (services.html's `#brokerage`/`#management`/`#investment` ids,
  set via `card.id = s.id` in `buildServices()`) won't get the browser's native scroll-into-view
  treatment on a same-page hash click, only on a fresh navigation, and even a fresh navigation can
  race the injection (the browser tries to scroll to the id before `buildServices()` has created
  it yet). Fixed with `scrollToHashTarget()` in app.js — called once at the end of
  `renderServicesPage()` (covers the fresh-navigation race, via `requestAnimationFrame`) and again
  from a `hashchange` listener registered in the same function (covers the same-document case).
  If you add more JS-injected anchor targets elsewhere, this is the pattern to reuse rather than
  relying on native anchor scrolling.

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

Complete and verified: all eleven pages (see Architecture), tiered pricing with event
**packages**, the event-type picker, 24h event flow, photo tour + lightbox, menu, reviews, map
embed, fees/policies, i18n, prominent + booking-adjacent currency/language switchers,
team/testimonials carousels (with repeating auto-nudge), categorized properties list, cross-page
nav on every dedicated page, privacy controls, image upload system, events calendar, an About
mission/story/values section, expanded Services detail pages, a Broker's Corner page, a shared
FAQ list, a persistent site-wide "Get in Touch" affordance, and a topic-selector on Contact.

Verified this session via a headless-Chromium/Playwright smoke pass across every page (booking
flow end-to-end including package selection + currency + language switch, plus a console-error
sweep) — see "Testing on this machine" above for how to repeat it.

**Most recent session:** a homepage hero visual-depth pass (see "Homepage hero redesign" above) —
badge pill, blurred glow shapes, a bigger headline, a glass-effect search bar, a staggered
load-time entrance for the hero content, and a floating glass-pill treatment for the nav while it's
transparent over the hero. Prompted by the client sharing a 21st.dev component and clarifying they
wanted the overall visual feel adapted to our brand, not the literal React/Tailwind code or exact
layout/copy — a standing instruction for how to handle any future design references they share.
Verified via Playwright: all hero content reaches `is-revealed` after load, the dropdown nav still
opens correctly on the new glass pill, the solidified (scrolled-past-hero) nav bar is pixel-clean
with no leftover pill styling once actually revealed (a transient "hump" only showed up in a
synthetic test that scrolled too fast and caught the nav mid-`nav--hidden`, not a real bug), the
properties.html tall-section scroll regression check (0 stuck/low-opacity elements, since this
touched reveal-related CSS), an 11-page real-`pageerror` sweep (all clean), and a mobile-viewport
check (no horizontal overflow, badge/headline/pill-nav all render correctly at 390px).

**Previous session:** a client feedback/bugfix round on the live-pushed site (Netlify still not
connected, so "live" here means the client pulled the branch locally and ran it). Four real
findings: (1) the desktop dropdown nav (About/Services) never actually opened — root-caused to the
`overflow-x`/`overflow-y` CSS gotcha documented above, fixed by portaling dropdown panels out of
the scrollable `.nav__right-track`; (2) the logo's floating card was reverted to always-on (see the
`.brand-float` section above) after the client reported it losing its frame while scrolling — the
prior hysteresis-based melt turned the card off for nearly the entire scroll depth of every page,
not just briefly near a hero boundary; (3) `.contact-float` had a genuine CSS bug (a stray
underline drawn by the ancestor `<a>`, invisible until hover's `translateY` exposed it — see the
"reach out" paragraph above) and was rebuilt from a single pill into a WhatsApp-icon + "Get in
Touch" cluster, the latter opening a new quick-contact modal (`initQuickContact()`) instead of
always navigating to contact.html; (4) `initScrollReveal()`'s single-block 30px fade was called out
as too subtle to notice — reworked to stagger each section's own direct content chunks in via a
`--reveal-i`-driven delay, plus the `.eyebrow` accent line growing from 0 width as an explicit
"new section" cue (see the scroll-reveal comment in styles.css/app.js). Also removed a stray empty
`git` file that had been accidentally committed at the repo root in an earlier round. Verified via
Playwright: the dropdown opens/is visible/its link navigates correctly (confirmed via a real
bounding-box check against the clipping ancestor, not just `.isVisible()`), the logo card is now
present at every scroll depth on both overlay and non-overlay pages, the contact-float WhatsApp
link has no stray underline and the quick-contact modal opens/validates/submits, staggered
`.reveal-item` elements render with the expected per-chunk delays, the same properties.html
tall-section down-then-up regression check from prior rounds (0 stuck/low-opacity elements either
direction), and an 11-page mobile-viewport pass (390px) confirming `.contact-float` stays hidden,
no horizontal overflow anywhere, and the hamburger accordion opens cleanly. Not yet re-confirmed
against a live newlevelassociates.com pull, and not yet pushed live to Netlify.

**Previous session:** migrated real wording from the client's existing site
(newlevelassociates.com, via saved HTML files the client sent — see "Content migrated from the
live site" below) into mission/story/values, Shelley Lozier's real title (Founder & Principal
Broker, not the old placeholder "Point of Contact"), expanded Services copy, real event-naming
style, and two genuinely new pages built from that same source content: Broker's Corner and FAQ.
Alongside that, resolved four IA/motion requests from the client: (1) nested new pages into the
About/Services dropdowns instead of growing the top nav flat; (2) added the persistent
`.contact-float` "Get in Touch" pill plus a topic-chip selector on contact.html so "reach out"
isn't property-inquiry-only; (3) moved the homepage Services section up (right after About, ahead
of Team/Testimonials/Events) so the page reads as full-service, not just a listings search tool;
(4) reworked nav-solidify/logo behavior to hysteresis (stays solid through a partial scroll-up,
only releases at the very top) with the logo melting into the solid bar's chrome rather than
floating a redundant white card on top of it, and changed both the carousel auto-nudge and
section scroll-reveal from one-shot to repeat-on-every-visit. Verified via Playwright: the
nav/logo hysteresis across 8 scroll positions, a full-height scroll-down-then-up regression pass
on properties.html's tall results container (the exact area the scroll-reveal threshold bug hit
before — see the gotcha above) with 0 stuck/invisible elements in either direction, the
same-document hash-scroll fix for services.html's anchors, a 10-point structural/content check
covering the nav restructure/new pages/FAQ/contact topics/about content/homepage reordering/
footer links/contact-float placement/team title, and an 11-page console-error sweep (clean aside
from expected sandbox-only noise: Google Fonts blocked, `/api/images` 404 since no Netlify
function runs under the local `http.server`). Not yet re-confirmed against a live
newlevelassociates.com pull for any pages beyond what was captured this round, and not yet pushed
live to Netlify.

**Content migrated from the live site:** the client sent saved HTML files from
newlevelassociates.com's About/Our Story, Services, and other pages (direct `fetch` still returns
HTTP 403 to this environment — bot protection — so this was the workaround). Extracted via a
custom Python/BeautifulSoup script and used to migrate real wording (not layout/design — the
client was explicit: "we're not changing ours to look like this, we're just grabbing the things
from over there") into mission/story, values, Shelley's title, services long-copy + capability
lists, FAQs, and Broker's Corner intro/bio. Two things confirmed **not** to exist anywhere in
extractable text on the live site: a real team roster beyond Shelley (checked all image `alt`
text on the Our Story page — only camera-filename or generic "Slide N" alts, no other names/
roles/bios), and Step 4 of the Investment page's "How We Work" list (genuinely skips 3→5 on the
live site itself — not replicated in our version, which uses an unnumbered list instead). Real
contact info was also mentioned during this exchange (`info@Newlevelassociates.com`,
`1.800.997.3992`) but the client has not yet explicitly confirmed swapping it in — the placeholder
email is still live pending that decision. Worth a fuller pull covering the rest of the site once
it's reachable from wherever this runs next, or once the client can share more saved pages.

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
