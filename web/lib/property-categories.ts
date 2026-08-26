// Matches the `properties_subcategory_check` constraint in migration
// 0016_properties_listings.sql exactly — Residential/Rental follow the nav
// structure the client dictated, Commercial follows the standard 6-way CRE
// classification (client-authorized to research rather than guess).
export const PROPERTY_CATEGORIES = {
  residential: {
    label: "Residential",
    subcategories: {
      single: "Single-family",
      multi: "Multi-family (2-4 units)",
      other: "Other residential",
    },
  },
  commercial: {
    label: "Commercial",
    subcategories: {
      office: "Office",
      retail: "Retail",
      industrial: "Industrial",
      multifamily: "Multifamily (5+ units)",
      hospitality: "Hospitality",
      special_purpose: "Special purpose",
    },
  },
  rental: {
    label: "Rental",
    subcategories: {
      short_term: "Short-term",
      long_term: "Long-term",
      extended_stay: "Extended stay",
    },
  },
} as const;

export type PropertyCategory = keyof typeof PROPERTY_CATEGORIES;

export function isValidSubcategory(category: string, subcategory: string): boolean {
  const cat = PROPERTY_CATEGORIES[category as PropertyCategory];
  if (!cat) return false;
  return subcategory in cat.subcategories;
}

export const LISTING_STATUSES = ["active", "pending", "sold", "off_market"] as const;
export const PRICE_PERIODS = ["sale", "night", "month", "year"] as const;

export type PropertyStatus = "draft" | "pending" | "changes_requested" | "approved" | "rejected" | "withdrawn";

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: "draft — not submitted",
  pending: "pending review",
  changes_requested: "changes requested",
  approved: "live",
  rejected: "rejected",
  withdrawn: "withdrawn",
};
