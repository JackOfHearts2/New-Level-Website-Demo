-- Photo storage for listings — the last piece of the properties feature
-- (client ask, 2026-08-26: "upload the pictures and be able to arrange
-- them in that section based on whatever they want to show first").
--
-- Public bucket, not the private pending-uploads pattern content images
-- use: that pattern exists because SiteContent has no draft/pending state
-- of its own prior to a separate approval step, so an unapproved image
-- needs somewhere to sit that isn't live. Properties already have a
-- draft/pending/approved status on the row itself (migration 0016) — a
-- draft or pending property is never shown to the public regardless of
-- what photos are attached to it, so gating visibility a second time at
-- the storage layer would be redundant. SELECT is open on this bucket
-- (same as any public asset bucket); the property's own status is what
-- actually controls whether anyone finds their way to these photos in
-- the first place, not per-object storage permissions.
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

-- Path convention: <property-id>/<filename>. Upload requires being staff
-- AND either owning that property or being admin — mirrors
-- pending_uploads_insert_staff's shape but keyed by property ownership
-- instead of the uploader's own user id, since any staff member editing a
-- listing (not just whoever created it) should be able to add photos.
create policy property_photos_insert_staff
  on storage.objects for insert
  with check (
    bucket_id = 'property-photos'
    and private.is_staff((select auth.uid()))
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[1]
        and (p.submitted_by = (select auth.uid()) or private.is_admin((select auth.uid())))
    )
  );

create policy property_photos_select_public
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy property_photos_delete_staff
  on storage.objects for delete
  using (
    bucket_id = 'property-photos'
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[1]
        and (p.submitted_by = (select auth.uid()) or private.is_admin((select auth.uid())))
    )
  );
