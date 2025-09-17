-- Create uploaded_files table to track file uploads
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policy for uploaded files
CREATE POLICY "Users can manage their own uploaded files" ON uploaded_files
  FOR ALL USING (
    auth.uid() = user_id AND 
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS uploaded_files_user_id_idx ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS uploaded_files_conversation_id_idx ON uploaded_files(conversation_id);
CREATE INDEX IF NOT EXISTS uploaded_files_message_id_idx ON uploaded_files(message_id);
