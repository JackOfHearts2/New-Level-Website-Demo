-- Foundational schema for real property listings (approved 2026-08-26 to
-- proceed on: "the AI listing agent, the properties nav restructure with
-- real filters, and the Content/Media page-tree editor all depend on a
-- real properties/listings database table that doesn't exist yet"). Today
-- the "property" page is one hardcoded listing in content.ts, not dynamic
-- data — this is the real table that replaces that going forward.
--
-- Deliberately its own first-class table with a per-row status column,
-- not another content_change_requests wrapper: content_change_requests
-- exists because SiteContent is a single singleton blob that needs a
-- staging copy to diff against, but properties are naturally many
-- independent rows, and a public visitor needs to SELECT approved rows
-- directly — content_change_requests has no public-read policy at all, by
-- design. A per-row status/review workflow (mirroring the same
-- draft/pending/changes_requested/approved/rejected/withdrawn states and
-- the same guard-trigger pattern already used for content_change_requests
-- and profiles) is the more natural fit here.
--
-- category/subcategory follow the nav structure the client dictated for
-- Residential/Rental, and the standard 6-way commercial real estate
-- classification (office/retail/industrial/multifamily/hospitality/
-- special_purpose) researched for Commercial, which the client explicitly
-- authorized researching rather than guessing. Multifamily here means 5+
-- unit buildings (the standard commercial-financing threshold) - a 2-4
-- unit property is "residential > multi" instead, which is the real
-- industry-standard split between the two, not an arbitrary choice.
--
-- Scope note: this migration is schema + RLS only. Photo storage (a public
-- bucket + an upload action reusing saveImage's magic-byte-sniff safety
-- pattern), the admin CRUD UI, the public nav restructure, and filters are
-- all separate, not-yet-built increments - see project_mega_wishlist memory.
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  category text not null check (category in ('residential', 'commercial', 'rental')),
  subcategory text not null,
  status text not null default 'draft' check (status in ('draft', 'pending', 'changes_requested', 'approved', 'rejected', 'withdrawn')),

  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  latitude double precision,
  longitude double precision,

  price numeric,
  price_period text check (price_period in ('sale', 'night', 'month', 'year')),
  beds numeric,
  baths numeric,
  sqft integer,
  year_built integer,
  mls_number text,
  listing_status text not null default 'active' check (listing_status in ('active', 'pending', 'sold', 'off_market')),

  description text,
  source_url text,
  photos jsonb not null default '[]'::jsonb,

  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,

  constraint properties_subcategory_check check (
    (category = 'residential' and subcategory in ('single', 'multi', 'other'))
    or (category = 'commercial' and subcategory in ('office', 'retail', 'industrial', 'multifamily', 'hospitality', 'special_purpose'))
    or (category = 'rental' and subcategory in ('short_term', 'long_term', 'extended_stay'))
  )
);

create index properties_status_idx on public.properties(status);
create index properties_category_idx on public.properties(category, subcategory);
create index properties_submitted_by_idx on public.properties(submitted_by);

alter table public.properties enable row level security;

-- Public (anon + authenticated visitors) sees only approved listings.
create policy properties_select_public
  on public.properties for select
  using (status = 'approved');

-- Staff also see their own rows regardless of status (to keep working on a
-- draft/pending/rejected one), and admins see everything, same shape as
-- content_change_requests_select_own_or_admin.
create policy properties_select_own_or_admin
  on public.properties for select
  using (submitted_by = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy properties_insert_staff
  on public.properties for insert
  with check (submitted_by = (select auth.uid()) and private.is_staff((select auth.uid())));

create policy properties_update_own
  on public.properties for update
  using (submitted_by = (select auth.uid()) and status in ('draft', 'pending', 'changes_requested'))
  with check (submitted_by = (select auth.uid()) and status in ('draft', 'pending', 'withdrawn'));

create policy properties_update_admin
  on public.properties for update
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy properties_delete_admin
  on public.properties for delete
  using (private.is_admin((select auth.uid())));

-- Same reasoning as guard_change_request_update / guard_profile_self_update
-- (migration 0010's real self-role-escalation fix): RLS's WITH CHECK alone
-- can restrict which STATUS values a non-admin can set, but can't pin
-- specific columns (who submitted it, when, who reviewed it) as immutable
-- to everyone except an admin. A trigger is the right tool for that.
create or replace function private.guard_property_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  if private.is_admin(auth.uid()) then
    return new;
  end if;
  if new.submitted_by is distinct from old.submitted_by
     or new.created_at is distinct from old.created_at
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.review_note is distinct from old.review_note then
    raise exception 'Not allowed to change this field on a property listing.';
  end if;
  return new;
end;
$$;

create trigger properties_guard_update
  before update on public.properties
  for each row execute function private.guard_property_update();
