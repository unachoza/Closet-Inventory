-- ============================================================================
-- NTW item-photo Storage bucket (E1-2.1 stub)
--
-- item_photos.url points HERE, not at base64 in a row. This sets up the bucket
-- + object-level RLS. The upload pipeline + base64 migration (E1-2.1/2.2) build
-- on top of this. Convention: object path is `<user_id>/<item_id>/<filename>`,
-- so ownership is the first path segment.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do nothing;

-- Authenticated users manage only objects under their own `<user_id>/...` prefix.
-- (storage.foldername(name))[1] is the first path segment.
create policy item_photos_storage_select on storage.objects
	for select to authenticated
	using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy item_photos_storage_insert on storage.objects
	for insert to authenticated
	with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy item_photos_storage_update on storage.objects
	for update to authenticated
	using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy item_photos_storage_delete on storage.objects
	for delete to authenticated
	using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text);
