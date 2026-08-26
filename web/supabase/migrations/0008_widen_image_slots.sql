-- Widens image_slot from a fixed 2-value enum ('logo', 'hero-bg') to a
-- pattern check, so the Content/Media unification (per-team-member photos,
-- per-testimonial avatars, keyed team-<n>/testimonial-<n>) doesn't need a
-- new migration every time a slot is added. A regex shape-check (rather
-- than an exact enum) is safe here because the app layer only ever
-- generates these keys from the actual team/testimonials array length —
-- there's no user-facing input that writes an arbitrary slot string.
alter table public.content_change_requests
  drop constraint content_change_requests_image_slot_check;

alter table public.content_change_requests
  add constraint content_change_requests_image_slot_check
  check (image_slot is null or image_slot ~ '^(logo|hero-bg|team-[0-9]+|testimonial-[0-9]+)$');
