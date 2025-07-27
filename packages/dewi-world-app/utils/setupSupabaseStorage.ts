// Supabase Storage Setup Instructions for DEWI World
// Run these commands in your Supabase SQL Editor to set up image storage

export const SUPABASE_STORAGE_SETUP = `
-- Create locations storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('locations', 'locations', true);

-- Create storage policy for public read access
CREATE POLICY "Public read access for locations bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'locations');

-- Create storage policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload to locations bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy for users to update their own uploads
CREATE POLICY "Users can update their own files in locations bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'locations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for users to delete their own uploads
CREATE POLICY "Users can delete their own files in locations bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'locations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
`;

console.log('To set up Supabase Storage for locations:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to Storage');
console.log('3. Run the SQL commands above in the SQL Editor');
console.log('4. Your images will be stored publicly in the "locations" bucket');
