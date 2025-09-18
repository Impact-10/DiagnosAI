"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const nav = [
  { label: "Home", href: "/home" },
  { label: "Myths", href: "/myths" },
  { label: "Dos & Don\'ts", href: "/dos-donts" }
]

export function LandingHeader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setIsAuthed(!!data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthed(!!session)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-8">
        <div className="flex items-center gap-10 flex-1 min-w-0">
          <Link href="/home" className="text-xl font-bold tracking-tight text-primary whitespace-nowrap">DiagonsAI</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {nav.map(item => (
              <Link key={item.label} href={item.href} className={(pathname === item.href ? "text-foreground" : "hover:text-foreground/80 ") + " transition-colors"}>{item.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="text-xs text-muted-foreground/70">…</div>
          ) : isAuthed ? (
            <Button asChild className="px-5">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="px-5">
                <Link href="/auth/signup">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
