// Homepage copy ported from ../content.js (single source of truth for the
// vanilla site). Only the subset used by the sections built so far in this
// Next.js rebuild — extend as more sections get ported.

export const NLG_BRAND = {
  name: "New Level",
  tagline: "Real Estate. Redefined.",
  aboutShort:
    "At New Level, we believe excellence starts with connection. Real estate isn't just about buildings or numbers — it's about people, purpose, and creating lasting value. Our team brings years of expertise and a modern perspective to every partnership.",
};

export const EVENT_CTA = {
  eyebrow: "Hosting an event?",
  heading: "We can help with that too.",
  sub: "Milestone celebrations, private dinners, corporate gatherings — see venues set up to host, not just sleep.",
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
    d: "Buying or selling is more than a transaction — it's a milestone. Our brokerage team makes every step smooth and transparent, from listing to closing.",
  },
  {
    id: "investment",
    t: "Investments",
    d: "We help investors find opportunities that match their ambitions and risk comfort — smart, sustainable strategies to help investments grow the right way.",
  },
  {
    id: "management",
    t: "Property Management",
    d: "From tenant relations to maintenance oversight, we take care of the details that protect your property and keep it performing.",
  },
  {
    id: "events",
    t: "Events & Networking",
    d: "We love creating spaces where people connect and talk real estate in a way that makes sense — some educational, some just good people swapping ideas.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sandra L.",
    role: "Property Owner",
    text: "None compare to the consistency and communication I've experienced here.",
  },
  {
    name: "Marcus W.",
    role: "Investor",
    text: "New Level made investing in real estate feel straightforward and stress-free.",
  },
  {
    name: "David R.",
    role: "Licensed Agent",
    text: "The support, mentorship, and collaborative environment here are unmatched.",
  },
];

export const TEAM = [
  {
    name: "Shelley Lozier",
    role: "Founder & Principal Broker",
    motto: "Every detail, followed through.",
    placeholder: false,
  },
  {
    name: "Team Member",
    role: "Broker · Partner",
    motto: "Real estate is relationships first.",
    placeholder: true,
  },
  {
    name: "Team Member",
    role: "Sales Associate",
    motto: "Find the space that fits the moment.",
    placeholder: true,
  },
  {
    name: "Team Member",
    role: "Property Management",
    motto: "Protect the property, protect the peace of mind.",
    placeholder: true,
  },
];

export const SOCIALS = [
  { name: "Instagram", href: "https://newlevelassociates.com" },
  { name: "Facebook", href: "https://newlevelassociates.com" },
  { name: "TikTok", href: "https://newlevelassociates.com" },
];

export const FOOTER_NAV = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Agents & Partners", href: "/team" },
      { label: "Contact", href: "/contact" },
      { label: "Join Our Network", href: "/contact?topic=join" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Brokerage & Consulting", href: "/services#brokerage" },
      { label: "Property Management", href: "/services#management" },
      { label: "Investment", href: "/services#investment" },
      { label: "Events & Networking", href: "/events" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "The Broker's Corner", href: "/brokers-corner" },
      { label: "FAQs", href: "/faq" },
      { label: "Property Portfolio", href: "/properties" },
    ],
  },
];
