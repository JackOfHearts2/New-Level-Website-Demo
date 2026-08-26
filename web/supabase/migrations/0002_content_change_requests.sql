-- Approval-workflow data model: editors propose content/image changes,
-- admins approve or reject before anything goes live.
--
-- Role-check helpers live in a `private` schema (not exposed by PostgREST)
-- rather than `public` — an earlier version of this migration put them in
-- `public` and the Supabase security advisor immediately flagged them as
-- directly callable via /rest/v1/rpc/is_admin by anon/authenticated,
-- letting anyone probe whether an arbitrary user id is staff. RLS policies
-- can still call a function in another schema (they run in the querying
-- role's context — just needs schema USAGE + function EXECUTE), so this
-- keeps them usable from policies without creating a public endpoint.
create schema if not exists private;

create or replace function private.is_staff(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('editor', 'admin')
  );
$$;

create or replace function private.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_staff(uuid) to anon, authenticated;
grant execute on function private.is_admin(uuid) to anon, authenticated;

create table public.content_change_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('content', 'image')),
  image_slot text check (image_slot in ('logo', 'hero-bg')),
  proposed_content jsonb,
  storage_path text,
  base_content jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint content_change_requests_target_shape check (
    (target_type = 'content' and proposed_content is not null and storage_path is null and image_slot is null)
    or
    (target_type = 'image' and storage_path is not null and image_slot is not null and proposed_content is null)
  )
);

create index content_change_requests_status_idx on public.content_change_requests(status);
create index content_change_requests_submitted_by_idx on public.content_change_requests(submitted_by);

alter table public.content_change_requests enable row level security;

-- Editors see their own submissions (their "my submissions" view); admins
-- see everything.
create policy content_change_requests_select_own_or_admin
  on public.content_change_requests for select
  using (submitted_by = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy content_change_requests_insert_own
  on public.content_change_requests for insert
  with check (submitted_by = (select auth.uid()) and private.is_staff((select auth.uid())));

-- Only admins can approve/reject (i.e. update status/review fields).
create policy content_change_requests_update_admin
  on public.content_change_requests for update
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- Private bucket for image uploads awaiting approval. Netlify Blobs stays
-- the single *live* image store (web/lib/site-content.ts) — nothing here
-- is ever served to visitors; approval moves the bytes into Blobs and
-- deletes the object here.
insert into storage.buckets (id, name, public)
values ('pending-uploads', 'pending-uploads', false)
on conflict (id) do nothing;

-- Uploads must land under a path prefixed with the uploader's own user id
-- (enforced by (storage.foldername(name))[1]), e.g. "<uid>/logo-<ts>".
create policy pending_uploads_insert_staff
  on storage.objects for insert
  with check (
    bucket_id = 'pending-uploads'
    and private.is_staff((select auth.uid()))
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy pending_uploads_select_own_or_admin
  on storage.objects for select
  using (
    bucket_id = 'pending-uploads'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or private.is_admin((select auth.uid()))
    )
  );

create policy pending_uploads_delete_own_or_admin
  on storage.objects for delete
  using (
    bucket_id = 'pending-uploads'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or private.is_admin((select auth.uid()))
    )
  );
