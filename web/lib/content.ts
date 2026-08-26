// Homepage copy ported from ../content.js (single source of truth for the
// vanilla site). Only the subset used by the sections built so far in this
// Next.js rebuild — extend as more sections get ported.

export const NLG_BRAND = {
  name: "New Level",
  tagline: "Real Estate. Redefined.",
  aboutShort:
    "At New Level, we believe excellence starts with connection. Real Estate isn't just about buildings or numbers. It's about people, purpose, and creating lasting value. Our team brings years of expertise and a modern perspective to every partnership.",
  aboutLong:
    "At New Level, we believe excellence starts with connection. Real Estate isn't just about buildings or numbers. It's about people, purpose, and creating lasting value. Our team brings years of expertise and a modern perspective to every partnership, helping clients invest with confidence and achieve results that stand out. Across brokerage, investments, property management and events, we're here to help: Real Estate, Redefined.",
  mission:
    "At New Level, we believe Real Estate should elevate people, communities, and portfolios. Our purpose is to create lasting impact through innovation, integrity, and world-class service.",
  story:
    "Founded in 2003 and headquartered in South Florida, New Level is a Real Estate group redefining standards of excellence in brokerage, investment, and property management. What began as a small, ambitious brokerage has evolved into a multi-faceted organization known for its forward-thinking approach and client-first mindset. At its core, New Level is driven by one simple belief: Real Estate should be redefined at every level, from how investments are made to how relationships are built.",
};

export const VALUES = [
  {
    t: "Integrity",
    d: "We conduct every business interaction with honesty and transparency, ensuring our clients feel confident at every step.",
  },
  {
    t: "Excellence",
    d: "From first contact to closing, we pursue precision and professionalism that surpass expectations.",
  },
  {
    t: "Wealth Creation",
    d: "Our success is measured by our clients' growth, creating value that endures for generations.",
  },
  {
    t: "Innovation",
    d: "We redefine traditional Real Estate through forward-thinking solutions and technology-driven insight.",
  },
  {
    t: "Client Focus",
    d: "Our clients are at the center of everything we do, inspiring us to deliver with care, consistency, and commitment.",
  },
];

export const BROKERS_CORNER = {
  tagline: "Real Stories • Real Strategies • Real Results",
  intro:
    "Welcome to The Broker's Corner, a space where our Principal Broker, Shelley Lozier, shares real stories, strategies, and insights from years in the Real Estate industry. Whether you're new to investing or an experienced professional, you'll find honest conversations and expert guidance to help you navigate the market with confidence.",
  bio: "With over two decades of experience in the Real Estate industry, Shelley Lozier founded New Level on a foundation of integrity, innovation, and service. His journey from agent to principal broker has been driven by one core belief: that success in Real Estate comes from relationships, not transactions. Through years of helping clients, mentoring agents, and building lasting partnerships, Shelley has developed a passion for educating others and sharing insights that empower both professionals and investors alike.",
};

export const PAGES = {
  contentLibrary: {
    eyebrow: "Content Library",
    heading: "What we're posting, all in one place.",
    sub: "Follow along on Instagram, Facebook, TikTok and YouTube, or browse a taste of it here.",
    intro:
      "Real posts will appear here once each platform is connected. For now, this is a preview of how it'll look.",
  },
  blog: {
    eyebrow: "Blog",
    heading: "Insights on real estate, investing, and South Florida.",
    sub: "This is where New Level's writing will live: market takes, investment thinking, and practical guidance.",
    intro:
      "No posts are published yet. For now, this previews the categories the blog will be organized around.",
  },
  team: {
    eyebrow: "Agents & Partners",
    heading: "Our Team",
    sub: "Agents and partners who match properties to the moments they're made for.",
    intro:
      "New Level's team blends brokerage expertise with a hospitality mindset: the same people who list and manage the portfolio are the ones who help you match a property to the moment you're planning for.",
  },
  services: {
    eyebrow: "Services",
    heading: "What we do.",
    sub: "Brokerage, investment, property management and events: the full New Level offering.",
    intro:
      "From a first listing conversation to years of ongoing management, New Level stays involved across the life of a property, not just the transaction that starts it.",
  },
  testimonials: {
    eyebrow: "Testimonials",
    heading: "What clients say, straight from the source.",
    sub: "Owners, investors and agents on what it's actually like working with New Level.",
  },
  events: {
    eyebrow: "Events",
    heading: "Come hang out with us.",
    sub: "We love creating spaces where people connect and talk Real Estate in a way that makes sense: some educational, some just good people swapping ideas.",
  },
  contact: {
    eyebrow: "Contact",
    heading: "Get in touch",
    sub: "We'd love to hear from you.",
    intro: "Every property, every moment, every question: reach us directly.",
  },
  subscribe: {
    eyebrow: "Stay in the loop",
    heading: "Subscribe to updates",
    sub: "New listings, events, and content, sent only for what you actually want to hear about.",
    intro:
      "Create an account to also save properties as you browse, or just subscribe with your email.",
  },
  brokersCorner: {
    eyebrow: "The Broker's Corner",
    heading: "Insights, experience, and real conversations about Real Estate.",
    sub: "Real Stories • Real Strategies • Real Results",
  },
  faq: {
    eyebrow: "FAQs",
    heading: "Frequently Asked Questions",
    sub: "Answers to what people ask us most.",
  },
  privacy: {
    eyebrow: "Legal",
    heading: "Privacy Policy",
    sub: "How this site handles the information it has.",
  },
  terms: {
    eyebrow: "Legal",
    heading: "Terms of Use",
    sub: "The rules for using this site.",
  },
  riskDisclosure: {
    eyebrow: "Legal",
    heading: "Risk Disclosure",
    sub: "Real Estate involves real risk: here's the plain version.",
  },
  fairHousing: {
    eyebrow: "Legal",
    heading: "Fair Housing Statement",
    sub: "Our commitment to equal housing opportunity.",
  },
  accessibility: {
    eyebrow: "Legal",
    heading: "Accessibility Statement",
    sub: "Our commitment to a site everyone can use.",
  },
  partners: {
    eyebrow: "Our Network",
    heading: "Partners",
    sub: "Businesses and specialists we trust and recommend.",
    intro:
      "Buying, selling, managing, or investing in Real Estate touches more than one business — New Level works alongside a network of partners across South Florida for the parts outside our own scope.",
  },
  careers: {
    eyebrow: "Careers",
    heading: "Join New Level",
    sub: "Real Estate careers, built around real support.",
    intro:
      "Whether you're a licensed agent looking for a better home base, or interested in joining another way, we'd like to hear from you.",
  },
};

// Draft/demo content — written to accurately describe what this actual
// Next.js app does with data today (see the sections below), not generic
// filler. It has NOT been reviewed by an attorney and should not be treated
// as a finished legal document before this site (or its data-collecting
// features) goes live for real.
export const LEGAL_LAST_UPDATED = "August 2026";

export const PRIVACY_SECTIONS = [
  {
    t: "Information we collect",
    d: "The contact and inquiry forms on this site ask for the name, email, phone number, and message details a visitor chooses to enter. This is a demo: no inquiry endpoint is currently connected, so form submissions on this site are not actually transmitted or stored anywhere; they simply confirm on-screen. The account menu shown in the navigation (Sign In / Create Account) is a UI preview only; there is no real account system behind it, and no credentials are collected.",
  },
  {
    t: "Cookies & local storage",
    d: "This site uses your browser's local storage to remember one preference, light or dark mode, on the device you're using. That preference never leaves your browser. A separate, short-lived session cookie is used only to keep an administrator signed in to the site's internal content-editing tools; it is not set for ordinary visitors and is not used for tracking or advertising.",
  },
  {
    t: "How information is used",
    d: "Where a real inquiry endpoint is eventually connected, information submitted through a form would be used only to respond to that specific inquiry: scheduling, answering questions, or following up about a property, service, or event. It would not be sold or shared with third parties for their own marketing purposes.",
  },
  {
    t: "Third-party services",
    d: "Site content and any admin-uploaded images are stored using Netlify Blobs, a backend storage service operated by Netlify. This site does not currently run third-party analytics, advertising, or tracking scripts.",
  },
  {
    t: "Data security",
    d: "Reasonable technical safeguards are used for the systems this site does rely on (such as the admin login), but no method of storage or transmission over the internet is completely secure, and no guarantee of absolute security can be made.",
  },
  {
    t: "Your choices",
    d: "Because this demo's forms don't currently send data anywhere, there is nothing on file to request access to, correct, or delete. Once real data collection is connected, this section will describe how to make those requests.",
  },
  {
    t: "Children's privacy",
    d: "This site is intended for a general adult audience and is not directed at children under 13. It does not knowingly collect personal information from children.",
  },
  {
    t: "Changes to this policy",
    d: "This policy may be updated as real functionality (forms, accounts, analytics) is added to the site. The date below reflects the most recent update.",
  },
];

export const TERMS_SECTIONS = [
  {
    t: "Acceptance of these terms",
    d: "By using this site, you agree to these terms. This is a demo of a Real Estate group's website; some features described (booking, inquiries, accounts) are previews and not yet connected to live systems.",
  },
  {
    t: "Permitted use",
    d: "This site is provided for browsing information about New Level, its team, services, and featured properties. You agree not to misuse the site, including attempting to disrupt it, scrape it at scale, or interfere with other visitors' use of it.",
  },
  {
    t: "Not investment, legal, or financial advice",
    d: "Content on this site, including property descriptions, service overviews, and any figures shown, is for general informational purposes only and does not constitute investment, legal, financial, or tax advice. Speak with a licensed professional before making a Real Estate or investment decision.",
  },
  {
    t: "Intellectual property",
    d: "The New Level name, logo, and original site content (text, photos of the featured property, and design) belong to New Level or its licensors. You may not reproduce or redistribute them without permission.",
  },
  {
    t: "Third-party links",
    d: "This site links to third-party destinations, including social media platforms. New Level isn't responsible for the content, policies, or practices of those third-party sites.",
  },
  {
    t: "No warranty",
    d: "This site, including this demo version, is provided \"as is,\" without warranties of any kind, express or implied, including that it will be uninterrupted, error-free, or fit for a particular purpose.",
  },
  {
    t: "Limitation of liability",
    d: "To the fullest extent permitted by law, New Level is not liable for any indirect, incidental, or consequential damages arising from your use of this site.",
  },
  {
    t: "Governing law",
    d: "These terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles, consistent with New Level being headquartered in South Florida.",
  },
  {
    t: "Changes to these terms",
    d: "These terms may be updated as the site's real functionality grows. Continued use of the site after an update means you accept the revised terms.",
  },
];

export const RISK_DISCLOSURE_SECTIONS = [
  {
    t: "Real Estate values can go up or down",
    d: "Property values, rental income, and occupancy are affected by market conditions, interest rates, local economic factors, and other events outside anyone's control. Past performance of any property, market, or investment strategy is not a guarantee of future results.",
  },
  {
    t: "No guaranteed returns",
    d: "Nothing on this site, including testimonials, case studies, or example figures, should be read as a projection or guarantee of income, appreciation, or investment return. Figures shown on this demo site are illustrative placeholders, not real performance data.",
  },
  {
    t: "Property management & rental risk",
    d: "Rental and event-hosting income can be affected by vacancy, cancellations, seasonality, maintenance and repair costs, and changes in local regulation. Refundable deposits and cancellation terms shown for a given property or event are specific to that booking, not a general guarantee.",
  },
  {
    t: "Liquidity risk",
    d: "Real Estate is not a liquid asset: it can take significant time to sell a property at a desired price, and market conditions may require accepting a different price or timeline than planned.",
  },
  {
    t: "Independent advice recommended",
    d: "Before making a Real Estate purchase, sale, or investment decision, New Level recommends speaking with a licensed Real Estate professional, attorney, and financial or tax advisor about your specific situation.",
  },
];

export const FAIR_HOUSING_SECTIONS = [
  {
    t: "Equal housing opportunity",
    d: "New Level is committed to compliance with the federal Fair Housing Act and applicable state and local fair housing laws. We do not discriminate on the basis of race, color, religion, sex, disability, familial status, or national origin in any aspect of the sale, rental, financing, or management of housing.",
  },
  {
    t: "Our commitment",
    d: "Every client, tenant, guest, and prospective agent is treated fairly and given equal access to New Level's properties, services, and opportunities, regardless of background.",
  },
  {
    t: "Reporting a concern",
    d: "If you believe you've experienced discrimination in connection with any New Level property or service, you can contact us directly, or file a complaint with the U.S. Department of Housing and Urban Development (HUD) at hud.gov/fairhousing.",
  },
];

export const ACCESSIBILITY_SECTIONS = [
  {
    t: "Our commitment",
    d: "New Level wants this site to be usable by as many people as possible, including people who use a screen reader, navigate by keyboard alone, or rely on other assistive technology. Accessibility is an ongoing effort, not a one-time checkbox.",
  },
  {
    t: "What's in place today",
    d: "A \"skip to content\" link lets keyboard users jump past repeated navigation on every page. Interactive elements use real semantic HTML (buttons, links, form labels) rather than divs standing in for controls, so screen readers can identify them correctly. Color choices are checked for contrast against the site's black/white/green palette, and no information on the site is conveyed by color alone.",
  },
  {
    t: "Known gaps",
    d: "This is a demo site under active development, and a full WCAG 2.1 AA audit hasn't been completed yet. If you encounter something that doesn't work with your assistive technology, please tell us using the contact info below so it can be fixed.",
  },
  {
    t: "Reporting an issue",
    d: "If any part of this site is difficult to access or use, contact us directly and describe the issue and the assistive technology you were using. We'll work to address it.",
  },
];

// Category-labeled placeholders, not invented specific company names —
// naming a real-sounding business we don't actually work with would be a
// false endorsement claim, a different (and worse) kind of placeholder
// than the site's other known placeholders (a not-yet-real phone number,
// a missing team photo). Tracked in CLAUDE.md's "Known placeholders" list.
export const PARTNERS = [
  {
    category: "Title & Escrow",
    name: "Title & Escrow Partner",
    blurb: "Smooth, on-time closings, coordinated with the same title partner we recommend to our own clients.",
  },
  {
    category: "Mortgage & Lending",
    name: "Lending Partner",
    blurb: "Financing guidance for buyers, from pre-approval through closing day.",
  },
  {
    category: "Home Inspection",
    name: "Inspection Partner",
    blurb: "Thorough, buyer-focused inspections before you commit to a property.",
  },
  {
    category: "Property Insurance",
    name: "Insurance Partner",
    blurb: "South Florida-specific coverage guidance, including flood and windstorm.",
  },
  {
    category: "Property Management Tech",
    name: "Management Software Partner",
    blurb: "The platform behind smooth day-to-day operations for the properties we manage.",
  },
];

export const CAREER_ROLES = [
  { id: "agent", label: "Real Estate Agent" },
  { id: "broker", label: "Broker Partner" },
  { id: "property-management", label: "Property Management" },
  { id: "operations", label: "Operations & Support" },
  { id: "other", label: "Something Else" },
];

export const FAQS = [
  {
    q: "How do I get started with New Level?",
    a: "You can schedule a free initial consultation directly through our website. During this call, we'll learn about your goals and determine which of our services or partnerships best fit your needs.",
  },
  {
    q: "Do you assist with both buying and selling properties?",
    a: "Yes. Our licensed professionals guide clients through every stage of the buying or selling process, from market analysis and property valuation to closing.",
  },
  {
    q: "I'm a licensed agent, can I join New Level?",
    a: "Yes! We're always open to connecting with talented professionals. Reach out through the Contact page to learn more about current opportunities.",
  },
  {
    q: "Can I work with your agents if I'm based outside of Florida?",
    a: "Absolutely. We maintain a network of trusted partners and affiliate agents across several states and can assist you through coordinated local representation.",
  },
  {
    q: "Does New Level collaborate with outside investors or firms?",
    a: "Absolutely. Strategic partnerships are a key part of our growth model. If you're interested in co-investing or development collaborations, contact us to schedule a call.",
  },
];

// Shared between the /subscribe form and (once built) any future account
// settings page — keys match the notification_preferences /
// newsletter_subscribers table columns directly.
export const NOTIFICATION_PREFERENCES = [
  { id: "property_alerts", label: "New property listings", blurb: "New or updated listings that match what we know you're interested in." },
  { id: "content_updates", label: "Content & social updates", blurb: "New posts from the Content Library and Blog once they go live." },
  { id: "site_updates", label: "Site updates", blurb: "New features or sections added to the site itself." },
  { id: "events", label: "Events & networking", blurb: "New events added to the calendar." },
] as const;

export const CONTACT_TOPICS = [
  { id: "property", label: "Property Inquiry" },
  { id: "sell", label: "Selling / Home Valuation" },
  { id: "investment", label: "Investment" },
  { id: "management", label: "Property Management" },
  { id: "events", label: "Events" },
  { id: "join", label: "Join Our Network" },
  { id: "general", label: "Something Else" },
];

// `photoAlbumPending` marks a past event whose real photo album hasn't
// been provided yet — client (2026-08-26): "put placeholders, I will
// provide the albums with the dates at some point." Rendered as a
// "Photos coming soon" placeholder card on the Past Events section of
// /events, rather than a broken/missing image.
export const EVENTS_CALENDAR = [
  {
    date: "2026-06-12",
    title: "Summer Kickoff Mixer",
    type: "Mixer",
    time: "6:00 – 8:30 PM",
    blurb: "An evening of connections to open the summer season.",
    photoAlbumPending: true,
  },
  {
    date: "2026-07-24",
    title: "Investor Roundtable",
    type: "Networking",
    time: "5:30 – 7:30 PM",
    blurb: "A smaller, conversation-driven evening for active and prospective investors.",
    photoAlbumPending: true,
  },
  {
    date: "2026-08-20",
    title: "New Level Soirée",
    type: "Mixer",
    time: "6:00 – 8:00 PM",
    blurb:
      "An exclusive evening of sophistication and opportunity, connecting investors and agents.",
    photoAlbumPending: true,
  },
  {
    date: "2026-08-28",
    title: "First-Time Buyer Workshop",
    type: "Workshop",
    time: "10:00 AM – 12:00 PM",
    blurb:
      "A no-pressure walkthrough of the buying process, financing, and what to expect.",
  },
  {
    date: "2026-09-10",
    title: "Market Update Breakfast",
    type: "Networking",
    time: "8:30 – 10:00 AM",
    blurb:
      "A quick, casual look at what's moving in the South Florida market right now.",
  },
  {
    date: "2026-09-19",
    title: "Crafting Connections Networking Event",
    type: "Networking",
    time: "5:00 – 7:00 PM",
    blurb:
      "Meet the team and fellow agents, investors, and partners over drinks and conversation.",
  },
];

export const POINT_OF_CONTACT = {
  name: "Shelley Lozier",
  role: "Point of Contact · New Level",
  phone: "+1 (305) 000-0000",
  whatsapp: "13050000000",
  initials: "SL",
  email: "placeholder@newlevelassociates.com",
};

export const EVENT_CTA = {
  eyebrow: "Hosting an event?",
  heading: "We can help with that too.",
  sub: "Milestone celebrations, private dinners, corporate gatherings: see venues set up to host, not just sleep.",
  cta: "See event venues",
};

export const TRUST_STATS = [
  { value: "$120M+", label: "In closed transactions" },
  { value: "250+", label: "Properties represented" },
  { value: "15+", label: "Years combined experience" },
  { value: "98%", label: "Client satisfaction" },
];

export const SERVICES = [
  {
    id: "brokerage",
    t: "Brokerage & Consulting",
    d: "Buying or selling is more than a transaction. It's a milestone. Our brokerage team makes every step smooth and transparent, from listing to closing.",
    long: "We blend strategic insight with hands-on execution to help investors identify, acquire, and optimize Real Estate opportunities that deliver lasting value.",
    capabilities: [
      {
        t: "Property Acquisition",
        d: "End-to-end sourcing and negotiation for commercial and residential investments.",
      },
      {
        t: "Market Analysis",
        d: "Comprehensive research and forecasting to identify emerging opportunities.",
      },
      {
        t: "Deal Structuring",
        d: "Custom financing solutions and transaction optimization for maximum value.",
      },
      {
        t: "Portfolio Strategy",
        d: "Holistic planning to diversify holdings and accelerate wealth creation.",
      },
      {
        t: "Risk Management",
        d: "Thorough due diligence and contingency planning to protect your capital.",
      },
    ],
    howItWorks: [
      { t: "Initial consultation", d: "A free conversation about what you're buying, selling, or comparing, and what timeline you're working with." },
      { t: "Market analysis", d: "We pull comparable sales/rentals and current conditions so pricing decisions are grounded in real data, not guesswork." },
      { t: "Listing or search", d: "For sellers: professional listing, marketing, and showings. For buyers: a curated search matched to your criteria." },
      { t: "Negotiation & closing", d: "We handle offers, counteroffers, and coordination with lenders/title through to closing day." },
    ],
    faqs: [
      { q: "Do I need to already have a property in mind?", a: "No — plenty of clients start with just a goal or a budget. We help narrow it down from there." },
      { q: "What does the consultation cost?", a: "Nothing. The first conversation is always free, with no obligation to move forward." },
    ],
  },
  {
    id: "investment",
    t: "Investments",
    d: "We help investors find opportunities that match their ambitions and risk comfort: smart, sustainable strategies to help investments grow the right way.",
    long: "Every investor's story is different, and that's exactly how we approach it. We start by listening, learning what matters most to you, then finding opportunities that fit. Investing should feel clear, collaborative, and rewarding, not complicated.",
    capabilities: [
      {
        t: "Understand Your Goals",
        d: "Every partnership begins with a conversation about your objectives and risk tolerance.",
      },
      {
        t: "Build Your Strategy",
        d: "A clear plan built around target markets, property types, and potential returns.",
      },
      {
        t: "Identify Opportunities",
        d: "Sourced and evaluated through our network of trusted partners and off-market access.",
      },
      {
        t: "Monitor & Grow",
        d: "We keep tracking performance and identifying future opportunities as the market evolves.",
      },
      {
        t: "Space Partnerships",
        d: "Structured arrangements that let another business use a property on a recurring basis, with revenue shared back to the owner.",
      },
    ],
    howItWorks: [
      { t: "Goals & risk conversation", d: "Before any property talk, we figure out what you're actually optimizing for — cash flow, appreciation, diversification." },
      { t: "Strategy & target markets", d: "A concrete plan: which property types, which South Florida markets, and what return profile fits." },
      { t: "Sourcing & underwriting", d: "We bring opportunities (including off-market access) and run the numbers with you before you commit." },
      { t: "Ongoing performance tracking", d: "Once you own it, we keep watching performance and flag the next opportunity when it fits your strategy." },
    ],
    faqs: [
      { q: "What's the minimum investment to get started?", a: "There's no fixed minimum — it depends on the market and property type. Tell us your budget and we'll show you what's realistic." },
      { q: "Do you only source properties you also manage?", a: "No — Property Management is available if you want it, but it's not required to work with our investment team." },
    ],
  },
  {
    id: "management",
    t: "Property Management",
    d: "From tenant relations to maintenance oversight, we take care of the details that protect your property and keep it performing.",
    long: "We handle the complexities of property management so you can focus on growing your investment portfolio, with meticulous attention to detail and a commitment to maximizing returns.",
    capabilities: [
      {
        t: "Leasing & Tenant Relations",
        d: "Marketing, tenant screening, lease negotiation, and ongoing relationship management.",
      },
      {
        t: "Maintenance Coordination",
        d: "Preventative scheduling, emergency response, vendor management, and inspections.",
      },
      {
        t: "Financial Reporting",
        d: "Monthly statements, expense tracking, and revenue analysis.",
      },
      {
        t: "Property Optimization",
        d: "Strategic upgrades and rent optimization to enhance value.",
      },
      {
        t: "Owner Communication",
        d: "Transparent, proactive updates on performance and market insights.",
      },
    ],
    howItWorks: [
      { t: "Onboarding walkthrough", d: "We assess the property, set up systems, and get it listing-ready if it isn't occupied yet." },
      { t: "Tenant placement", d: "Marketing, showings, screening, and lease signing handled end to end." },
      { t: "Day-to-day management", d: "Maintenance requests, vendor coordination, rent collection, and tenant communication." },
      { t: "Monthly reporting", d: "A clear statement of income, expenses, and anything that needs an owner decision." },
    ],
    faqs: [
      { q: "What if I already have a tenant in place?", a: "That's fine — we can take over management of an existing lease without any disruption to the tenant." },
      { q: "How are maintenance emergencies handled?", a: "We maintain a vetted vendor network and a response process for after-hours emergencies, so an owner is never the first call." },
    ],
  },
  {
    id: "events",
    t: "Events & Networking",
    d: "We love creating spaces where people connect and talk Real Estate in a way that makes sense: some educational, some just good people swapping ideas.",
    long: "Some of our events are more educational, others are just a chance to meet good people and swap ideas. Either way, you'll always walk away with something new.",
    capabilities: [] as { t: string; d: string }[],
    howItWorks: [
      { t: "Pick a purpose", d: "Educational workshop, networking mixer, or a private venue rental — see the Events page for what's upcoming and to inquire about your own." },
      { t: "We handle the space", d: "Venue setup, from a simple mixer to a fully catered private event." },
      { t: "Show up and connect", d: "That's really it — the goal is a genuine, low-pressure room, not a sales pitch." },
    ],
    faqs: [
      { q: "Do I need to be a client to attend an event?", a: "No — most New Level events are open to anyone interested in South Florida real estate, clients or not." },
      { q: "Can I host a private event at one of your properties?", a: "Yes — see Private Events under Properties for venue-style rentals, packages, and pricing." },
    ],
  },
];

// `photo` fields below are demo placeholders (stock portraits), not real
// photos of these people — the client explicitly confirmed 2026-08-21 this
// is fine for a demo site, since the whole site is marked not-live and every
// fake number/name is already a flagged placeholder.
export const TESTIMONIALS = [
  {
    name: "Sandra L.",
    role: "Property Owner",
    text: "None compare to the consistency and communication I've experienced here.",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=533&fit=crop&crop=faces&auto=format",
  },
  {
    name: "Marcus W.",
    role: "Investor",
    text: "New Level made investing in Real Estate feel straightforward and stress-free.",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=533&fit=crop&crop=faces&auto=format",
  },
  {
    name: "David R.",
    role: "Licensed Agent",
    text: "The support, mentorship, and collaborative environment here are unmatched.",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=533&fit=crop&crop=faces&auto=format",
  },
];

// Every member gets a slug for their own bio page at /team/[slug] (see
// app/(marketing)/team/[slug]/page.tsx) — reachable either from a homepage
// team photo or from a row on the full /team roster. Shelley's quote/bio
// reuse the real migrated copy from BROKERS_CORNER/POINT_OF_CONTACT above
// rather than inventing new text for the one real person on the team; the
// other three are clearly-fictional placeholder profiles (placeholder:
// true), same convention as their placeholder photos — their bio pages
// flag that explicitly rather than reading as real hires.
export const TEAM = [
  {
    slug: "shelley-lozier",
    name: "Shelley Lozier",
    role: "Founder & Principal Broker",
    motto: "Every detail, followed through.",
    quote: "Success in Real Estate comes from relationships, not transactions.",
    bio: BROKERS_CORNER.bio,
    email: POINT_OF_CONTACT.email,
    phone: POINT_OF_CONTACT.phone,
    placeholder: false,
    photo: "/team/shelley-lozier.png",
    // object-cover center-crops by default — this particular photo's
    // headroom means a dead-center crop clips the top of her head in the
    // accordion/roster/bio-page frames (all taller-than-the-source-image
    // aspect ratios). Bias the crop toward the top instead. The three
    // Unsplash placeholder photos below already arrive pre-cropped to
    // faces via Unsplash's own crop=faces param, so they don't need this.
    photoPosition: "top" as const,
  },
  {
    slug: "broker-partner",
    name: "Team Member",
    role: "Broker · Partner",
    motto: "Real Estate is relationships first.",
    quote: "The right property was never about the numbers. It's about the moment it's for.",
    bio: "This profile is a placeholder for a real Broker & Partner who'll join the roster as New Level's team page is filled in — background, specialties, and what they bring to the brokerage side will live here.",
    email: "placeholder@newlevelassociates.com",
    phone: "+1 (305) 000-0000",
    placeholder: true,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=800&fit=crop&crop=faces&auto=format",
  },
  {
    slug: "sales-associate",
    name: "Team Member",
    role: "Sales Associate",
    motto: "Find the space that fits the moment.",
    quote: "Every client is chasing a feeling, not just a floor plan.",
    bio: "This profile is a placeholder for a real Sales Associate who'll join the roster as New Level's team page is filled in — background, specialties, and a bit of personality will live here.",
    email: "placeholder@newlevelassociates.com",
    phone: "+1 (305) 000-0000",
    placeholder: true,
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=800&fit=crop&crop=faces&auto=format",
  },
  {
    slug: "property-management",
    name: "Team Member",
    role: "Property Management",
    motto: "Protect the property, protect the peace of mind.",
    quote: "The best property management is the kind an owner never has to think about.",
    bio: "This profile is a placeholder for a real member of the Property Management team who'll join the roster as New Level's team page is filled in — background, specialties, and day-to-day focus will live here.",
    email: "placeholder@newlevelassociates.com",
    phone: "+1 (305) 000-0000",
    placeholder: true,
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&h=800&fit=crop&crop=faces&auto=format",
  },
];

export const SOCIALS = [
  { id: "instagram", name: "Instagram", href: "https://newlevelassociates.com" },
  { id: "facebook", name: "Facebook", href: "https://newlevelassociates.com" },
  { id: "tiktok", name: "TikTok", href: "https://newlevelassociates.com" },
  { id: "youtube", name: "YouTube", href: "https://newlevelassociates.com" },
];

// Single source for the top nav — shared by the homepage's HeroHeader and
// every other page's SiteHeader via the NavMenu/NavMenuMobile components so
// they can't drift apart. Properties/About/Services carry dropdown children;
// the rest are plain links.
export const NAV_MENU = [
  // Restructured 2026-08-27 per the client's dictated taxonomy: Residential/
  // Commercial/Rental/All Properties, matching PROPERTY_CATEGORIES in
  // lib/property-categories.ts (the same taxonomy the properties database
  // table + admin CRUD use). The old tier-specific links (luxury-short-term,
  // short-term, etc.) still work as URLs — they're what the homepage
  // search box tabs and the "Hosting an event?" CTA link to — just no
  // longer surfaced in the top nav directly, which now points at the
  // database-backed browsing pages instead of the old static grid.
  {
    label: "Properties",
    href: "/properties",
    children: [
      { label: "All Properties", href: "/properties" },
      { label: "Residential", href: "/properties/residential" },
      { label: "Commercial", href: "/properties/commercial" },
      { label: "Rental", href: "/properties/rental" },
      { label: "Full Portfolio", href: "/portfolio" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About New Level", href: "/about" },
      { label: "Team", href: "/team" },
      { label: "The Broker's Corner", href: "/brokers-corner" },
      { label: "Content Library", href: "/content-library" },
      { label: "Partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "All services", href: "/services" },
      { label: "Brokerage & Consulting", href: "/services/brokerage" },
      { label: "Property Management", href: "/services/management" },
      { label: "Investment", href: "/services/investment" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    children: [
      { label: "All articles", href: "/blog" },
      { label: "Market Insights", href: "/blog/market-insights" },
      { label: "Investment Strategies", href: "/blog/investment-strategies" },
      { label: "Buying & Selling Tips", href: "/blog/buying-selling-tips" },
      { label: "Property Management", href: "/blog/property-management" },
      { label: "South Florida Spotlight", href: "/blog/south-florida-spotlight" },
      { label: "Client Success Stories", href: "/blog/client-success-stories" },
    ],
  },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

// No posts are published yet (see blog/[category]/page.tsx) — rather than
// fabricate fake articles, each category previews the actual *topics* it
// will cover and why that category is worth following, so the page still
// reads as substantive rather than a bare "coming soon."
export const BLOG_CATEGORIES = [
  {
    id: "market-insights",
    label: "Market Insights",
    blurb: "Where South Florida real estate is heading, in plain terms.",
    whyItMatters:
      "Prices, inventory, and demand shift constantly in South Florida's market. This is where we'll translate what's actually happening into plain-language takes, instead of raw data you have to interpret yourself.",
    topics: [
      "Quarterly market recaps for the neighborhoods we work in most",
      "What rising or falling inventory actually means for buyers vs. sellers",
      "How interest rate moves tend to play out locally, not just nationally",
    ],
  },
  {
    id: "investment-strategies",
    label: "Investment Strategies",
    blurb: "How to think about building and protecting a real estate portfolio.",
    whyItMatters:
      "Good investment decisions come from frameworks, not hot tips. This category will cover how we actually think about risk, diversification, and timing for real estate specifically.",
    topics: [
      "Cash flow vs. appreciation: picking a strategy that matches your goals",
      "When it makes sense to diversify into a new property type or market",
      "Common first-time investor mistakes, and how to avoid them",
    ],
  },
  {
    id: "buying-selling-tips",
    label: "Buying & Selling Tips",
    blurb: "Practical guidance for whichever side of the table you're on.",
    whyItMatters:
      "Buying or selling a home is infrequent enough that the process itself is easy to get wrong. This category is the practical, step-by-step guidance we'd normally only give one-on-one.",
    topics: [
      "What actually moves an offer to the top of a seller's pile",
      "A realistic closing timeline, and where delays tend to happen",
      "Staging and pricing decisions that actually affect final sale price",
    ],
  },
  {
    id: "property-management",
    label: "Property Management",
    blurb: "What actually keeps a rental or managed property running well.",
    whyItMatters:
      "The difference between a property that performs and one that doesn't is almost always in the management details. This is where we'll share what we've learned running that side of the business.",
    topics: [
      "Tenant screening practices that actually reduce turnover",
      "Preventative maintenance schedules that save money long-term",
      "How to read a monthly owner statement like a manager does",
    ],
  },
  {
    id: "south-florida-spotlight",
    label: "South Florida Spotlight",
    blurb: "Neighborhood-by-neighborhood looks at the markets we work in.",
    whyItMatters:
      "\"South Florida\" covers a lot of very different markets. This category zooms into specific neighborhoods so you're comparing the right things, not the region as one blob.",
    topics: [
      "Neighborhood profiles: who each area actually fits best",
      "Where new development is concentrated, and what it means for value",
      "Local amenities and lifestyle factors that don't show up in listing data",
    ],
  },
  {
    id: "client-success-stories",
    label: "Client Success Stories",
    blurb: "Real outcomes from working with New Level.",
    whyItMatters:
      "Numbers on a services page only go so far. This category will be real (client-approved) stories of what a specific deal, investment, or management relationship actually looked like.",
    topics: [
      "Before-and-after stories from investment and management clients",
      "What a first-time buyer's experience actually looked like, start to finish",
      "Lessons learned from deals that didn't go as originally planned",
    ],
  },
];

// Homepage search bar (index.html's #choose section). The tabs + keyword
// field are the only inputs that affect the resulting properties.html URL —
// the 5 filter dropdowns below are populated/interactive but intentionally
// decorative (this demo has one real listing, not an MLS inventory to
// filter against).
// Most tabs browse listings (submit routes to /properties?category=<id>,
// the pre-existing behavior) — `contactTopic` marks the ones that aren't a
// browsable category at all, just a lead-capture intent (client ask,
// 2026-08-26: "buying, selling, home evaluation, also a commercial option
// next to the ones we have in the lookup tool"). "Buying" isn't its own
// tab here — it's the same intent "For Sale" already covers, so a second
// tab for it would just duplicate that one's results rather than showing
// anything new; Selling and Home Evaluation route to the same contact
// topic since a valuation is the first step of selling, not a separate
// flow. Commercial IS a browsable category, tying into the new
// `properties` table's category taxonomy.
export const SEARCH_CATEGORIES = [
  { id: "for-sale", label: "For Sale" },
  {
    id: "for-rent",
    label: "For Rent",
    children: [
      { id: "long-term", label: "Long-Term" },
      { id: "short-term", label: "Short-Term" },
      { id: "extended-stay", label: "Extended" },
    ],
  },
  { id: "investment", label: "Investment Properties" },
  { id: "commercial", label: "Commercial" },
  { id: "sell", label: "Selling", contactTopic: "sell" },
  { id: "home-evaluation", label: "Home Evaluation", contactTopic: "sell" },
];

export const SEARCH_FILTERS = {
  neighborhood: [
    "Any",
    "Downtown Miami",
    "Brickell",
    "Coral Gables",
    "Coconut Grove",
    "Wynwood",
    "Miami Beach",
    "Aventura",
    "Key Biscayne",
    "Doral",
    "Fort Lauderdale",
    "Boca Raton",
  ],
  beds: ["Any", "1+", "2+", "3+", "4+", "5+"],
  baths: ["Any", "1+", "2+", "3+", "4+"],
  minPrice: ["Any", "$200k", "$500k", "$1M", "$2M", "$5M"],
  maxPrice: ["Any", "$500k", "$1M", "$2M", "$5M", "$10M+"],
};

export const FOOTER_NAV = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Agents & Partners", href: "/team" },
      { label: "Our Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Brokerage & Consulting", href: "/services/brokerage" },
      { label: "Property Management", href: "/services/management" },
      { label: "Investment", href: "/services/investment" },
      { label: "Events & Networking", href: "/events" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "The Broker's Corner", href: "/brokers-corner" },
      { label: "Content Library", href: "/content-library" },
      { label: "FAQs", href: "/faq" },
      { label: "Property Portfolio", href: "/properties" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Risk Disclosure", href: "/risk-disclosure" },
      { label: "Fair Housing", href: "/fair-housing" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

// =============================================================================
// Properties + the property detail page — ported verbatim from ../content.js.
// =============================================================================

// Beyond `label`/`blurb` (used everywhere as a short tag), each category
// carries enough of its own content to stand as a real landing page rather
// than a filtered grid with a swapped headline: `icon` gives it a shape-
// differentiated visual identity (never a second color, per the sitewide
// one-green rule), `whatToExpect`/`idealFor` frame the category in
// decision-relevant terms, and `faqs` answers the questions specific to
// that kind of stay/sale rather than the generic sitewide FAQ list.
export const PROPERTY_CATEGORIES = [
  {
    id: "luxury-short-term",
    label: "Luxury Short-Term Rentals",
    blurb: "High-end stays for discerning guests.",
    icon: "Gem",
    whatToExpect:
      "Fully furnished, design-forward homes booked by the night or the week, with a service level closer to a boutique hotel than a typical rental: professional cleaning between every stay, concierge-style communication, and amenities picked for the property rather than the lowest common denominator.",
    idealFor: [
      "A milestone trip where the property is part of the occasion, not just where you sleep",
      "Visiting executives or clients who expect a polished, private space over a hotel suite",
      "Photo or content shoots that need a distinctive, camera-ready backdrop",
    ],
    faqs: [
      {
        q: "How is this different from a regular short-term rental?",
        a: "Same night-by-night flexibility, but the properties are selected and presented for it: higher-end finishes, styled interiors, and a service standard (cleaning, communication, turnover) that matches what guests expect at that price point.",
      },
      {
        q: "Is a deposit required?",
        a: "Yes — reserving a date puts down a percentage of the total as a deposit, with the balance charged closer to check-in. The exact breakdown is shown once you pick your dates on a property's page.",
      },
      {
        q: "Can these be booked for a single night?",
        a: "It depends on the property's minimum-night policy, shown on its own listing. Some are set up for single-night stays; others have a short minimum to keep turnover manageable.",
      },
    ],
  },
  {
    id: "short-term",
    label: "Short-Term Rentals",
    blurb: "Flexible stays, days to a few weeks.",
    icon: "Luggage",
    whatToExpect:
      "Furnished homes for guests who need somewhere for a few nights to a few weeks — vacations, family visits, a bridge between two leases — without committing to a hotel or a long-term lease. Booking, pricing, and cancellation terms are all shown up front on the property page.",
    idealFor: [
      "Vacations and family visits where a house beats a hotel room",
      "Contractors or relocating employees who need a home base for a few weeks",
      "Anyone bridging the gap between move-out and move-in dates",
    ],
    faqs: [
      {
        q: "What's the shortest stay I can book?",
        a: "Each listing shows its own minimum night count. Most short-term properties are set up for anywhere from a couple of nights up to a few weeks.",
      },
      {
        q: "Are utilities and Wi-Fi included?",
        a: "Yes — short-term stays are priced all-in. What's included versus billed separately is spelled out in that property's Fees & Policies section.",
      },
    ],
  },
  {
    id: "long-term",
    label: "Long-Term Rentals",
    blurb: "Month-to-month and annual leases.",
    icon: "KeyRound",
    whatToExpect:
      "Traditional leasing: a signed lease term (typically 12 months, with month-to-month options on some units), a security deposit, and the tenant handling their own utilities and day-to-day setup — the same structure as renting anywhere, backed by New Level's property management team for maintenance and communication.",
    idealFor: [
      "Anyone relocating to South Florida who wants a real home base, not a hotel",
      "Tenants who want the stability of a lease instead of month-to-month uncertainty",
      "Owners looking to place a reliable long-term tenant through a managed process",
    ],
    faqs: [
      {
        q: "What's the typical lease term?",
        a: "Most long-term listings are 12-month leases, though some owners offer month-to-month terms — check the specific listing or ask us directly.",
      },
      {
        q: "What does the application process look like?",
        a: "Standard screening: income verification, background/credit check, and references, coordinated through our property management team once you've found a unit you want.",
      },
    ],
  },
  {
    id: "extended-stay",
    label: "Extended Stays",
    blurb: "Weeks to months, fully furnished.",
    icon: "CalendarRange",
    whatToExpect:
      "The middle ground between a short-term rental and a full lease: furnished, move-in-ready homes booked for weeks to a few months, with pricing and terms structured for a longer stay rather than a nightly rate.",
    idealFor: [
      "Traveling professionals or insurance-displacement stays needing a furnished home for a defined stretch of time",
      "Snowbirds spending a season in South Florida",
      "Anyone who wants a real kitchen and living space without signing a full-year lease",
    ],
    faqs: [
      {
        q: "How is pricing structured for an extended stay?",
        a: "Extended stays are typically quoted at a weekly or monthly rate that's lower than the equivalent nightly short-term rate, reflecting the longer commitment.",
      },
      {
        q: "Can an extended stay convert into a long-term lease?",
        a: "In many cases, yes — talk to us before your stay ends if you'd like to explore converting to a standard lease on the same unit.",
      },
    ],
  },
  {
    id: "events",
    label: "Private Events",
    blurb: "Venues set up to host, not just sleep.",
    icon: "PartyPopper",
    whatToExpect:
      "Properties chosen and set up for gatherings — pool decks, open floor plans, parking for guests — rented as a full-day or full-night venue rather than an overnight stay. See the Events page for our calendar and package tiers (Self-Provided through All-Inclusive).",
    idealFor: [
      "Birthdays, showers, weddings, graduations, and religious or corporate gatherings",
      "Anyone who wants a private residential feel instead of a banquet hall",
      "Groups who want catering/entertainment/sound handled for them via a package",
    ],
    faqs: [
      {
        q: "How is an event rental priced differently from a stay?",
        a: "Event rentals are a flat 24-hour rate rather than a per-night rate, plus a refundable security deposit and an optional service package (catering, entertainment, sound, content creation).",
      },
      {
        q: "Can I bring my own vendors instead of a package?",
        a: "Yes — the Self-Provided package is exactly that: you bring your own catering, entertainment, and sound, and only pay the base venue rate.",
      },
    ],
  },
  {
    id: "for-sale",
    label: "For Sale",
    blurb: "Properties available for purchase.",
    icon: "Tag",
    whatToExpect:
      "Full-service brokerage representation for buying or selling: market analysis, showings, negotiation, and coordination through closing. This demo currently has one active listing plus placeholders for what's coming — reach out and we'll walk you through anything on or off this list.",
    idealFor: [
      "Buyers ready to purchase a primary residence or second home in South Florida",
      "Sellers who want a full-service brokerage handling pricing, marketing, and negotiation",
      "Anyone comparing buying versus renting before committing either way",
    ],
    faqs: [
      {
        q: "Do you represent both buyers and sellers?",
        a: "Yes — our licensed team works both sides of a sale, from first valuation conversation through closing.",
      },
      {
        q: "Can you help me sell somewhere outside your current listings?",
        a: "Absolutely — this list reflects what's active in this demo today, not the limit of what we work on. Contact us about any property you're looking to sell.",
      },
    ],
  },
  {
    id: "investment",
    label: "Investment",
    blurb: "Opportunities for portfolio growth.",
    icon: "TrendingUp",
    whatToExpect:
      "Properties and opportunities evaluated for return rather than lifestyle: rental yield, appreciation potential, and how a purchase fits a broader portfolio strategy. Pairs directly with our Investment service — see Services for how we structure that relationship.",
    idealFor: [
      "First-time investors who want a strategy built around their goals and risk tolerance",
      "Existing portfolio owners looking to diversify into new markets or property types",
      "Anyone evaluating a specific property primarily on projected returns",
    ],
    faqs: [
      {
        q: "Do you only work with experienced investors?",
        a: "No — we work with first-time and experienced investors alike. Every relationship starts with understanding your goals and risk comfort before we talk about specific properties.",
      },
      {
        q: "Can New Level manage an investment property after purchase?",
        a: "Yes — our Property Management service is built for exactly that handoff, so you don't need a separate manager once you close.",
      },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    blurb: "Office, retail, industrial, and mixed-use.",
    icon: "Building2",
    whatToExpect:
      "Commercial space across the standard property types — office, retail, industrial, multifamily (5+ units), hospitality, and special-purpose — evaluated the way a business decision should be: location, zoning, lease structure, and total cost of occupancy, not just square footage.",
    idealFor: [
      "Business owners looking for their own space to lease or buy",
      "Investors targeting commercial asset classes rather than residential",
      "Anyone evaluating a mixed-use or multifamily (5+ unit) opportunity",
    ],
    faqs: [
      {
        q: "Do you handle leasing as well as sales?",
        a: "Yes — both. We work with tenants and landlords, and with buyers and sellers.",
      },
      {
        q: "What counts as \"multifamily\" here versus a residential multi-unit property?",
        a: "5 or more units is the standard commercial-financing threshold and is treated as commercial. A 2-4 unit property is generally financed and categorized as residential instead.",
      },
    ],
  },
];

// `photo` fields reuse the real 87th St. property's own photo set as demo
// placeholder imagery for these "coming soon" listings (client confirmed
// 2026-08-21 this is fine for a demo — each card is still clearly labeled
// "Coming soon", it's just not a bare gray box anymore).
export const OTHER_PROPERTIES = [
  { title: "Bay Harbor villa", meta: "Sleeps 10 · Waterfront", rate: "from $600 / night", soon: true, categories: ["luxury-short-term", "short-term"], photo: "05" },
  { title: "Wynwood loft", meta: "Sleeps 6 · Events", rate: "from $900 / day", soon: true, categories: ["events", "short-term"], photo: "14" },
  { title: "Coral Gables estate", meta: "Sleeps 20 · Retreats", rate: "from $750 / night", soon: true, categories: ["extended-stay", "events", "long-term"], photo: "22" },
  { title: "Brickell Skyline Residence", meta: "3 BR · Downtown", rate: "Listed at $1.4M", soon: true, categories: ["for-sale", "investment"], photo: "23" },
];

// Agent contact info and inquiry inbox live in POINT_OF_CONTACT (used
// sitewide on the Contact page) rather than duplicated here — this object
// only carries what's actually specific to the listing itself.
export const PROPERTY = {
  address: "1331 NW 87th Street, Miami, FL",
  city: "Miami-Dade (outside Miami Beach)",
  siteName: "New Level Executive House",
  parentName: "New Level Associates",
  parentUrl: "https://newlevelassociates.com",
  categories: ["luxury-short-term", "short-term", "events", "extended-stay"],
  // Static for now, same convention as LEGAL_LAST_UPDATED — this listing
  // isn't in a real database yet with its own edit-tracked timestamp
  // (see the `properties` table migration for where that's headed), so
  // this is a literal date to update by hand, not computed.
  lastUpdated: "August 26, 2026",
};

// Real specs, pulled directly from the property's actual Airbnb listing
// (client-provided link, 2026-08-24) — not placeholder numbers. Replaces
// earlier placeholder copy that claimed "sleeps up to 16" and a pool;
// neither is accurate for this property (max 9 guests, no pool listed
// among its amenities — private patio/balcony instead).
export const PROPERTY_SPECS = {
  bedrooms: 4,
  beds: 4,
  bathrooms: 3,
  maxGuests: 9,
  bedBreakdown: [
    { room: "Bedroom 1", bed: "1 king bed", photo: "05" },
    { room: "Bedroom 2", bed: "1 queen bed", photo: "08" },
    { room: "Bedroom 3", bed: "1 queen bed", photo: "11" },
    { room: "Bedroom 4", bed: "1 king bed", photo: "12" },
  ],
};

export const AUDIENCE_ORDER = ["corporate", "family", "events", "ministry", "extended"] as const;

export const AUDIENCE_PHOTOS: Record<(typeof AUDIENCE_ORDER)[number], { hero: string; overview: string }> = {
  corporate: { hero: "03", overview: "04" },
  family: { hero: "00", overview: "05" },
  events: { hero: "01", overview: "02" },
  ministry: { hero: "20", overview: "21" },
  extended: { hero: "11", overview: "12" },
};

export const AUDIENCES = {
  corporate: {
    id: "corporate",
    navLabel: "Corporate Retreats",
    cardLabel: "Corporate Retreats & Business Meetings",
    cardMeta: "Offsites · strategy sessions",
    headline: "A private base for the work that moves the company forward.",
    heroSub: "Host the offsite, the board session, or the leadership reset in a full residence built for focus, not a hotel conference floor.",
    rate: 1850,
    overview: "Executive House gives your team a single private setting for multi-day work: room to break out, room to reconvene, and space to actually think between sessions. Fast connectivity, defined work zones, and full-house privacy mean the day runs on your agenda, not a venue's timetable.",
    facts: [
      { k: "Sleeps", v: "Up to 9" },
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
      { t: "On-site parking", d: "Private parking for the team, no garage runs mid-day." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose the range on the calendar. Availability shown is illustrative for this demo." },
      { t: "See the quote", d: "Total updates live with a full tax breakdown, nothing hidden." },
      { t: "Send the inquiry", d: "Your dates, group size and quote come attached automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and finalize the retreat details." },
    ],
    faqs: [
      { q: "Can we run multi-day sessions with breakouts?", a: "Yes, the house is set up for a main working space plus separate breakout areas, so parallel groups don't compete for the same room." },
      { q: "Is the Wi-Fi sufficient for a full team on video?", a: "The property runs on a business-grade fiber connection intended to carry simultaneous video calls. Exact throughput can be confirmed for your group size." },
      { q: "Can we bring in catering or a private chef?", a: "Absolutely. The kitchen and prep areas are catering-ready, and we can point you to vetted local options on request." },
      { q: "Is this a booking or an inquiry?", a: "An inquiry. Submitting sends us your details so we can confirm availability and pricing; no payment is collected and nothing is auto-confirmed." },
    ],
  },
  family: {
    id: "family",
    navLabel: "Family Gatherings",
    cardLabel: "Family Gatherings",
    cardMeta: "Reunions · holidays",
    headline: "Room for the whole family under one roof, finally.",
    heroSub: "Reunions, holidays, and milestone weekends where everyone stays together instead of scattering across three hotels.",
    rate: 1450,
    overview: "When the whole family comes together, the house matters. Executive House keeps everyone in one place: shared meals, open common space, and enough bedrooms that no one draws the short straw. Kids have room to play, grandparents have quiet corners, and the kitchen is big enough to actually cook in.",
    facts: [
      { k: "Sleeps", v: "Up to 9" },
      { k: "Bedrooms", v: "4 bedrooms" },
      { k: "Kitchen", v: "Full chef's kitchen" },
      { k: "Outdoor", v: "Private patio" },
    ],
    included: [
      { t: "Space for everyone", d: "4 bedrooms across the home so the whole family stays under one roof." },
      { t: "Chef's kitchen", d: "Room to cook big shared meals together, not just reheat." },
      { t: "Open common areas", d: "Large living and dining space designed for the group to gather." },
      { t: "Private patio", d: "Outdoor space for the afternoon and slow evenings together." },
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
      { q: "Is it suitable for kids and grandparents together?", a: "Yes, there's open common space for the group plus quieter rooms, so different generations each have their own space." },
      { q: "Can we cook for a big group?", a: "The full chef's kitchen is designed for real cooking, not just reheating, so shared family meals work well here." },
      { q: "Is this a confirmed booking?", a: "No, it's an inquiry. We follow up to confirm availability. No payment is collected in this step." },
    ],
  },
  events: {
    id: "events",
    navLabel: "Private Events",
    cardLabel: "Private Events",
    cardMeta: "Celebrations · milestones",
    headline: "A private setting for the moments worth gathering for.",
    heroSub: "Milestone celebrations, intimate receptions, and private dinners in a residence that feels designed for the occasion.",
    rate: 2200,
    overview: "Some occasions deserve more than a banquet room. Executive House offers a private, full-property setting for celebrations: open indoor-outdoor flow, room to host, and the discretion of a residence rather than a rented hall. You set the guest list and the tone; the house holds it.",
    facts: [
      { k: "Event capacity", v: "By arrangement" },
      { k: "Flow", v: "Indoor / outdoor" },
      { k: "Catering", v: "Full prep kitchen" },
      { k: "Setting", v: "Full private home" },
    ],
    included: [
      { t: "Indoor-outdoor flow", d: "Open living space that connects to the private patio for hosting." },
      { t: "Catering-ready kitchen", d: "Full prep space for caterers or a private chef to work from." },
      { t: "Private setting", d: "The discretion of a full residence rather than a public venue." },
      { t: "Room to host", d: "Generous common areas that hold a gathering without feeling packed." },
      { t: "Evening ambiance", d: "Patio space that carries a celebration into the night." },
      { t: "On-site parking", d: "Parking for guests arriving to the property." },
    ],
    steps: [
      { t: "Pick your dates", d: "Choose your event date on the calendar. Availability is illustrative in this demo." },
      { t: "See the quote", d: "The estimate updates live, with a full tax breakdown." },
      { t: "Send the inquiry", d: "Tell us your guest count; your date and quote attach automatically." },
      { t: "We confirm", d: "We follow up to confirm availability and talk through event details." },
    ],
    faqs: [
      { q: "What kind of events suit the property?", a: "Intimate celebrations, milestone gatherings, private dinners and receptions. Share what you're planning in the inquiry and we'll confirm fit." },
      { q: "Is there a guest capacity for events?", a: "Event capacity is handled case by case depending on the format. Tell us your expected guest count and we'll advise for your dates." },
      { q: "Can we bring our own caterer and vendors?", a: "Yes, the kitchen is set up as a prep base for caterers, and you're welcome to bring your own vendors." },
      { q: "Does submitting confirm the event date?", a: "No, it's an inquiry. We follow up to confirm availability and details. No payment is collected here." },
    ],
  },
  ministry: {
    id: "ministry",
    navLabel: "Church & Ministry",
    cardLabel: "Church & Ministry Retreats",
    cardMeta: "Retreats · gatherings",
    headline: "A quiet place set apart for your community to gather.",
    heroSub: "Leadership retreats, ministry planning, and small-group gatherings in a calm, private residence away from the everyday.",
    rate: 1500,
    overview: "Executive House offers ministry groups a private, unhurried setting to gather, plan, and rest. Room to meet as a whole group and space to break into smaller circles; a full kitchen for shared meals; and the quiet of a residence rather than a conference center. A welcoming space for retreats across traditions.",
    facts: [
      { k: "Sleeps", v: "Up to 9" },
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
      { q: "Is the space suitable for a whole-group gathering?", a: "Yes, there's a common area for the full group to meet, plus smaller rooms for breakout circles and quieter time." },
      { q: "Can the group stay overnight together?", a: "The house is set up for a group to stay together across a multi-day retreat. Share your numbers and we'll confirm the fit." },
      { q: "Can we prepare meals together?", a: "The full kitchen and dining space are made for shared meals. Cooking and eating together as a group works well here." },
      { q: "Is this a booking?", a: "No, it's an inquiry. We follow up to confirm availability for your retreat. No payment is collected in this step." },
    ],
  },
  extended: {
    id: "extended",
    navLabel: "Extended Stays",
    cardLabel: "Extended & Vacation Stays",
    cardMeta: "Long stays · relocations",
    headline: "Settle in for the season, not just the weekend.",
    heroSub: "Extended vacations, seasonal stays, and relocations where you want the comfort of a full home, ready to live in from day one.",
    rate: 1250,
    overview: "For longer stays, a hotel wears thin fast. Executive House lives like a home from the first night: a full kitchen, real living space, and room to settle into a routine. Whether you're between homes, working remotely for a stretch, or spending the season in Miami, it's set up for weeks, not just nights.",
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
      { t: "Private patio", d: "Private outdoor space for the everyday, not just the visit." },
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
      { q: "Is it set up for remote work?", a: "Yes, there's reliable connectivity and dedicated space to work from home comfortably over a longer stay." },
      { q: "Are long-stay rates different?", a: "Long stays are priced differently from nightly bookings. Note that all pricing in this demo is placeholder and not final." },
      { q: "Is this a confirmed booking?", a: "No, it's an inquiry. We follow up to confirm availability and terms. No payment is collected in this step." },
    ],
  },
} satisfies Record<(typeof AUDIENCE_ORDER)[number], unknown>;

// Each highlight carries a lucide icon name (see HIGHLIGHT_ICONS in
// property/page.tsx) — shape-differentiated, not color-coded, matching the
// sitewide icon convention. Client feedback: this section reads as too
// small/easy to miss for something meant to be the property's headline
// facts — rendered as a bold full-width band, not a plain list.
export const HIGHLIGHTS = [
  { icon: "Home", text: "Full private residence: the whole house is yours, not a shared venue" },
  { icon: "BedDouble", text: "4 bedrooms, 4 beds and 3 bathrooms, sleeps up to 9" },
  { icon: "ChefHat", text: "Fully equipped kitchen: dishwasher, oven, stove and dining table" },
  { icon: "Trees", text: "Private patio for outdoor time" },
  { icon: "Car", text: "Free driveway and street parking" },
  { icon: "CalendarCheck", text: "Works for a single-day event or a multi-night stay" },
];

export const RATE_TIERS = {
  event: { id: "event", label: "Single day / night rental", base: 1000, blurb: "Flat rate for the day/night when you provide your own services." },
  stay: { id: "stay", label: "Multi-night stay", perNight: 500, blurb: "Per night, plus taxes. Clean nights × rate." },
};

export const EVENT_MIN_HOURS = 24;
export const EVENT_DEFAULT_CHECKIN_MIN = 15 * 60; // 3:00 PM
export const EVENT_DEFAULT_CHECKOUT_MIN = 15 * 60; // 3:00 PM
export const STAY_DEFAULT_CHECKIN_MIN = 15 * 60; // 3:00 PM
export const STAY_DEFAULT_CHECKOUT_MIN = 11 * 60; // 11:00 AM

export const EVENT_ADDONS = [
  { id: "catering", label: "Catering", desc: "Food & beverage service", price: 850 },
  { id: "dj", label: "Entertainment / DJ", desc: "DJ or live entertainment", price: 650 },
  { id: "sound", label: "Sound system", desc: "PA / speakers / mics", price: 400 },
  { id: "content", label: "Content creation", desc: "Photography / videography", price: 550 },
];

export const EVENT_PACKAGES = [
  {
    id: "self",
    label: "Self-Provided",
    price: 0,
    tagline: "You bring your own vendors: catering, entertainment, sound and content.",
    includes: [] as string[],
  },
  {
    id: "essentials",
    label: "Essentials",
    price: 900,
    tagline: "The basics handled for you: sound system and content creation.",
    includes: ["sound", "content"],
  },
  {
    id: "signature",
    label: "Signature",
    price: 1800,
    popular: true,
    tagline: "Full-service hosting: catering, entertainment and sound, coordinated for you.",
    includes: ["catering", "dj", "sound"],
  },
  {
    id: "allInclusive",
    label: "All-Inclusive",
    price: 2400,
    tagline: "Every New Level service in one flat add-on: nothing left to arrange.",
    includes: ["catering", "dj", "sound", "content"],
  },
];

export const EVENT_TYPES = [
  "Birthday",
  "Baby Shower",
  "Wedding / Anniversary",
  "Graduation",
  "Religious Retreat / Gathering",
  "Corporate Celebration",
  "Other Private Event",
];

export const TAX = {
  lines: [
    { key: "fl_sales", label: "Florida sales tax", rate: 0.06 },
    { key: "surtax", label: "Miami-Dade discretionary surtax", rate: 0.01 },
    { key: "tdt", label: "Miami-Dade Tourist Development Tax", rate: 0.06 },
  ],
  baselineRate: 0.13,
  cdt: { label: "Convention Development Tax (unresolved)", rate: 0.03 },
};

// Reserving a date requires a deposit (percentage of the total, both rate
// tiers) rather than the old flat $500 event-only security deposit. The
// remaining balance auto-charges at the same moment the free-cancellation
// window closes — see computeQuote()'s `cancelCutoff` in booking-context.tsx,
// which this policy treats as both "last free cancellation" and "balance
// auto-charge date," 24 hours before check-in.
export const DEPOSIT_POLICY = {
  percent: 0.2,
  fullChargeHoursBeforeCheckin: 24,
  cancellation: {
    beforeFullCharge:
      "Cancel any time before your balance is auto-charged and your full deposit is refunded.",
    afterFullCharge:
      "Cancel after the balance is charged but before check-in and 50% of your total is refunded.",
    afterCheckin: "No refund once check-in has occurred (no-show).",
  },
};

export const FEES_POLICIES = {
  included: [
    "The full private residence for your dates",
    "Wi-Fi and utilities",
    "On-site parking",
    "Starter linens & essentials",
  ],
  extra: [
    { t: "Deposit to reserve", v: "20% of total, both rate types" },
    { t: "Cleaning fee", v: "$150" },
    { t: "Event package (if New Level provides services)", v: "$900–$2,400" },
    { t: "Lodging taxes", v: "13% (shown in quote)" },
  ],
  houseRules: [
    { t: "Occupancy", d: "The home is rented for the group size agreed in your inquiry. Additional overnight guests aren't permitted without prior written approval." },
    { t: "Smoking & vaping", d: "Not permitted indoors anywhere. A designated outdoor area can be arranged on request." },
    { t: "Events & noise", d: "Amplified music must respect neighborhood quiet hours: after 10:00 PM on weekdays and 11:00 PM on weekends. Keep doors and windows closed during amplified sound." },
    { t: "Parking", d: "Use the driveway and on-site spaces first and keep neighbors' frontage and driveways clear. Overflow or valet parking can be arranged for larger events." },
    { t: "Patio & outdoor areas", d: "Keep the patio tidy after use and be mindful of neighbors, especially in the evening." },
    { t: "Pets", d: "By prior arrangement only. Service animals are always welcome." },
    { t: "Care of the home", d: "Please treat furnishings and finishes with care. Damage beyond normal wear may be applied to the security deposit." },
    { t: "Prohibited", d: "No illegal substances, no firearms, and no unpermitted commercial activity on the property." },
    { t: "Check-in & check-out", d: "Access runs only within your confirmed window; late departures may incur an additional charge." },
  ],
  rulesNote: "House rules shown here are typical examples for this kind of property; the final set is confirmed with your New Level contact before any booking.",
  cancellation: "Inquiries are free and non-committal; nothing is charged until you reserve with a deposit. Once reserved: a full deposit refund any time before your balance auto-charges (24 hours before check-in); a 50% refund of the total if you cancel after that charge but before check-in; no refund on a no-show. See the quote panel above for your specific dates and amounts.",
};

export const NEIGHBORHOOD = {
  blurb: "The home sits in a quiet Miami-Dade residential pocket with quick access to the airport, highways and the city, easy for guests arriving from anywhere.",
  mapQuery: "1331 NW 87th St, Miami, FL 33147",
  nearby: {
    corporate: ["Meeting / coworking space", "Business dining & catering", "Airport ~15 min", "Hotels for overflow staff"],
    family: ["Parks & kid-friendly spots", "Family dining", "Grocery & pharmacy", "Beaches ~25 min"],
    events: ["Event rentals & vendors", "Florists & catering", "Guest & overflow parking", "Nearby hotels for guests"],
    ministry: ["Overflow lodging for groups", "Group-friendly dining", "Ample parking", "Quiet green space"],
    extended: ["Groceries & everyday errands", "Coffee & coworking", "Gym & pharmacy", "Transit & highways"],
  } as Record<(typeof AUDIENCE_ORDER)[number], string[]>,
};

export const REVIEWS = {
  rating: 4.9,
  count: 27,
  howItWorks: "Reviews come from verified New Level guests after their stay or event. We show the guest's first name, the month they visited, and what they used the home for: no anonymous or incentivized reviews.",
  items: [
    { name: "Marcus T.", when: "June 2026", use: "Corporate retreat", stars: 5, text: "Ran a three-day leadership offsite here. The breakout spaces and fast Wi-Fi meant we never had to leave, and the team actually enjoyed the downtime on the patio." },
    // Guest count corrected to fit the property's real 9-guest max (was
    // "Twelve of us," left over from the same placeholder-capacity error
    // fixed elsewhere — see PROPERTY_SPECS.
    { name: "The Reyes Family", when: "May 2026", use: "Family reunion", stars: 5, text: "Eight of us under one roof for a long weekend. Everyone had space, the kitchen handled our big dinners, and the kids basically lived on the patio." },
    { name: "Pastor J. Alvarez", when: "March 2026", use: "Ministry retreat", stars: 4, text: "Quiet, comfortable, and room for our whole group to gather and break out. A calm place to reset for the weekend." },
    // Client-requested inside joke — deliberately absurd, doesn't move
    // REVIEWS.rating/count above since those are fixed, not computed from
    // this array.
    { name: "Gary D.", when: "February 2026", use: "Weekend getaway", stars: 1, text: "Docked four stars because the bath towels were folded into rectangles instead of triangles. Also, a lizard on the patio made prolonged eye contact with me in a way I can only describe as judgmental. Would not stay again on principle." },
    { name: "Priscilla V.", when: "January 2026", use: "Girls' weekend", stars: 1, text: "One star because the ceiling fan only had three speed settings and I personally require a minimum of seven. Also the driveway felt \"too paved\" for my taste. Shelley was very gracious about the whole thing, which honestly made it worse somehow." },
  ],
};

// Teaser strip on the hero — fixed set of 8 photo indices (zero-padded,
// matching the /photos/NN.jpg filenames copied into web/public/photos).
export const GALLERY_STRIP = ["00", "01", "04", "05", "08", "14", "20", "27"];
export const TOTAL_PROPERTY_PHOTOS = 29;

// Full-resolution album hosted by the property photographer.
export const PROPERTY_ALBUM_URL =
  "https://la-chatte-productions.client-gallery.com/gallery/1331-nw-87th-st-final";

export const INQUIRY_ENDPOINT = "";

// =============================================================================
// Content Library — illustrative example posts only (no platform is actually
// connected yet, per the client's roadmap). Each entry can carry its own
// `href` once real per-post links exist (Phase 5); for now they fall back to
// the platform's own link in SOCIALS above. Not real posts — clearly labeled
// as a preview on the page itself.
// =============================================================================
export const CONTENT_LIBRARY_POSTS = [
  {
    platform: "instagram",
    caption: "A look inside 1331 NW 87th Street",
    photo: "00",
  },
  {
    platform: "instagram",
    caption: "Meet the team behind New Level",
    photo: "10",
  },
  {
    platform: "facebook",
    caption: "Market update: what we're seeing across South Florida",
    photo: "20",
  },
  {
    platform: "facebook",
    caption: "Another closing, another happy client",
    photo: "27",
  },
  {
    platform: "tiktok",
    caption: "60-second tour of our featured property",
    photo: "05",
  },
  {
    platform: "tiktok",
    caption: "A day in the life at New Level",
    photo: "25",
  },
  {
    platform: "youtube",
    caption: "Full property walkthrough",
    photo: "15",
  },
  {
    platform: "youtube",
    caption: "What makes New Level different",
    photo: "28",
  },
];
