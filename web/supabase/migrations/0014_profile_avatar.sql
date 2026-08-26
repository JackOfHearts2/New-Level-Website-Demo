-- Avatar photo support (client ask, 2026-08-26): "I also wanna see a
-- picture. So I can identify that." Reuses the same site-admin Netlify
-- Blobs store and /api/site-image/[key] route as everything else — the
-- avatar's blob key is `avatar-<user id>`, scoped by RLS to the owner via
-- the existing profiles_update_own policy (writes go through profiles,
-- not a new table).
alter table public.profiles add column if not exists avatar_updated_at timestamptz;
