# New Level — demo site

Brand-first demo for **New Level** (Miami real estate group) and its first property,
**1331 NW 87th Street**. **Demo build — not live.** Imagery, availability and rates are
illustrative placeholders; the flow captures *inquiries*, never bookings or payments.

## Run it
Open **`index.html`** in a browser. No server, no build step, no dependencies.

## Deploy (share for feedback)
Static site — no build step, all paths relative. **Netlify Drop:**
1. Go to **https://app.netlify.com/drop**
2. Drag this whole folder (`87th Street Landing Page Demo`) onto the page.
3. You get a live `https://<random-name>.netlify.app` URL in ~30 seconds. Share that.

### Photos: upload none, or upload your own
`PHOTO_SOURCE` at the top of `content.js` controls where the 39 property photos come from:

| Mode | What happens | Deploy size |
|------|--------------|-------------|
| `"remote"` *(default)* | Photos stream from the photographer's gallery CDN. **You can delete/skip `assets/photos/` entirely** — the site is fully functional without it. | **~282 KB** |
| `"local"` | Photos load from `assets/photos/` (`00.jpg`…`38.jpg`). Use once you've uploaded them yourself or swapped in new ones. | ~6.6 MB |

**If your upload tool limits image count/size:** leave it on `"remote"` and deploy without
`assets/photos/`. Verified working with the folder completely absent — every photo, the hero tour,
and the lightbox all load. (`assets/logo.png`, 40 KB, is still needed either way.)

**Adding your own images later:** drop files named `00.jpg`–`38.jpg` into `assets/photos/` and flip
`PHOTO_SOURCE` to `"local"`. You can do this a few at a time — **any photo that isn't there yet
automatically falls back to the CDN copy**, so the site never shows a broken image mid-migration.

## Image edit mode — click-to-upload (no code, no redeploy)
Add **`?edit=1`** to any page URL (e.g. `…netlify.app/index.html?edit=1`). An **Upload** badge appears
on every image on the site; click one, pick a file, and it swaps in immediately.

- **Where badges appear:** nav + footer logo, landing hero background, team photos, event tiles,
  every one of the 39 property photos (the hero tour badge targets whichever photo you're on),
  the overview photo, property cards, floor plan, and the "other properties" cards.
- **It's per-image and global:** replacing photo `00` updates it everywhere it's used — hero, the
  property card on `properties.html`, the lightbox — automatically.
- **Uploads are downscaled** (max 1600px, JPEG) and saved in your browser's `localStorage`, so they
  survive reloads and page navigation. If storage fills up it retries smaller and warns you.
- **Visitors never see any of it.** Edit mode lives in `sessionStorage`, only switched on by
  `?edit=1`. Without that flag there are no badges and no toolbar.
- **Toolbar** (bottom of screen): shows how many images you've replaced, plus
  **Export** · **Reset** · **Exit**.

### Publishing: making uploads live for everyone
There's a small backend (`netlify/functions/images.mjs`) using **Netlify Blobs** — Netlify's built-in
storage, no third-party account. When it's available, uploads **publish instantly to every visitor**.

The toolbar shows which mode you're in:

| Status pill | Meaning |
|---|---|
| **publishing live** | Signed in — uploads go straight to the shared store, everyone sees them. |
| **sign in to publish** | Backend is up; click the pill and enter your admin token. |
| **local only** | No backend (e.g. a Drop deploy). Uploads stay in your browser; use **Export**. |

Buttons: **Publish** (push anything still local to the shared store) · **Export** (download as files)
· **Reset** (clear yours *and* the live ones) · **Exit**.

### ⚠️ Setup required for live publishing
Live uploads need Netlify to install the function's dependency, which **Netlify Drop cannot do** —
drag-and-drop only serves static files. Deploy from Git instead:

1. Put this folder in a GitHub repo.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
   `netlify.toml` already sets `command = "npm install"` and the functions directory.
3. Netlify → **Site configuration → Environment variables** → add **`ADMIN_TOKEN`** with any strong
   value you choose. **Writes are refused until this is set**, so a public feedback link can't be
   defaced by visitors.
4. Open `…/index.html?edit=1`, click **sign in to publish**, paste that token, and upload away.

Still fine on Netlify Drop — you just get the local-only + **Export** flow described above, and the
site behaves identically otherwise (it detects the missing API and falls back silently).

### Committing images permanently (optional)
Export downloads your replacements as real files: photos land as `00.jpg`, `12.jpg`… (drop into
`assets/photos/`, then set `PHOTO_SOURCE = "local"`), the logo as `logo.png`, and other slots as
`team-1.jpg`, `event-2.jpg`, etc. Useful when you want images in the repo rather than in blob storage.

Optional: *Site configuration → Change site name* for a cleaner URL. To update, drag the folder
again (or use the "Deploys" tab). Works the same on Vercel, Cloudflare Pages, or GitHub Pages.

**Included for hosting:** `netlify.toml` (noindex + security headers, long-cache for photos) and
`robots.txt` (Disallow all). Every page also carries `<meta name="robots" content="noindex, nofollow">`
so the demo stays out of search results — anyone with the link can still view it.

**Note:** forms are in demo mode — submissions show the confirmation but aren't delivered. Set
`INQUIRY_ENDPOINT` in `content.js` (Formspree URL / CRM webhook) if you want reviewer submissions
to actually reach you.

## Flow / pages
```
index.html          New Level brand landing (hero · About · purpose icons · team · placeholders)
   │  (pick a purpose)                         └─ "Learn more" → about.html
   ▼
properties.html?a=… Property-list filtered by purpose (one card: 87th St)
   │  (pick the property)
   ▼
property.html?a=…   The property page, purpose already known → shows that content
```
**Landing sections (top→bottom):** Hero → **About New Level** → purpose selector → **Meet the Team**
→ **Services** → **Testimonials** → **Events**. The Services copy, About mission, and Testimonials
(Sandra L., Marcus W., David R.) are **drawn from the live newlevelassociates.com site**; team photos
and the events gallery/video remain placeholders.

**Nav:** the New Level logo is **centered** and larger (60px); the **menu button + back arrow are
grouped on the left** (`.nav__left`), page links on the right — a 3-column grid across all pages.

**Back navigation:** every forward screen has a visible in-page back arrow —
properties → landing, property → its purpose list (or landing on direct entry), about → landing.

**Property page sections** (listing-site style, our own execution): brand strip ·
**hero with embedded photo tour** (‹ › arrows step through all 39 photos, a counter, "View all
photos" → full-screen lightbox, and "Full album" → external gallery — all alongside the address,
Check availability, **Share** and **Save**) · purpose selector → Overview · **Highlights** ·
What's included · How it works · **Availability + tiered quote** (moved up, right after How it works)
· **Floor plan** (placeholder) · **Neighborhood** (placeholder map → Google Maps + audience-relevant
"what's nearby") · **Fees & policies** (included vs. extra, house rules, cancellation — `$XXX · TBD`)
· Inquiry · FAQ · About.
- **Share** uses the native share sheet, falling back to copy-link + toast. **Save** persists in
  `localStorage` (button flips to "Saved").
- **Hero tour reveal:** the first arrow click swipes the hero text/CTAs away and clears the gray
  overlay to show the clean full-bleed photo (starting at the front-of-property shot); arrows then
  step through all 39; a "Back" control restores the intro.
- **Sticky booking bar:** a slim bar slides up along the bottom while scrolling the content (the
  floaters lift above it), mirroring the live quote and offering "Choose your dates" → the calendar.
  It hides once the availability section is reached.
- **Guided flow (no skipping):** the quote's Continue goes to Floor plan → Neighborhood → Fees (not
  straight to the form); the Fees section ends with "Continue to inquiry."
- **Trust disclosure** in the quote: **$0 due today**, and **free cancellation until 1 day before
  check-in** (date computed from the selected check-in).
- **Report a problem** button in the footer (all pages) opens a modal (issue type + details +
  optional email) that POSTs to `INQUIRY_ENDPOINT` — same live-vs-demo behavior as the inquiry form.

## Context-aware menu (all pages)
A **hamburger menu** (top-left, `buildMenu`) slides out with the current page's context, page-nav
links (Back / New Level home / All properties, per page), and an auto-collected **"On this page"**
list of every visible section — click to scroll, with the current section highlighted. Sections are
discovered from `section[id]` + their eyebrow label, so it stays in sync as content reveals. The
enlarged **nav logo** (48px) still returns to the landing.

## Reviews · Map · Other properties
- **Reviews** section: demo rating + verified-guest explainer + four audience-tailored reviews (`REVIEWS`).
- **Neighborhood map**: a real **Google Maps embed** with a location **pin** (via `output=embed`,
  no API key). The audience-aware "what's nearby" list sits beside it. *Multiple* pins (for nearby
  spots) would need the paid Maps Embed API key — noted, not built.
- **Other properties**: placeholder cards (`OTHER_PROPERTIES`) at the end, headline tailored to the
  chosen purpose. Real listings will slot in here later.

## Preferences & privacy (footer, all pages)
- **Currency** selector — functional demo conversion (`CURRENCIES`, base USD); every price re-prices live.
- **Language** selector — **real translations** for Español / Français / Kreyòl / Português (`I18N` in
  `content.js`, applied by `translatePage`): the UI chrome, section names, CTAs, footer, menu and
  form labels all switch and restore, and the choice persists. Long-form content (property
  descriptions, reviews, house rules) intentionally stays in English for the demo.
- **Your privacy choices** — a first-visit consent **banner** (Accept all / Only essential / Manage)
  plus a **modal** with per-category toggles (`PRIVACY_CATEGORIES`), privacy-preserving defaults,
  persisted in `localStorage`. No real trackers load (demo). Terms/Privacy live in the footer Legal column.

**Inquiry delivery (direct — no email app):** the form POSTs straight to `INQUIRY_ENDPOINT`
(`content.js`) and the visitor never leaves the page. Point it at a **Formspree** URL, a **CRM
inbound webhook**, or a Zapier/Make catch-hook to receive inquiries live. While it's empty (demo),
submitting shows the confirmation with an honest "no endpoint connected" note — no mail app, ever.
The form has full browser **autofill** enabled (`autocomplete="on"` + proper tokens; nothing is set
to `off`).
- *Similar properties* is intentionally **not** built — once >1 property is tagged for a purpose,
  the `properties.html` list screen already serves that role.
- **Long-term rental** is intentionally **out of scope** — no icon, no redirect, nothing built.
**Second entry point:** `property.html` with **no** `?a=` (e.g. from an ad for the property)
shows an **in-page "What brings you here?" selector**; picking a purpose reveals the
audience-specific content *without leaving the page* and updates the URL. A short New Level
brand strip + **About New Level** link (one-way → landing) sits at the top either way, so
direct-entry visitors get context without being forced back through the selector.

| File | Role |
|------|------|
| `index.html` | New Level brand landing (About, team, placeholders) |
| `about.html` | Fuller "About New Level" page (back arrow → landing) |
| `properties.html` | Purpose-filtered property list |
| `property.html` | The 87th St property page (two entry states) |
| `content.js` | Copy, icons, photos map, pricing tiers, add-ons, tax, footer data |
| `app.js` | Page renderers, in-page selector, calendar, tiered quote, form, footer |
| `styles.css` | Design system (tokens at top) |
| `assets/logo.png` | **Real** New Level logo (from the live site) |
| `assets/photos/` | 39 real property photos (`00`–`38`) |

## Pricing — two tiers, chosen by the guest (not by purpose)
Set in `RATE_TIERS` / `EVENT_ADDONS` (`content.js`). The booking section asks
**"single day/night rental, or multi-night stay?"** — independent of which purpose icon was used:
- **Event tier** — a **full 24-hour rental** → **$1,000 flat**. Guest picks **check-in and
  check-out dates *and* times** (default 3:00 PM → 3:00 PM next day); a **24-hour minimum** is
  enforced (a shorter window blocks the quote with a clear message). Shows a **services checklist**
  (Catering, Entertainment/DJ, Sound system, Content creation); each is *"I'll provide"* or *"New
  Level provides"*, the latter adding a **demo price** (Catering $850 · DJ $650 · Sound $400 ·
  Content $550) that folds into the total. Event rentals also carry a **refundable $500 security
  deposit** (a hold, explained in Fees; stays don't have one).
- **Stay tier** — multi-night → **$500/night**, clean nights × rate, no times, no add-ons.
- All figures are demo numbers and re-price live with the **currency selector** (see below).
Both apply the real 13% Miami-Dade lodging tax to the rental base; the 3% CDT stays flagged as unresolved.

> Note: your message also said "dial the rate to $750/night." The later tier spec ($1,000 event /
> $500 stay) is more specific and leaves no room for $750, so I treated the tiers as superseding it.
> If $750 should be one of the tiers, say the word.

## Brand green + surfaces
`--green: #72D35B` (`styles.css`) — the official New Level green, confirmed from the live logo, and
used consistently for every New Level accent (including the "Real Estate. Redefined." tagline text).
`--green-deep` (#4E9E3B) is used only for hover states; `--green-tint` for faint washes. The only
other green on the site is **WhatsApp's own #25D366** on the WhatsApp buttons (intentional).
The logo's white space is pure **#FFFFFF**, so every surface the logo sits on (nav, footer) is
`--true-white` #FFFFFF — no off-white seam.

## Wordmark (text lockup)
Where "New Level / Real Estate. Redefined." appears as text (`.wordmark`), "New Level" is dominant
and the tagline is tracked (justified) to span the same width beneath it, so it reads as one mark.

## Brand copy is geography-neutral
New Level *brand-level* copy says **"South Florida,"** never "Miami," so the format extends to
future properties. Property-specific copy (the 87th St hero, facts, audience blurbs) still names Miami.

## Logo lockup as text
Where the "New Level / Real Estate. Redefined." lockup appears as **text** (property About, about.html),
it uses the `.wordmark` component — "New Level" large, slogan smaller beneath — matching the logo.

## Point of contact
`PROPERTY.agent` = **Shelley Lozier** (demo). Phone / WhatsApp are still placeholders.

## Logo
`assets/logo.png` is the real New Level lockup (opaque white background, so it sits on white —
nav and footer are white). Nav 40px, footer ~77px. Swap the file to update everywhere.

## Footer
`buildFooter()` in `app.js`: centered logo, socials (IG/FB/TikTok), four columns
(Company/Services/Resources/Legal), **dynamic** `© <getFullYear()>`, plus **Equal Housing
Opportunity** statement + HUD icon and a visible **`License #[PLACEHOLDER]`** broker line.

## ⚠️ Placeholders to swap before launch
- Hero imagery/video on the landing (marked placeholder panel).
- **Reserved landing sections** (labeled, structure-only): Services copy, Testimonials, Events
  gallery/video. **Meet the Team** photos are placeholders; only Shelley Lozier is a real name.
- Agent phone / WhatsApp (`PROPERTY.agent`); **inquiry delivery** (`INQUIRY_ENDPOINT` — plug in
  Formspree / CRM webhook for live delivery; empty = demo).
- Event-tier upcharges (`+$XXX · TBD`); broker license #; social URLs (→ main site for now).
- Rates ($1,000 / $500) are placeholder demo numbers.
- **Property page:** floor plan (placeholder), neighborhood map (placeholder → Google Maps link)
  and "what's nearby" list, and Fees & policies dollar figures (`$XXX · TBD`).
