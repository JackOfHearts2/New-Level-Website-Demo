-- Per-user layout preferences for the admin dashboard (client ask,
-- 2026-08-26): sidebar_order lets a user move nav items they care about
-- above ones they don't; dashboard_view switches between preset Dashboard
-- home layouts. Deliberately NOT a free-form resizable grid — client
-- landed on "toggle between different views" + priority reordering, not
-- true drag-resize, once we talked through it.
alter table public.profiles add column if not exists sidebar_order jsonb;
alter table public.profiles add column if not exists dashboard_view text not null default 'overview'
  check (dashboard_view in ('overview', 'compact'));
