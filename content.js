/* =========================================================================
   Content model — 1331 NW 87th Street / New Level Executive House
   All rates are PLACEHOLDER (Brief Section 6). Copy is illustrative.
   ========================================================================= */

/* ---- SVG icons: black line by default, page CSS turns them green on
   hover/selected. Each is a distinct SHAPE per audience (Section 5),
   NOT color-coded (Section 12). stroke=currentColor so state = color. ---- */
const ICONS = {
  // 1. Corporate — skyline / briefcase hybrid (skyline chosen: business district)
  corporate: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 42h40"/><rect x="7" y="22" width="10" height="20" rx="1"/><rect x="19" y="12" width="10" height="30" rx="1"/><rect x="31" y="26" width="10" height="16" rx="1"/>
    <path d="M10 27h4M10 32h4M10 37h4M22 17h4M22 22h4M22 27h4M22 32h4M22 37h4M34 31h4M34 36h4"/></svg>`,

  // 2. Family — house sheltering a group of people
  family: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 22 24 8l18 14"/><path d="M9 20v20h30V20"/>
    <circle cx="19" cy="28" r="2.6"/><circle cx="29" cy="28" r="2.6"/>
    <path d="M15 40v-3a4 4 0 0 1 8 0v3M25 40v-3a4 4 0 0 1 8 0v3"/></svg>`,

  // 3. Private events — toast / celebration (two glasses), avoids anything childish
  events: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 8l5 12a5 5 0 0 1-10 0z"/><path d="M12 25v11M8 40h8"/>
    <path d="M36 8l-5 12a5 5 0 0 0 10 0z"/><path d="M36 25v11M32 40h8"/>
    <path d="M17 11h14"/><path d="M23 5v3M27 6l-1 2M20 6l1 2"/></svg>`,

  // 4. Church & ministry — a GATHERING of people under a welcoming arc.
  //    Deliberately NO cross (Section 5) — kept open across ministry
  //    traditions. FLAG: Jack has more direct context on this audience —
  //    confirm this reads right before finalizing.
  ministry: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 13a21 21 0 0 1 30 0"/>
    <circle cx="24" cy="21" r="4.2"/><circle cx="12.5" cy="24" r="3.4"/><circle cx="35.5" cy="24" r="3.4"/>
    <path d="M17 42v-6a7 7 0 0 1 14 0v6"/>
    <path d="M6 42v-4a5.5 5.5 0 0 1 8.5-4.6"/>
    <path d="M42 42v-4a5.5 5.5 0 0 0-8.5-4.6"/></svg>`,

  // 5. Extended stays — suitcase / calendar-with-house (calendar+house chosen)
  extended: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="7" y="11" width="34" height="30" rx="3"/><path d="M7 19h34M16 7v8M32 7v8"/>
    <path d="M18 34 24 29l6 5"/><path d="M20 34v-3h8v3"/></svg>`,
};

/* small inline glyphs reused across amenity lists / floaters */
const GLYPH = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  arrowL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  arrowR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.004c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.04-.98.22-3.3-.69-2.78-1.1-4.56-3.94-4.7-4.12-.14-.18-1.13-1.5-1.13-2.87 0-1.36.72-2.03.97-2.31.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.55.8 1.9.87 2.04.07.14.11.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.18-.2.69-.8.87-1.08.18-.28.36-.23.6-.14.25.09 1.57.74 1.84.87.27.14.45.2.51.32.07.11.07.66-.17 1.34Z"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>`,
};

/* =========================================================================
   New Level Group — official brand logo (real asset).
   Downloaded from the live site (newlevelassociates.com). Horizontal
   lockup: black interlocking mark + "NEW LEVEL" + green tagline.
   Note: opaque white background — place on white surfaces only.
   ========================================================================= */
const LOGO_SRC = "assets/logo.png";

/* Social links — hrefs are PLACEHOLDERS (point to the main site). Swap in
   the real Instagram / Facebook / TikTok URLs before launch. */
const SOCIALS = [
  { name: "Instagram", href: "https://newlevelassociates.com", icon:
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2Zm0 3.05A6.75 6.75 0 1 0 18.75 12 6.75 6.75 0 0 0 12 5.25Zm0 11.13A4.38 4.38 0 1 1 16.38 12 4.38 4.38 0 0 1 12 16.38Zm6.99-11.4a1.58 1.58 0 1 1-1.58-1.57 1.58 1.58 0 0 1 1.58 1.57Z"/></svg>` },
  { name: "Facebook", href: "https://newlevelassociates.com", icon:
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>` },
  { name: "TikTok", href: "https://newlevelassociates.com", icon:
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3 0-2.5-.4-3.5-1.1v5.9c0 3.3-2.5 5.7-5.7 5.7A5.6 5.6 0 0 1 5.3 14c0-3.1 2.6-5.6 6-5.2v2.7c-.4-.1-.8-.2-1.2-.2-1.5 0-2.6 1.2-2.6 2.7 0 1.5 1.1 2.7 2.7 2.7 1.6 0 2.7-1.2 2.7-2.9V3h3.6Z"/></svg>` },
];

/* Footer navigation — EXACT structure from the live New Level site.
   Links point to the main site root (visible placeholders). */
const FOOTER_NAV = [
  { title: "Company",   links: ["About Us", "Agents & Partners", "Contact", "Join Our Network"] },
  { title: "Services",  links: ["Brokerage & Consulting", "Property Management", "Investment", "Events & Networking"] },
  { title: "Resources", links: ["The Broker's Corner", "FAQs", "Property Portfolio"] },
  { title: "Legal",     links: ["Privacy Policy", "Terms of Use", "Risk Disclosure"] },
];

/* Full photo album (client gallery) + on-page photo assignments. */
/* =========================================================================
   PHOTO SOURCE — where the 39 property photos load from.
     "remote" → straight from the photographer's gallery CDN. Nothing to
                upload; the site deploys at ~250KB. (Default.)
     "local"  → from assets/photos/ (00.jpg … 38.jpg). Use this once you've
                uploaded the images yourself, or if you swap in new ones.
   Switch by changing this one line. If a local file is missing, the page
   automatically falls back to the CDN copy so nothing ever breaks.
   ========================================================================= */
const PHOTO_SOURCE = "remote";     // "remote" | "local"

const PHOTO_BASE = "assets/photos/";
const PHOTO_CDN = "https://storage.onecloudpro.com/images/la-chatte-productions/";
const PHOTO_CDN_SUFFIX = ".jpg?w=1600&format=jpeg";
/* CDN filename per photo index (00–38) */
const PHOTO_CDN_IDS = [
  "d48fa2049d56caf8e9941957a764a891c749daa8", "a44389cd9446ccb2d92fc1472ac5c653e2e6944b",
  "2ea2694a114756ad00ec6f653809f72544660b82", "e4508a785184933904843d328e5f82701f8cc5ca",
  "2eec1532c4a4ef7c854064ab3a46e8acd2ad13f0", "8038d25d558e3bd094d4addffb8d036be578a58d",
  "020921d0f202236a24cdddcc1f164b0658c5d8ea", "7b131ff3f8c57a8eb3d25f1a103353688bcd2bd2",
  "0ce178f471cf055e62818847a20f86434f879774", "aa415bf220d08170294e02fa6f0ae429a01a15f1",
  "bc91fa823cc59b2103e192a9d481846b0915c4c6", "ec52f8350e6183b769fa8665f0227b26708bfcaf",
  "d4c8cc348055f7d7b2860748f455d130193a426c", "c6dddd51a6b7207558723367071695490f4d9677",
  "fae8389b3ca10dd7fc81e6d26e3cdfa3e80350e5", "98a68190415024c945085ec47eb9db5b765fa829",
  "0fc14d107525ecaba1ac566b64509453e41bb45b", "fa03eac2f1e5563f80d75d1596fa0805a9928421",
  "0cff113bcc98169647f1d9eee39e97c9b4d03cdf", "db0a37099436c3f827ba0d1b09ae73543f3e387e",
  "5cdafa6f888f855a3aa9ae8b56d2180f4d53a9f5", "75b6d3a6acee17e9915172c95f2808dbe327f8c0",
  "dd24b462b074c5edee0e237ac087acd724a91e15", "73dab50e827351ec9aa327ddfab155038116d18e",
  "cc8d86034891f4c515750f6ff4c5aa9de6275ef9", "28bd8428a38e4a3a38b3e48995a186dba741223b",
  "8e41d03ea0149716d7cee8260063c446c6568796", "5278819b0f751703686d2633f60240df5b72dc5e",
  "e21a97a0b54de2dd61c603265961e30f913ca069", "603420e6b89cdfe9fef077d7b606a6d57d866c26",
  "a5dcfa469b9fbed853293aa7b78670cad41192ae", "fbb7f1673cacd47c0a031115ad5ad5fa07e16726",
  "a8fcdc815fa6cc9475cea29d9238b1cc1096af25", "f98c9aab60c255d5d40ee792d90df7afe766b4cf",
  "68bf50fb78ce71d3922ff378c8c1e32e3ae99c7f", "82d1fe4442d29c2c764cf6052136a1efb4c2dc93",
  "6f6c3e16fcba75b94dd501fbd41fd0a744158965", "70cf0d819e4b4754160bf35b238a804fa7172722",
  "b479ee44bd98a87a3c805d7315a4d5d2ab79bb96",
];
const GALLERY_URL = "https://la-chatte-productions.client-gallery.com/gallery/1331-nw-87th-st-final";
const SELECTOR_HERO = "00";
const GALLERY_STRIP = ["00", "09", "11", "06", "24", "34", "02", "03"]; // teaser row

/* Per-audience real photography (indices into assets/photos/NN.jpg). */
const AUDIENCE_PHOTOS = {
  corporate: { hero: "06", overview: "03" },
  family:    { hero: "00", overview: "09" },
  events:    { hero: "11", overview: "09" },
  ministry:  { hero: "12", overview: "16" },
  extended:  { hero: "02", overview: "34" },
};

/* Property highlights — short scannable standouts (separate from full amenities). */
const HIGHLIGHTS = [
  "Full private residence — the whole house is yours, not a shared venue",
  "Sleeps up to 16 across multiple bedrooms",
  "Chef's kitchen plus an entertainer's bar",
  "Pool, patio and mature tropical grounds",
  "Gated frontage with on-site parking",
  "Works for a single-day event or a multi-night stay",
];

/* Fees & policies — demo. Dollar specifics are clearly-marked PLACEHOLDERS. */
const FEES_POLICIES = {
  included: [
    "The full private residence for your dates",
    "Wi-Fi and utilities",
    "On-site parking",
    "Starter linens & essentials",
  ],
  extra: [
    { t: "Refundable security deposit", v: "$500 · event rentals only" },
    { t: "Cleaning fee",                v: "$150" },
    { t: "Event services (if New Level provides)", v: "$400–$850 each" },
    { t: "Lodging taxes",               v: "13% (shown in quote)" },
  ],
  houseRules: [
    { t: "Occupancy", d: "The home is rented for the group size agreed in your inquiry. Additional overnight guests aren't permitted without prior written approval." },
    { t: "Smoking & vaping", d: "Not permitted indoors anywhere. A designated outdoor area can be arranged on request." },
    { t: "Events & noise", d: "Amplified music must respect neighborhood quiet hours — after 10:00 PM on weekdays and 11:00 PM on weekends. Keep doors and windows closed during amplified sound." },
    { t: "Parking", d: "Use the driveway and on-site spaces first and keep neighbors' frontage and driveways clear. Overflow or valet parking can be arranged for larger events." },
    { t: "Pool & outdoor areas", d: "No lifeguard on duty — children must be supervised at all times, and glassware is discouraged poolside." },
    { t: "Pets", d: "By prior arrangement only. Service animals are always welcome." },
    { t: "Care of the home", d: "Please treat furnishings and finishes with care. Damage beyond normal wear may be applied to the security deposit." },
    { t: "Prohibited", d: "No illegal substances, no firearms, and no unpermitted commercial activity on the property." },
    { t: "Check-in & check-out", d: "Access runs only within your confirmed window; late departures may incur an additional charge." },
  ],
  rulesNote: "House rules shown here are typical examples for this kind of property — the final set is confirmed with your New Level contact before any booking.",
  cancellation: "Cancellation terms are being finalized — placeholder for this demo. Inquiries are not bookings; nothing is charged until terms are agreed in writing.",
};

/* Neighborhood / area — audience-relevant "what's nearby". Placeholder content. */
const NEIGHBORHOOD = {
  blurb: "The home sits in a quiet Miami-Dade residential pocket with quick access to the airport, highways and the city — easy for guests arriving from anywhere.",
  mapQuery: "1331 NW 87th St, Miami, FL 33147",
  nearby: {
    corporate: ["Meeting / coworking space", "Business dining & catering", "Airport ~15 min", "Hotels for overflow staff"],
    family:    ["Parks & kid-friendly spots", "Family dining", "Grocery & pharmacy", "Beaches ~25 min"],
    events:    ["Event rentals & vendors", "Florists & catering", "Guest & overflow parking", "Nearby hotels for guests"],
    ministry:  ["Overflow lodging for groups", "Group-friendly dining", "Ample parking", "Quiet green space"],
    extended:  ["Groceries & everyday errands", "Coffee & coworking", "Gym & pharmacy", "Transit & highways"],
  },
};

/* Reviews — DEMO content, tailored to New Level's audiences. */
const REVIEWS = {
  rating: 4.9,
  count: 27,
  howItWorks: "Reviews come from verified New Level guests after their stay or event. We show the guest's first name, the month they visited, and what they used the home for — no anonymous or incentivized reviews.",
  items: [
    { name: "Marcus T.",        when: "June 2026",  use: "Corporate retreat",  stars: 5, text: "Ran a three-day leadership offsite here. The breakout spaces and fast Wi-Fi meant we never had to leave — and the team actually enjoyed the downtime by the pool." },
    { name: "The Reyes Family", when: "May 2026",   use: "Family reunion",     stars: 5, text: "Twelve of us under one roof for a long weekend. Everyone had space, the kitchen handled our big dinners, and the kids basically lived in the backyard." },
    { name: "Danielle P.",      when: "April 2026", use: "Milestone birthday", stars: 5, text: "Hosted a 40th here and it felt like a private venue, not a rental. Shelley was responsive from the first message to checkout." },
    { name: "Pastor J. Alvarez",when: "March 2026", use: "Ministry retreat",   stars: 4, text: "Quiet, comfortable, and room for our whole group to gather and break out. A calm place to reset for the weekend." },
  ],
};

/* Other New Level properties — PLACEHOLDERS (no real second listing yet). */
const OTHER_PROPERTIES = [
  { title: "Bay Harbor villa",     meta: "Sleeps 10 · Waterfront",  rate: "from $600 / night", soon: true },
  { title: "Wynwood loft",         meta: "Sleeps 6 · Events",       rate: "from $900 / day",   soon: true },
  { title: "Coral Gables estate",  meta: "Sleeps 20 · Retreats",    rate: "from $750 / night", soon: true },
];

/* Currency — DEMO conversion rates (base USD). */
const CURRENCIES = {
  USD: { symbol: "$",   rate: 1,     label: "USD $" },
  EUR: { symbol: "€",   rate: 0.92,  label: "EUR €" },
  GBP: { symbol: "£",   rate: 0.79,  label: "GBP £" },
  CAD: { symbol: "C$",  rate: 1.37,  label: "CAD C$" },
  MXN: { symbol: "MX$", rate: 17.0,  label: "MXN MX$" },
};

/* Language options. */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ht", label: "Kreyòl Ayisyen" },
];

/* Translations — UI chrome, headings, CTAs, labels. Keyed by the English text.
   Long-form content (property descriptions, reviews, rules) stays in English. */
const I18N = {
  // nav / common
  "Properties": { es: "Propiedades", fr: "Propriétés", pt: "Imóveis", ht: "Pwopriyete" },
  "About": { es: "Nosotros", fr: "À propos", pt: "Sobre", ht: "Sou nou" },
  "Team": { es: "Equipo", fr: "Équipe", pt: "Equipe", ht: "Ekip" },
  "Contact": { es: "Contacto", fr: "Contact", pt: "Contato", ht: "Kontak" },
  "About New Level": { es: "Sobre New Level", fr: "À propos de New Level", pt: "Sobre a New Level", ht: "Sou New Level" },
  "All purposes": { es: "Todos los propósitos", fr: "Tous les usages", pt: "Todos os propósitos", ht: "Tout rezon yo" },
  "All properties": { es: "Todas las propiedades", fr: "Toutes les propriétés", pt: "Todos os imóveis", ht: "Tout pwopriyete yo" },
  "New Level home": { es: "Inicio de New Level", fr: "Accueil New Level", pt: "Início da New Level", ht: "Akèy New Level" },
  "Back to New Level": { es: "Volver a New Level", fr: "Retour à New Level", pt: "Voltar para a New Level", ht: "Retounen nan New Level" },
  "‹ Back": { es: "‹ Atrás", fr: "‹ Retour", pt: "‹ Voltar", ht: "‹ Retounen" },
  "‹ New Level home": { es: "‹ Inicio de New Level", fr: "‹ Accueil New Level", pt: "‹ Início da New Level", ht: "‹ Akèy New Level" },
  // hero + about
  "Spaces for the moments that matter.": { es: "Espacios para los momentos que importan.", fr: "Des espaces pour les moments qui comptent.", pt: "Espaços para os momentos que importam.", ht: "Espas pou moman ki enpòtan yo." },
  "Find your space": { es: "Encuentra tu espacio", fr: "Trouvez votre espace", pt: "Encontre seu espaço", ht: "Jwenn espas ou" },
  "Real estate, redefined.": { es: "Bienes raíces, redefinidos.", fr: "L'immobilier, redéfini.", pt: "Imóveis, redefinidos.", ht: "Byen imobilye, redefini." },
  "Learn more ›": { es: "Saber más ›", fr: "En savoir plus ›", pt: "Saiba mais ›", ht: "Aprann plis ›" },
  // selector + audiences
  "Choose your purpose": { es: "Elige tu propósito", fr: "Choisissez votre usage", pt: "Escolha seu propósito", ht: "Chwazi rezon ou" },
  "What are you planning?": { es: "¿Qué estás planeando?", fr: "Que planifiez-vous ?", pt: "O que você está planejando?", ht: "Kisa w ap planifye?" },
  "Corporate Retreats & Business Meetings": { es: "Retiros corporativos y reuniones de negocios", fr: "Retraites d'entreprise et réunions d'affaires", pt: "Retiros corporativos e reuniões de negócios", ht: "Retrèt antrepriz ak reyinyon biznis" },
  "Family Gatherings": { es: "Reuniones familiares", fr: "Réunions de famille", pt: "Encontros familiares", ht: "Rasanbleman fanmi" },
  "Private Events": { es: "Eventos privados", fr: "Événements privés", pt: "Eventos privados", ht: "Evènman prive" },
  "Church & Ministry Retreats": { es: "Retiros de iglesia y ministerio", fr: "Retraites d'église et de ministère", pt: "Retiros de igreja e ministério", ht: "Retrèt legliz ak ministè" },
  "Extended & Vacation Stays": { es: "Estancias prolongadas y vacacionales", fr: "Séjours prolongés et de vacances", pt: "Estadias prolongadas e de férias", ht: "Sejou pwolonje ak vakans" },
  // landing sections
  "Meet the team": { es: "Conoce al equipo", fr: "Rencontrez l'équipe", pt: "Conheça a equipe", ht: "Rankontre ekip la" },
  "The people behind New Level.": { es: "Las personas detrás de New Level.", fr: "Les personnes derrière New Level.", pt: "As pessoas por trás da New Level.", ht: "Moun ki dèyè New Level yo." },
  "Services": { es: "Servicios", fr: "Services", pt: "Serviços", ht: "Sèvis" },
  "What we do.": { es: "Lo que hacemos.", fr: "Ce que nous faisons.", pt: "O que fazemos.", ht: "Sa nou fè." },
  "Testimonials": { es: "Testimonios", fr: "Témoignages", pt: "Depoimentos", ht: "Temwayaj" },
  "What clients say.": { es: "Lo que dicen los clientes.", fr: "Ce que disent les clients.", pt: "O que os clientes dizem.", ht: "Sa kliyan yo di." },
  "Events": { es: "Eventos", fr: "Événements", pt: "Eventos", ht: "Evènman" },
  "Come hang out with us.": { es: "Ven a pasar el rato con nosotros.", fr: "Venez passer du temps avec nous.", pt: "Venha passar um tempo com a gente.", ht: "Vin pase tan avèk nou." },
  // footer
  "Company": { es: "Empresa", fr: "Entreprise", pt: "Empresa", ht: "Konpayi" },
  "Resources": { es: "Recursos", fr: "Ressources", pt: "Recursos", ht: "Resous" },
  "Legal": { es: "Legal", fr: "Mentions légales", pt: "Jurídico", ht: "Legal" },
  "About Us": { es: "Sobre nosotros", fr: "À propos", pt: "Sobre nós", ht: "Sou nou" },
  "Agents & Partners": { es: "Agentes y socios", fr: "Agents et partenaires", pt: "Agentes e parceiros", ht: "Ajan & patnè" },
  "Join Our Network": { es: "Únete a nuestra red", fr: "Rejoignez notre réseau", pt: "Junte-se à nossa rede", ht: "Antre nan rezo nou" },
  "Brokerage & Consulting": { es: "Corretaje y consultoría", fr: "Courtage et conseil", pt: "Corretagem e consultoria", ht: "Koutye & konsèy" },
  "Property Management": { es: "Administración de propiedades", fr: "Gestion immobilière", pt: "Gestão de imóveis", ht: "Jesyon pwopriyete" },
  "Investment": { es: "Inversión", fr: "Investissement", pt: "Investimento", ht: "Envestisman" },
  "Events & Networking": { es: "Eventos y networking", fr: "Événements et réseautage", pt: "Eventos e networking", ht: "Evènman & rezotaj" },
  "The Broker's Corner": { es: "El rincón del corredor", fr: "Le coin du courtier", pt: "O canto do corretor", ht: "Kwen koutye a" },
  "FAQs": { es: "Preguntas frecuentes", fr: "FAQ", pt: "Perguntas frequentes", ht: "Kesyon yo poze souvan" },
  "Property Portfolio": { es: "Portafolio de propiedades", fr: "Portefeuille immobilier", pt: "Portfólio de imóveis", ht: "Pòtfolyo pwopriyete" },
  "Privacy Policy": { es: "Política de privacidad", fr: "Politique de confidentialité", pt: "Política de privacidade", ht: "Politik konfidansyalite" },
  "Terms of Use": { es: "Términos de uso", fr: "Conditions d'utilisation", pt: "Termos de uso", ht: "Kondisyon itilizasyon" },
  "Risk Disclosure": { es: "Divulgación de riesgos", fr: "Divulgation des risques", pt: "Divulgação de riscos", ht: "Divilgasyon risk" },
  "Language": { es: "Idioma", fr: "Langue", pt: "Idioma", ht: "Lang" },
  "Currency": { es: "Moneda", fr: "Devise", pt: "Moeda", ht: "Lajan" },
  "Your privacy choices": { es: "Tus opciones de privacidad", fr: "Vos choix de confidentialité", pt: "Suas opções de privacidade", ht: "Chwa konfidansyalite ou" },
  "Report a problem": { es: "Reportar un problema", fr: "Signaler un problème", pt: "Relatar um problema", ht: "Rapòte yon pwoblèm" },
  // menu / purpose
  "On this page": { es: "En esta página", fr: "Sur cette page", pt: "Nesta página", ht: "Sou paj sa a" },
  "Tell us your purpose": { es: "Dinos tu propósito", fr: "Indiquez votre usage", pt: "Diga-nos seu propósito", ht: "Di nou rezon ou" },
  "What brings you here?": { es: "¿Qué te trae aquí?", fr: "Qu'est-ce qui vous amène ?", pt: "O que te traz aqui?", ht: "Kisa ki mennen ou la?" },
  "Change purpose": { es: "Cambiar propósito", fr: "Changer d'usage", pt: "Mudar propósito", ht: "Chanje rezon" },
  "Full album ›": { es: "Álbum completo ›", fr: "Album complet ›", pt: "Álbum completo ›", ht: "Album konplè ›" },
  "Back": { es: "Atrás", fr: "Retour", pt: "Voltar", ht: "Retounen" },
  // property sections
  "Overview": { es: "Resumen", fr: "Aperçu", pt: "Visão geral", ht: "Apèsi" },
  "Highlights": { es: "Destacados", fr: "Points forts", pt: "Destaques", ht: "Pwen enpòtan" },
  "What's included": { es: "Qué incluye", fr: "Ce qui est inclus", pt: "O que está incluído", ht: "Sa ki enkli" },
  "How it works": { es: "Cómo funciona", fr: "Comment ça marche", pt: "Como funciona", ht: "Kijan li mache" },
  "Availability & quote": { es: "Disponibilidad y cotización", fr: "Disponibilité et devis", pt: "Disponibilidade e orçamento", ht: "Disponiblite & pri" },
  "Floor plan": { es: "Plano", fr: "Plan", pt: "Planta", ht: "Plan kay la" },
  "Neighborhood": { es: "Vecindario", fr: "Quartier", pt: "Vizinhança", ht: "Katye" },
  "Reviews": { es: "Reseñas", fr: "Avis", pt: "Avaliações", ht: "Revi" },
  "Fees & policies": { es: "Tarifas y políticas", fr: "Frais et règles", pt: "Taxas e políticas", ht: "Frè & règleman" },
  "Inquiry": { es: "Consulta", fr: "Demande", pt: "Consulta", ht: "Demann" },
  "More New Level homes": { es: "Más casas de New Level", fr: "Plus de maisons New Level", pt: "Mais casas da New Level", ht: "Plis kay New Level" },
  // property CTAs / labels
  "Check availability": { es: "Ver disponibilidad", fr: "Voir les disponibilités", pt: "Ver disponibilidade", ht: "Gade disponiblite" },
  "Start here": { es: "Empieza aquí", fr: "Commencez ici", pt: "Comece aqui", ht: "Kòmanse la a" },
  "Send inquiry": { es: "Enviar consulta", fr: "Envoyer la demande", pt: "Enviar consulta", ht: "Voye demann" },
  "Explore New Level ›": { es: "Explora New Level ›", fr: "Découvrir New Level ›", pt: "Explorar a New Level ›", ht: "Eksplore New Level ›" },
  "View all photos": { es: "Ver todas las fotos", fr: "Voir toutes les photos", pt: "Ver todas as fotos", ht: "Gade tout foto yo" },
  "Choose your dates": { es: "Elige tus fechas", fr: "Choisissez vos dates", pt: "Escolha suas datas", ht: "Chwazi dat ou yo" },
  "Continue": { es: "Continuar", fr: "Continuer", pt: "Continuar", ht: "Kontinye" },
  "Share": { es: "Compartir", fr: "Partager", pt: "Compartilhar", ht: "Pataje" },
  "Save": { es: "Guardar", fr: "Enregistrer", pt: "Salvar", ht: "Sove" },
  "Good to know before you book.": { es: "Bueno saber antes de reservar.", fr: "Bon à savoir avant de réserver.", pt: "Bom saber antes de reservar.", ht: "Bon pou konnen anvan ou rezève." },
  "In your rate": { es: "Incluido en tu tarifa", fr: "Inclus dans votre tarif", pt: "Na sua tarifa", ht: "Nan pri ou" },
  "Add-ons & extras": { es: "Complementos y extras", fr: "Options et extras", pt: "Adicionais e extras", ht: "Adisyon & ekstra" },
  "House rules": { es: "Reglas de la casa", fr: "Règlement intérieur", pt: "Regras da casa", ht: "Règ kay la" },
  "Cancellation": { es: "Cancelación", fr: "Annulation", pt: "Cancelamento", ht: "Anilasyon" },
  "Security deposit": { es: "Depósito de seguridad", fr: "Caution", pt: "Depósito de segurança", ht: "Depo sekirite" },
  "Close to this stay": { es: "Cerca de esta estancia", fr: "À proximité", pt: "Perto desta estadia", ht: "Toupre sejou sa a" },
  // form
  "Name": { es: "Nombre", fr: "Nom", pt: "Nome", ht: "Non" },
  "Email": { es: "Correo electrónico", fr: "E-mail", pt: "E-mail", ht: "Imèl" },
  "Phone": { es: "Teléfono", fr: "Téléphone", pt: "Telefone", ht: "Telefòn" },
  "Preferred contact method": { es: "Método de contacto preferido", fr: "Méthode de contact préférée", pt: "Método de contato preferido", ht: "Metòd kontak ou pi renmen" },
  "Group size": { es: "Tamaño del grupo", fr: "Taille du groupe", pt: "Tamanho do grupo", ht: "Gwosè gwoup la" },
};

/* Privacy / cookie categories — privacy-preserving defaults (only essential on). */
const PRIVACY_CATEGORIES = [
  { id: "essential", label: "Essential", desc: "Required for the site to work (security, your preferences). Always on.", locked: true },
  { id: "analytics", label: "Analytics", desc: "Helps us understand what's useful. Off unless you turn it on." },
  { id: "marketing", label: "Marketing", desc: "Personalized offers and ads. Off unless you turn it on." },
];

/* Shared property facts */
const PROPERTY = {
  address: "1331 NW 87th Street, Miami, FL",
  city: "Miami-Dade (outside Miami Beach)",
  siteName: "New Level Executive House",
  parentName: "New Level Associates",
  parentUrl: "https://newlevelassociates.com", // main site
  agent: {
    name: "Shelley Lozier",                     // demo point-of-contact
    role: "Point of Contact · New Level",
    phone: "+1 (305) 000-0000",                 // PLACEHOLDER
    whatsapp: "13050000000",                    // PLACEHOLDER (digits only)
    initials: "SL",
  },
  inquiryEmail: "jackbruncoquillon@gmail.com",  // PLACEHOLDER demo inbox — swap for team inbox
};

/* New Level brand copy. Brand-level copy stays geography-neutral
   ("South Florida") so the format extends to future properties;
   property-specific copy elsewhere may name the city. */
const NLG_BRAND = {
  name: "New Level",
  tagline: "Real Estate. Redefined.",
  landingLine: "A South Florida real estate group matching standout properties to the moments they're made for — corporate offsites, family gatherings, private events, retreats and extended stays.",
  propertyIntro: "Presented by New Level — a South Florida real estate group matching standout homes to the moments they're made for.",
  aboutShort: "At New Level, we believe excellence starts with connection. Real estate isn't just about buildings or numbers — it's about people, purpose, and creating lasting value. Our team brings years of expertise and a modern perspective to every partnership.",
  aboutLong: "At New Level, we believe excellence starts with connection. Real estate isn't just about buildings or numbers — it's about people, purpose, and creating lasting value. Our team brings years of expertise and a modern perspective to every partnership, helping clients invest with confidence and achieve results that stand out. Across brokerage, investments, property management and events, we're here to help — real estate, redefined.",
};

/* Testimonials — pulled from the live New Level site (verbatim quotes). */
const TESTIMONIALS = [
  { name: "Sandra L.", role: "Property Owner",  text: "None compare to the consistency and communication I've experienced here." },
  { name: "Marcus W.", role: "Investor",        text: "New Level made investing in real estate feel straightforward and stress-free." },
  { name: "David R.",  role: "Licensed Agent",  text: "The support, mentorship, and collaborative environment here are unmatched." },
];

/* Meet the Team — demo. Photos are placeholders (team photos not yet supplied).
   Mirrors the live site's "Agents & Partners" section. */
const TEAM = [
  { name: "Shelley Lozier", role: "Point of Contact", placeholder: false },
  { name: "Team Member",    role: "Broker · Partner", placeholder: true },
  { name: "Team Member",    role: "Sales Associate",  placeholder: true },
  { name: "Team Member",    role: "Property Management", placeholder: true },
];

/* Services — copy pulled from the live New Level site. */
const SERVICES = [
  { t: "Brokerage & Consulting", d: "Buying or selling is more than a transaction — it's a milestone. Our brokerage team makes every step smooth and transparent, from listing to closing." },
  { t: "Investments",            d: "We help investors find opportunities that match their ambitions and risk comfort — smart, sustainable strategies to help investments grow the right way." },
  { t: "Property Management",    d: "From tenant relations to maintenance oversight, we take care of the details that protect your property and keep it performing." },
  { t: "Events & Networking",    d: "We love creating spaces where people connect and talk real estate in a way that makes sense — some educational, some just good people swapping ideas." },
];

/* =========================================================================
   PRICING — tier is chosen by the guest (duration/use), NOT by audience.
   Two tiers; event tier has service add-ons with PLACEHOLDER upcharges.
   ========================================================================= */
const RATE_TIERS = {
  event: { id: "event", label: "Single day / night rental", base: 1000,
           blurb: "Flat rate for the day/night when you provide your own services." },
  stay:  { id: "stay",  label: "Multi-night stay", perNight: 500,
           blurb: "Per night, plus taxes. Clean nights × rate." },
};

/* Event tier is a full 24-hour rental: check-in AND check-out (date + time),
   minimum 24 hours of access (e.g. 3:00 PM → 3:00 PM the next day). */
const EVENT_MIN_HOURS = 24;
const EVENT_DEFAULT_CHECKIN_MIN = 15 * 60;   // 3:00 PM
const EVENT_DEFAULT_CHECKOUT_MIN = 15 * 60;  // 3:00 PM

/* Where inquiries are delivered. Set this to a Formspree form URL
   (https://formspree.io/f/xxxx), a CRM inbound webhook, or a Zapier/Make
   catch-hook, and submissions POST straight there — the visitor never leaves
   the page or opens an email app. Empty = demo (shows confirmation, no send). */
const INQUIRY_ENDPOINT = "";

/* Event-tier add-ons. Each: guest self-provides (no charge), or New Level
   provides (adds the amount below). Prices are DEMO figures — illustrative,
   not final — and flow into the quote total when selected. */
const EVENT_ADDONS = [
  { id: "catering", label: "Catering",           desc: "Food & beverage service",          price: 850 },
  { id: "dj",       label: "Entertainment / DJ", desc: "DJ or live entertainment",          price: 650 },
  { id: "sound",    label: "Sound system",       desc: "PA / speakers / mics",              price: 400 },
  { id: "content",  label: "Content creation",   desc: "Photography / videography",         price: 550 },
];

/* Security deposit — refundable hold on EVENT (24-hour) rentals only.
   DEMO figure. Multi-night stays don't require one. */
const SECURITY_DEPOSIT = {
  amount: 500,
  appliesTo: "event",
  blurb: "Event (24-hour) rentals include a refundable $500 security deposit. It's a hold, not a charge — placed shortly before your date and released within 7 days after check-out once the home has been checked over. It covers any damage beyond normal wear. Multi-night stays don't require a deposit.",
};

/* Tax model — REAL figures (public tax law, Brief Section 6). */
const TAX = {
  lines: [
    { key: "fl_sales",  label: "Florida state sales tax",           rate: 0.06 },
    { key: "surtax",    label: "Miami-Dade discretionary surtax",   rate: 0.01 },
    { key: "tdt",       label: "Miami-Dade Tourist Development Tax", rate: 0.06 },
  ],
  baselineRate: 0.13, // 6 + 1 + 6
  // Unresolved — do NOT silently include or exclude (Brief Section 6).
  cdt: { label: "Miami-Dade Convention Development Tax", rate: 0.03 },
};

/* -------------------------------------------------------------------------
   Per-audience content. `rate` is nightly base — PLACEHOLDER.
   ------------------------------------------------------------------------- */
const AUDIENCES = {
  corporate: {
    id: "corporate",
    icon: ICONS.corporate,
    navLabel: "Corporate Retreats",
    cardLabel: "Corporate Retreats & Business Meetings",
    cardMeta: "Offsites · strategy sessions",
    headline: "A private base for the work that moves the company forward.",
    heroSub: "Host the offsite, the board session, or the leadership reset in a full residence built for focus — not a hotel conference floor.",
    rate: 1850,
    overview: "Executive House gives your team a single private setting for multi-day work: room to break out, room to reconvene, and space to actually think between sessions. Fast connectivity, defined work zones, and full-house privacy mean the day runs on your agenda, not a venue's timetable.",
    facts: [
      { k: "Sleeps", v: "Up to 16" },
      { k: "Work zones", v: "3 breakout areas" },
      { k: "Connectivity", v: "Business fiber" },
      { k: "Ideal length", v: "2–5 nights" },
    ],
    included: [
      { t: "Dedicated work zones", d: "Boardroom-style table plus two breakout areas for parallel sessions." },
      { t: "Business-grade Wi-Fi", d: "Fiber connection sized for full-team video calls at once." },
      { t: "Presentation display", d: "Large screen with HDMI / wireless casting for decks and demos." },
      { t: "Catering-ready kitchen", d: "Full kitchen and prep space for on-site catering or a private chef." },
      { t: "Quiet call corners", d: "Separate rooms for 1:1s and calls away from the main group." },
      { t: "On-site parking", d: "Private parking for the team — no garage runs mid-day." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose the range on the calendar. Availability shown is illustrative for this demo." },
      { t: "See the quote", d: "Total updates live with a full tax breakdown — nothing hidden." },
      { t: "Send the inquiry", d: "Your dates, group size and quote come attached automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and finalize the retreat details." },
    ],
    faqs: [
      { q: "Can we run multi-day sessions with breakouts?", a: "Yes — the house is set up for a main working space plus separate breakout areas, so parallel groups don't compete for the same room." },
      { q: "Is the Wi-Fi sufficient for a full team on video?", a: "The property runs on a business-grade fiber connection intended to carry simultaneous video calls. Exact throughput can be confirmed for your group size." },
      { q: "Can we bring in catering or a private chef?", a: "Absolutely. The kitchen and prep areas are catering-ready, and we can point you to vetted local options on request." },
      { q: "Is this a booking or an inquiry?", a: "An inquiry. Submitting sends us your details so we can confirm availability and pricing — no payment is collected and nothing is auto-confirmed." },
    ],
  },

  family: {
    id: "family",
    icon: ICONS.family,
    navLabel: "Family Gatherings",
    cardLabel: "Family Gatherings",
    cardMeta: "Reunions · holidays",
    headline: "Room for the whole family under one roof, finally.",
    heroSub: "Reunions, holidays, and milestone weekends where everyone stays together instead of scattering across three hotels.",
    rate: 1450,
    overview: "When the whole family comes together, the house matters. Executive House keeps everyone in one place — shared meals, open common space, and enough bedrooms that no one draws the short straw. Kids have room to play, grandparents have quiet corners, and the kitchen is big enough to actually cook in.",
    facts: [
      { k: "Sleeps", v: "Up to 16" },
      { k: "Bedrooms", v: "Multiple suites" },
      { k: "Kitchen", v: "Full chef's kitchen" },
      { k: "Outdoor", v: "Pool & patio" },
    ],
    included: [
      { t: "Space for everyone", d: "Multiple bedrooms and suites so the whole family stays under one roof." },
      { t: "Chef's kitchen", d: "Room to cook big shared meals together, not just reheat." },
      { t: "Open common areas", d: "Large living and dining space designed for the group to gather." },
      { t: "Pool & patio", d: "Outdoor space for the afternoon and slow evenings together." },
      { t: "Family-friendly layout", d: "Quiet corners for grandparents, open room for the kids." },
      { t: "Parking for the crew", d: "On-site parking for multiple vehicles arriving together." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose the weekend or week on the calendar. Availability is illustrative in this demo." },
      { t: "See the quote", d: "The total updates live, with every tax line shown plainly." },
      { t: "Send the inquiry", d: "Your dates and group size are attached automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and help plan the stay." },
    ],
    faqs: [
      { q: "How many people can actually stay comfortably?", a: "The layout is built to keep a large family group together comfortably. Share your group size in the inquiry and we'll confirm the fit for your dates." },
      { q: "Is it suitable for kids and grandparents together?", a: "Yes — there's open common space for the group plus quieter rooms, so different generations each have their own space." },
      { q: "Can we cook for a big group?", a: "The full chef's kitchen is designed for real cooking, not just reheating, so shared family meals work well here." },
      { q: "Is this a confirmed booking?", a: "No — it's an inquiry. We follow up to confirm availability. No payment is collected in this step." },
    ],
  },

  events: {
    id: "events",
    icon: ICONS.events,
    navLabel: "Private Events",
    cardLabel: "Private Events",
    cardMeta: "Celebrations · milestones",
    headline: "A private setting for the moments worth gathering for.",
    heroSub: "Milestone celebrations, intimate receptions, and private dinners in a residence that feels designed for the occasion.",
    rate: 2200,
    overview: "Some occasions deserve more than a banquet room. Executive House offers a private, full-property setting for celebrations — open indoor-outdoor flow, room to host, and the discretion of a residence rather than a rented hall. You set the guest list and the tone; the house holds it.",
    facts: [
      { k: "Event capacity", v: "By arrangement" },
      { k: "Flow", v: "Indoor / outdoor" },
      { k: "Catering", v: "Full prep kitchen" },
      { k: "Setting", v: "Full private home" },
    ],
    included: [
      { t: "Indoor-outdoor flow", d: "Open living space that connects to the patio and pool for hosting." },
      { t: "Catering-ready kitchen", d: "Full prep space for caterers or a private chef to work from." },
      { t: "Private setting", d: "The discretion of a full residence rather than a public venue." },
      { t: "Room to host", d: "Generous common areas that hold a gathering without feeling packed." },
      { t: "Evening ambiance", d: "Patio and pool space that carries a celebration into the night." },
      { t: "On-site parking", d: "Parking for guests arriving to the property." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose your event date on the calendar. Availability is illustrative in this demo." },
      { t: "See the quote", d: "The estimate updates live, with a full tax breakdown." },
      { t: "Send the inquiry", d: "Tell us your guest count — your date and quote attach automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and talk through event details." },
    ],
    faqs: [
      { q: "What kind of events suit the property?", a: "Intimate celebrations, milestone gatherings, private dinners and receptions. Share what you're planning in the inquiry and we'll confirm fit." },
      { q: "Is there a guest capacity for events?", a: "Event capacity is handled case by case depending on the format. Tell us your expected guest count and we'll advise for your dates." },
      { q: "Can we bring our own caterer and vendors?", a: "Yes — the kitchen is set up as a prep base for caterers, and you're welcome to bring your own vendors." },
      { q: "Does submitting confirm the event date?", a: "No — it's an inquiry. We follow up to confirm availability and details. No payment is collected here." },
    ],
  },

  ministry: {
    id: "ministry",
    icon: ICONS.ministry,
    navLabel: "Church & Ministry",
    cardLabel: "Church & Ministry Retreats",
    cardMeta: "Retreats · gatherings",
    headline: "A quiet place set apart for your community to gather.",
    heroSub: "Leadership retreats, ministry planning, and small-group gatherings in a calm, private residence away from the everyday.",
    rate: 1500,
    overview: "Executive House offers ministry groups a private, unhurried setting to gather, plan, and rest. Room to meet as a whole group and space to break into smaller circles; a full kitchen for shared meals; and the quiet of a residence rather than a conference center. A welcoming space for retreats across traditions.",
    facts: [
      { k: "Sleeps", v: "Up to 16" },
      { k: "Gathering", v: "Full-group room" },
      { k: "Meals", v: "Shared kitchen" },
      { k: "Setting", v: "Quiet & private" },
    ],
    included: [
      { t: "Room to gather", d: "A common space large enough for the whole group to meet together." },
      { t: "Breakout circles", d: "Smaller rooms for prayer, discussion, or small-group time." },
      { t: "Shared meals", d: "Full kitchen and dining space for cooking and eating together." },
      { t: "Quiet & privacy", d: "A calm, private residence set apart from the everyday." },
      { t: "Overnight space", d: "Room for the group to stay together across a multi-day retreat." },
      { t: "On-site parking", d: "Parking for the group arriving together." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose the retreat dates on the calendar. Availability is illustrative in this demo." },
      { t: "See the quote", d: "The total updates live, with every tax line shown plainly." },
      { t: "Send the inquiry", d: "Your dates and group size are attached automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and help with the details." },
    ],
    faqs: [
      { q: "Is the space suitable for a whole-group gathering?", a: "Yes — there's a common area for the full group to meet, plus smaller rooms for breakout circles and quieter time." },
      { q: "Can the group stay overnight together?", a: "The house is set up for a group to stay together across a multi-day retreat. Share your numbers and we'll confirm the fit." },
      { q: "Can we prepare meals together?", a: "The full kitchen and dining space are made for shared meals — cooking and eating together as a group works well here." },
      { q: "Is this a booking?", a: "No — it's an inquiry. We follow up to confirm availability for your retreat. No payment is collected in this step." },
    ],
  },

  extended: {
    id: "extended",
    icon: ICONS.extended,
    navLabel: "Extended Stays",
    cardLabel: "Extended & Vacation Stays",
    cardMeta: "Long stays · relocations",
    headline: "Settle in for the season, not just the weekend.",
    heroSub: "Extended vacations, seasonal stays, and relocations where you want the comfort of a full home, ready to live in from day one.",
    rate: 1250,
    overview: "For longer stays, a hotel wears thin fast. Executive House lives like a home from the first night — a full kitchen, real living space, and room to settle into a routine. Whether you're between homes, working remotely for a stretch, or spending the season in Miami, it's set up for weeks, not just nights.",
    facts: [
      { k: "Min. stay", v: "Weekly+" },
      { k: "Kitchen", v: "Full & equipped" },
      { k: "Workspace", v: "Remote-ready" },
      { k: "Rates", v: "Long-stay pricing" },
    ],
    included: [
      { t: "Move-in ready", d: "A fully equipped home you can live in from the first night." },
      { t: "Full kitchen", d: "Everything you need to cook and eat in through a long stay." },
      { t: "Remote-work ready", d: "Reliable connectivity and space to work from home comfortably." },
      { t: "Real living space", d: "Room to settle into a routine, not just pass through." },
      { t: "Pool & outdoor", d: "Private outdoor space for the everyday, not just the visit." },
      { t: "Long-stay pricing", d: "Rates structured for weekly and monthly stays (placeholder in this demo)." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose your stay length on the calendar. Availability is illustrative in this demo." },
      { t: "See the quote", d: "The total updates live, with the full tax breakdown shown." },
      { t: "Send the inquiry", d: "Your dates and details are attached automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and long-stay terms." },
    ],
    faqs: [
      { q: "What counts as an extended stay?", a: "Weekly and longer stays. Share your intended length in the inquiry and we'll confirm availability and the right rate structure." },
      { q: "Is it set up for remote work?", a: "Yes — there's reliable connectivity and dedicated space to work from home comfortably over a longer stay." },
      { q: "Are long-stay rates different?", a: "Long stays are priced differently from nightly bookings. Note that all pricing in this demo is placeholder and not final." },
      { q: "Is this a confirmed booking?", a: "No — it's an inquiry. We follow up to confirm availability and terms. No payment is collected in this step." },
    ],
  },
};

const AUDIENCE_ORDER = ["corporate", "family", "events", "ministry", "extended"];
