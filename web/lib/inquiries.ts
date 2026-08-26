export type InquirySource = "property" | "contact" | "careers";
export type InquiryStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export const INQUIRY_STATUSES: InquiryStatus[] = ["new", "contacted", "qualified", "converted", "lost"];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

export const INQUIRY_SOURCE_LABELS: Record<InquirySource, string> = {
  property: "Property inquiry",
  contact: "Contact form",
  careers: "Careers",
};
