import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const conversationId = formData.get("conversationId") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (files.length > 3) {
      return NextResponse.json({ error: "Maximum 3 files per message" }, { status: 400 })
    }

    // Check total file count for user
    const { count: totalFiles } = await supabase
      .from("uploaded_files")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((totalFiles || 0) + files.length > 8) {
      return NextResponse.json({ error: "Maximum 8 files total per user" }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 400 })
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
      }

      // Save file metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from("uploaded_files")
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        // Clean up uploaded file
        await supabase.storage.from("medical-reports").remove([uploadData.path])
        return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 })
      }

      uploadedFiles.push(fileRecord)
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
