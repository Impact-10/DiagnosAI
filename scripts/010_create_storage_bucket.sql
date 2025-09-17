-- Create storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-reports',
  'medical-reports',
  false,
  10485760, -- 10MB limit per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policy for medical reports
CREATE POLICY "Users can upload their own medical reports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own medical reports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own medical reports" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
