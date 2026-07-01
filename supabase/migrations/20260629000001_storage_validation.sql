-- ============================================================================
-- E1-4.11: server-side upload validation for item-photos
--
-- Client-side checks (storageService.validateImageFile) are UX only — a
-- modified client or direct API call can skip them. This enforces the same
-- constraints at the bucket level, where they can't be bypassed: Storage
-- rejects the upload before it ever reaches our RLS policies.
-- ============================================================================

update storage.buckets
set
	file_size_limit = 10485760, -- 10MB; client compresses to a few hundred KB before upload, so this only catches abuse
	allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
where id = 'item-photos';
