-- Function to check file upload limits (max 8 files total, 3 per message)
CREATE OR REPLACE FUNCTION check_file_upload_limits(
  p_user_id UUID,
  p_conversation_id UUID,
  p_message_id UUID DEFAULT NULL,
  p_files_to_upload INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  total_files INTEGER;
  message_files INTEGER;
BEGIN
  -- Check total files for user (max 8)
  SELECT COUNT(*) INTO total_files
  FROM uploaded_files
  WHERE user_id = p_user_id;
  
  IF total_files + p_files_to_upload > 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Check files per message (max 3) if message_id is provided
  IF p_message_id IS NOT NULL THEN
    SELECT COUNT(*) INTO message_files
    FROM uploaded_files
    WHERE message_id = p_message_id;
    
    IF message_files + p_files_to_upload > 3 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
