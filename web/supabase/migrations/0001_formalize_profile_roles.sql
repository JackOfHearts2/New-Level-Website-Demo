-- Formalizes profiles.role, which previously had no constraint at all
-- (free text, default 'client', unused by any RLS policy or app code).
-- Restricts it to the three roles this app actually understands today.
-- 'agent' (roadmap Phase 4 — a separate agent-facing portal) is
-- deliberately left out for now; widening this constraint later is a
-- trivial one-line follow-up migration.
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('client', 'editor', 'admin'));
