"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsClientProps {
  user: User
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [email, setEmail] = useState(user.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const callEndpoint = async (path: string, body: any) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Request failed")
    return data
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoadingEmail(true)
    try {
      await callEndpoint("/api/account/update-email", { email })
      setMessage("If required, a confirmation link has been sent to your new email address.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingEmail(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setLoadingPassword(true)
    try {
      await callEndpoint("/api/account/update-password", { password: newPassword })
      setMessage("Password updated successfully")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("This will permanently delete your account and data. Continue?")) return
    setMessage(null)
    setError(null)
    setLoadingDelete(true)
    try {
      await callEndpoint("/api/account/delete", {})
      window.location.href = "/auth/login"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Account Settings</h1>
      {error && (
        <Alert className="border border-red-600/50 bg-red-950/70 backdrop-blur-sm">
          <AlertDescription className="text-red-200 font-medium">{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="border border-emerald-600/40 bg-emerald-950/60 backdrop-blur-sm">
          <AlertDescription className="text-emerald-200 font-medium">{message}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-slate-900/80 backdrop-blur border border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-100">Update Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-200">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="bg-slate-800/70 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                disabled={loadingEmail}
              />
            </div>
            <Button type="submit" disabled={loadingEmail} className="bg-blue-600 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400">
              {loadingEmail ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 backdrop-blur border border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-100">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-200">New Password</label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                required
                className="bg-slate-800/70 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                disabled={loadingPassword}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-200">Confirm Password</label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                className="bg-slate-800/70 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                disabled={loadingPassword}
              />
            </div>
            <Button type="submit" disabled={loadingPassword} className="bg-blue-600 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400">
              {loadingPassword ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/90 border border-red-700/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-red-300 tracking-wide">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">Permanently delete your account and all associated data.</p>
          <Button
            type="button"
            variant="destructive"
            disabled={loadingDelete}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-400"
          >
            {loadingDelete ? "Deleting..." : "Delete Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
