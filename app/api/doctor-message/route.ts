import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST to append a user message to a doctor thread
export async function POST(req: NextRequest) {
  try {
    const { doctorThreadId, content, userId } = await req.json()
    if (!doctorThreadId || !content || !userId) {
      return NextResponse.json({ error: "doctorThreadId, userId and content required" }, { status: 400 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure ownership of doctor thread
    const { data: thread, error: threadErr } = await supabase
      .from("doctor_threads")
      .select("id")
      .eq("id", doctorThreadId)
      .eq("user_id", userId)
      .single()
    if (threadErr || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    const { data: inserted, error: insErr } = await supabase
      .from("doctor_messages")
      .insert({ doctor_thread_id: doctorThreadId, user_id: userId, role: "user", content })
      .select()
      .single()
    if (insErr) throw insErr

    return NextResponse.json({ message: inserted })
  } catch (e) {
    console.error("Doctor message send error", e)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
