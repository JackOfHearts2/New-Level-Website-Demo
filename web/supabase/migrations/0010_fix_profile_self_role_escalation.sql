-- SECURITY FIX: profiles_update_own (migration 0001) has no explicit
-- WITH CHECK clause. Per Postgres RLS semantics, an UPDATE policy with no
-- WITH CHECK defaults to reusing its USING expression — which for this
-- policy is just `id = auth.uid()`. That means ANY signed-in user could
-- change ANY column on their own row, including `role`, e.g.:
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', ownId)
-- RLS policies for the same command are OR'd together, so
-- profiles_update_admin (admin-only) doesn't prevent this — this policy
-- alone already permitted it. A real privilege-escalation vulnerability.
-- Checked live data (2026-08-26): only 2 real profiles exist (1 client,
-- 1 admin) — no evidence of exploitation.
--
-- Fixed with a trigger (same pattern as private.guard_change_request_update
-- in migration 0004) rather than a WITH CHECK subquery, since RLS can't
-- easily compare OLD.role to NEW.role in a plain boolean expression.
create or replace function private.guard_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.is_admin(auth.uid()) then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Not allowed to change your own role.';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_self_update
  before update on public.profiles
  for each row execute function private.guard_profile_self_update();
