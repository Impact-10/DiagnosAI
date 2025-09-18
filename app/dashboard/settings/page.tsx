import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SettingsClient from "./settings-client"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <SettingsClient user={user} />
}
