-- Adds placeholder staff tiers above/below editor for the Access page's
-- role dropdown. Client wants more than two tiers to choose from even
-- though only editor/admin carry real permissions yet — private.is_staff/
-- is_admin (0002 migration) are unchanged, so 'viewer' and 'manager' grant
-- zero dashboard access today, same as 'client'. A real permission model
-- for these tiers is deliberately deferred (client: "we're not that big a
-- team yet... placeholders in the meantime").
alter table public.profiles
  drop constraint profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('client', 'viewer', 'editor', 'manager', 'admin'));
