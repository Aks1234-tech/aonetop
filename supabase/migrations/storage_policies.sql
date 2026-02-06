-- 1. Create the bucket if it doesn't exist (User already has it, but good for completeness)
-- Force the bucket to be public (in case ON CONFLICT skipped it when it was private)
UPDATE storage.buckets
SET public = true
WHERE id = 'content-images';

-- Verify entries
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;


-- 2. Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- 3. Policy: Allow Public Read Access (Everyone can view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'content-images' );

-- 4. Policy: Allow Authenticated Uploads (Only logged-in users can upload)
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content-images' );

-- 5. Policy: Allow Authenticated Updates (Only logged-in users can replace images)
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content-images' );

-- 6. Policy: Allow Authenticated Deletes (Only logged-in users can remove images)
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'content-images' );
