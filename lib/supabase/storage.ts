import { createClient } from "@/lib/supabase/client"

export interface FileUploadResult {
  success: boolean
  data?: {
    path: string
    fullPath: string
    id: string
  }
  error?: string
}

export interface FileUploadLimits {
  canUpload: boolean
  totalFiles: number
  maxTotalFiles: number
  messageFiles?: number
  maxMessageFiles?: number
  error?: string
}

export async function checkFileUploadLimits(
  conversationId: string,
  messageId?: string,
  filesToUpload = 1,
): Promise<FileUploadLimits> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { canUpload: false, totalFiles: 0, maxTotalFiles: 8, error: "Not authenticated" }
    }

    // Check total files for user
    const { count: totalFiles } = await supabase
      .from("uploaded_files")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user.id)

    const totalCount = totalFiles || 0

    if (totalCount + filesToUpload > 8) {
      return {
        canUpload: false,
        totalFiles: totalCount,
        maxTotalFiles: 8,
        error: "Maximum 8 files allowed per user",
      }
    }

    // Check files per message if messageId provided
    if (messageId) {
      const { count: messageFiles } = await supabase
        .from("uploaded_files")
        .select("*", { count: "exact", head: true })
        .eq("message_id", messageId)

      const messageCount = messageFiles || 0

      if (messageCount + filesToUpload > 3) {
        return {
          canUpload: false,
          totalFiles: totalCount,
          maxTotalFiles: 8,
          messageFiles: messageCount,
          maxMessageFiles: 3,
          error: "Maximum 3 files allowed per message",
        }
      }

      return {
        canUpload: true,
        totalFiles: totalCount,
        maxTotalFiles: 8,
        messageFiles: messageCount,
        maxMessageFiles: 3,
      }
    }

    return {
      canUpload: true,
      totalFiles: totalCount,
      maxTotalFiles: 8,
    }
  } catch (error) {
    return {
      canUpload: false,
      totalFiles: 0,
      maxTotalFiles: 8,
      error: "Failed to check upload limits",
    }
  }
}

export async function uploadFile(file: File, conversationId: string, messageId?: string): Promise<FileUploadResult> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check upload limits
    const limits = await checkFileUploadLimits(conversationId, messageId, 1)
    if (!limits.canUpload) {
      return { success: false, error: limits.error }
    }

    // Generate unique file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${user.user.id}/${conversationId}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("medical-reports")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        user_id: user.user.id,
        conversation_id: conversationId,
        message_id: messageId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: uploadData.path,
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("medical-reports").remove([uploadData.path])
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      data: {
        path: uploadData.path,
        fullPath: uploadData.fullPath,
        id: fileRecord.id,
      },
    }
  } catch (error) {
    return { success: false, error: "Upload failed" }
  }
}

export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get file record
    const { data: fileRecord, error: fetchError } = await supabase
      .from("uploaded_files")
      .select("storage_path")
      .eq("id", fileId)
      .eq("user_id", user.user.id)
      .single()

    if (fetchError || !fileRecord) {
      return { success: false, error: "File not found" }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("medical-reports").remove([fileRecord.storage_path])

    if (storageError) {
      return { success: false, error: storageError.message }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("uploaded_files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", user.user.id)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Delete failed" }
  }
}

export async function getFileUrl(storagePath: string): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.storage.from("medical-reports").createSignedUrl(storagePath, 3600) // 1 hour expiry

    return data?.signedUrl || null
  } catch (error) {
    return null
  }
}
