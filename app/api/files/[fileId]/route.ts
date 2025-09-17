import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Generate signed URL for file access
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from("medical-reports")
      .createSignedUrl(file.file_path, 3600) // 1 hour expiry

    if (urlError) {
      return NextResponse.json({ error: "Failed to generate file URL" }, { status: 500 })
    }

    return NextResponse.json({
      ...file,
      signed_url: signedUrl.signedUrl,
    })
  } catch (error) {
    console.error("File retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", params.fileId)
      .eq("user_id", user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("medical-reports").remove([file.file_path])

    if (storageError) {
      console.error("Storage deletion error:", storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("uploaded_files")
      .delete()
      .eq("id", params.fileId)
      .eq("user_id", user.id)

    if (dbError) {
      return NextResponse.json({ error: "Failed to delete file record" }, { status: 500 })
    }

    return NextResponse.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("File deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
