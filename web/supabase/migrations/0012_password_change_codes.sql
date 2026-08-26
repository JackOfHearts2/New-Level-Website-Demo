-- Email-code second factor for password changes — client ask (2026-08-26):
-- "we don't want people to get access to their thing and then try to
-- take control of the site... any password change has to be two
-- factored." Re-verifying the current password (already in place) proves
-- you know the password; this proves you also control the account's
-- email inbox, closing the gap where a stolen/guessed password alone
-- would be enough.
--
-- Deliberately does NOT store the new password anywhere, even hashed —
-- only a hash of the one-time code. The new password stays purely
-- client-side between the two steps and is resubmitted (never persisted)
-- when confirming with the code.
create table public.password_change_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index password_change_codes_user_id_idx on public.password_change_codes(user_id);

alter table public.password_change_codes enable row level security;

create policy password_change_codes_own
  on public.password_change_codes for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
