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
is a persistent "Get in Touch" pill, fixed top-right, rendered on every page except contact.html
itself (would be redundant there) and hidden below 640px (mobile has the hamburger + in-page CTAs
for this instead — see `@media (max-width:640px)` in styles.css). It mirrors `.brand-float`'s
fixed positioning on the opposite side and is driven by the same `initNavScroll()` top-offset/
hide-on-scroll logic (`contactFloat` alongside `brandFloat` in that function) so the two stay in
sync as the demo banner/nav show and hide. Separately, contact.html itself now opens with a
`CONTACT_TOPICS` chip selector (`buildContactTopics()`) so "reach out" isn't implicitly
property-inquiry-only — a visitor can flag *why* they're reaching out (property / investment /
management / events / join the team / general) before the point-of-contact card. `?topic=<id>`
preselects a chip (e.g. the footer's "Join Our Network" link is `contact.html?topic=join`).

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

**The logo's white background is permanent — don't fade it to transparent on scroll.**
`assets/logo.png` is fully opaque (baked-in white background, no transparency), so
`.brand__logo-slot` must always render on solid white. An earlier version faded that background
away once the nav solidified, on the theory that a solid nav bar directly behind the logo made a
white backing redundant — true when the logo lived inside the nav, false now that it's an
independent `position:fixed` element drifting over whatever page content has scrolled underneath
it (off-white `.paper-2` alternating sections, dark bands like `.event-cta`, etc.). Reintroducing
a fade-on-solid-*background* rule reintroduces that bug: the logo's own opaque white rectangle
shows up as a mismatched box against anything that isn't pure white. What *does* now toggle is
described next.

**Nav solidify/logo-melt now has hysteresis, and only the logo's card *chrome* toggles, never its
background.** The client asked for two things: (1) once the transparent-over-hero nav solidifies
on scroll-down, it should stay solid through the whole climb back up and only go transparent again
right at the very top — not flip back the instant you cross the same threshold going up; (2) the
floating logo should visually "melt" flush into that solid white bar (lose its separate
card/shadow) rather than read as a second white panel stacked on top of it, and pop back out as
its own distinct floating card only once the bar itself goes transparent over the hero.
`initNavScroll()` in app.js implements both:
- A `solid` boolean uses two different thresholds depending on direction — flips to `true` only
  when `y > solidifyAt` (`heroH - 90`, scrolling down) and flips to `false` only when
  `y <= desolidifyAt` (`40`, scrolling up) — so a partial scroll-up that doesn't reach the top
  leaves `solid` (and everything derived from it) unchanged. Don't collapse this back to a single
  shared threshold; that's what caused the original flicker.
- `.brand-float--card` is toggled as `!solid` (present when the bar is transparent, absent when
  solid) and controls *only* `border-radius`/`padding`/`box-shadow` on `.brand__logo-slot` — the
  base (no-modifier) rule is flush (`border-radius:0; padding:0; box-shadow:none`) so the logo
  reads as part of the solid bar, and the modifier adds the rounded/padded/shadowed "floating
  card" look. The white *background* itself is never conditional on this class — see the
  paragraph above for why. If you need to touch this again, `.brand-float` in styles.css (for what
  the classes render) and `initNavScroll()` in app.js (for when they're applied) are the only two
  places to touch, same as before.
- `.contact-float` (see the "reach out" paragraph above) shares the same fixed top-offset
  bookkeeping in `initNavScroll()` as `.brand-float`, so the two stay vertically in sync as the
  demo banner/nav show and hide, but it has no card-chrome toggle of its own — it's a simple pill,
  not a logo.

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

**Most recent session:** migrated real wording from the client's existing site
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
