-- Lightweight first-party visitor traffic tracking for the admin Analytics
-- page. No cookies, no IP storage, no third-party vendor — just a
-- per-tab session id (sessionStorage, generated client-side, never tied to
-- an account) so the dashboard can show unique-session counts alongside
-- raw pageviews. Same anon-insert shape as problem_reports/
-- newsletter_subscribers: any visitor can write a row, only staff can
-- read the table back.
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views(created_at desc);
create index page_views_path_idx on public.page_views(path);

alter table public.page_views enable row level security;

create policy page_views_insert_anon
  on public.page_views for insert
  with check (true);

create policy page_views_select_admin
  on public.page_views for select
  using (private.is_admin((select auth.uid())));
