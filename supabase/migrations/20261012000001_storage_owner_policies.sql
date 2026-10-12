-- Let users delete their own uploads.
-- Storage has to select a file before deleting it, so without a select
-- policy the delete policy never matches and nothing can be removed.
-- Also moves from the deprecated `owner` column to `owner_id`.
drop policy if exists "Users can delete their own songs and images." on storage.objects;
drop policy if exists "Users can view their own songs and images." on storage.objects;

create policy "Users can view their own songs and images." on storage.objects
  for select to authenticated
  using (bucket_id in ('songs', 'images') and owner_id = auth.uid()::text);

create policy "Users can delete their own songs and images." on storage.objects
  for delete to authenticated
  using (bucket_id in ('songs', 'images') and owner_id = auth.uid()::text);
