import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Doctor Chat' }

// @ts-ignore - recent file addition sometimes not picked up by incremental analyzer
import DoctorChatClient from "./doctor-chat-client"

export default async function DoctorChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return <DoctorChatClient userId={user.id} />
}

