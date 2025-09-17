import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientHome } from "@/components/client-home"

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's daily message count
  const { data: messageCount } = await supabase.rpc("check_daily_message_limit", {
    user_uuid: data.user.id,
  })

  return <ClientHome user={data.user} dailyMessageCount={messageCount || 0} />
}
