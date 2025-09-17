-- Update user_messages table to include conversation tracking
ALTER TABLE user_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS user_messages_conversation_id_idx ON user_messages(conversation_id);
