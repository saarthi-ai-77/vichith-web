-- 011_storage_generations.sql
-- Create the generations bucket for generated images and video.

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'generations',
  'generations',
  false, -- private bucket, users must authenticate
  false,
  104857600, -- 100MB limit for generated video files
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'generations' bucket

-- 1. Service role has full access (insert/update/delete)
CREATE POLICY "Service role has full access to generations"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'generations');

-- 2. Authenticated users can read their own generations
-- We assume the object path follows the pattern: userId/...
-- E.g. 123e4567-e89b-12d3-a456-426614174000/job-abc.mp4
CREATE POLICY "Users can read their own generations"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'generations' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);
