-- Adds a "seeking investors" listing_status tag (client ask, 2026-08-27:
-- properties "we're looking for investors for will come up with the
-- tags") alongside the existing active/pending/sold/off_market values.
-- Part of the Full Portfolio feature: the main Properties browsing pages
-- narrow to active/pending only (see getApprovedListings in
-- properties-public.ts), while a new /portfolio page shows every approved
-- listing regardless of status, tagged, as compact non-clickable cards for
-- anything not currently active/pending — past transactions and
-- investor-seeking properties don't need a full detail page, just to be
-- visible.
alter table public.properties drop constraint properties_listing_status_check;
alter table public.properties add constraint properties_listing_status_check
  check (listing_status in ('active', 'pending', 'sold', 'off_market', 'seeking_investors'));
