-- Structured name fields + a short bio for the Settings > Profile section
-- (client ask, 2026-08-26). full_name stays the canonical "how it shows
-- up" display name everywhere it's already read (ProfileMenu, Activity,
-- Approvals labels, etc.) — first_name/last_name are additive, not a
-- replacement, so no existing call site needs to change.
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists bio text;
