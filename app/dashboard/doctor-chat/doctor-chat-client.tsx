"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Loader2, PlusCircle, RefreshCw, Send } from "lucide-react"

interface DoctorThread { id: string; title: string; created_at: string; doctor_id: string | null }
interface DoctorMessage { id: string; role: "user" | "doctor" | "system"; content: string; created_at: string }
interface ThreadSummary { id: string; title: string; updated_at: string }
interface Doctor { id: string; full_name: string; specialty: string | null }

export default function DoctorChatClient({ userId }: { userId: string }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("consultations")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [aiThreads, setAiThreads] = useState<ThreadSummary[]>([])
  const [doctorThreads, setDoctorThreads] = useState<DoctorThread[]>([])
  const [activeDoctorThread, setActiveDoctorThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<DoctorMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [creating, setCreating] = useState(false)
  const [creatingSourceThread, setCreatingSourceThread] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedSourceThread, setSelectedSourceThread] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: docs }, { data: threads }, { data: dthreads }] = await Promise.all([
        supabase.from("doctors").select("id, full_name, specialty").limit(50),
        supabase.from("threads").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(30),
        supabase.from("doctor_threads").select("id, title, created_at, doctor_id").order("created_at", { ascending: false }).limit(30)
      ])
      setDoctors(docs || [])
      setAiThreads(threads || [])
      setDoctorThreads(dthreads || [])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadMessages = useCallback(async (doctorThreadId: string) => {
    const { data } = await supabase
      .from("doctor_messages")
      .select("id, role, content, created_at")
      .eq("doctor_thread_id", doctorThreadId)
      .order("created_at", { ascending: true })
    setMessages(data || [])
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [supabase])

  useEffect(() => { loadInitial() }, [loadInitial])
  useEffect(() => { if (activeDoctorThread) loadMessages(activeDoctorThread) }, [activeDoctorThread, loadMessages])

  const createDoctorThread = async () => {
    if (!selectedSourceThread) return
    setCreating(true)
    setCreatingSourceThread(selectedSourceThread)
    try {
      const res = await fetch("/api/doctor-thread", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceThreadId: selectedSourceThread, userId, doctorId: selectedDoctor }) })
      if (res.ok) {
        const data = await res.json()
        await loadInitial()
        setActiveDoctorThread(data.doctorThreadId)
        setSelectedSourceThread(null)
      }
    } finally {
      setCreating(false)
      setCreatingSourceThread(null)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeDoctorThread) return
    const temp: DoctorMessage = { id: `temp-${Date.now()}`, role: "user", content: newMessage, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, temp])
    const content = newMessage
    setNewMessage("")
    const res = await fetch("/api/doctor-message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctorThreadId: activeDoctorThread, content, userId }) })
    if (!res.ok) {
      setMessages(prev => prev.filter(m => m.id !== temp.id))
    } else {
      const { message } = await res.json()
      setMessages(prev => prev.map(m => m.id === temp.id ? message : m))
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const showOnboarding = !loading && doctorThreads.length === 0 && aiThreads.length === 0

  // Mock fallback doctors (UI prototype) if none from DB
  const mergedDoctors: Doctor[] = doctors.length > 0 ? doctors : [
    { id: "m1", full_name: "Dr. Alice Hart", specialty: "Cardiology" },
    { id: "m2", full_name: "Dr. Ben Lee", specialty: "Endocrinology" },
    { id: "m3", full_name: "Dr. Carol Singh", specialty: "General Medicine" },
    { id: "m4", full_name: "Dr. David Ortiz", specialty: "Sports Medicine" },
  ]

  function pickDoctor(id: string) {
    setSelectedDoctor(id)
    setActiveTab("consultations")
  }

  return (
  <div className="flex flex-col gap-6 min-h-[80vh] max-w-7xl mx-auto px-2 sm:px-4 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Doctor Consultations</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">Convert an AI assistant thread into a structured consultation and collaborate with a doctor. This is a prototype UI — doctor responses are not yet live.</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList className="w-fit">
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>
        <TabsContent value="consultations" className="flex-1 mt-4 flex flex-col gap-6">
          {showOnboarding && (
            <Card className="border-dashed">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Getting Started</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>Start a normal AI health chat first. Then return here to convert it into a doctor consultation with an auto-generated clinical summary.</p>
                <p>The summary and recent transcript are inserted as system context for the doctor.</p>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-1 gap-6 overflow-hidden">
            <div className="w-80 flex flex-col gap-4 shrink-0">
              <Card className="flex flex-col h-[340px]">
                <CardHeader className="py-3"><CardTitle className="text-sm">Consultation Threads</CardTitle></CardHeader>
                <CardContent className="pt-0 overflow-y-auto space-y-1 scrollbar-thin">
                  {doctorThreads.map(dt => (
                    <button key={dt.id} onClick={() => setActiveDoctorThread(dt.id)} className={cn("w-full text-left rounded-md px-3 py-2 text-[13px] border transition", dt.id === activeDoctorThread ? "bg-primary/10 border-primary text-primary-foreground/90" : "border-border hover:bg-muted")}>{dt.title}</button>
                  ))}
                  {doctorThreads.length === 0 && <p className="text-xs text-muted-foreground">No consultations yet.</p>}
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="py-3"><CardTitle className="text-sm">New Consultation</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Doctor</label>
                    <Select onValueChange={v => setSelectedDoctor(v)} value={selectedDoctor || undefined}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        {mergedDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.full_name}{d.specialty ? ` — ${d.specialty}` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">AI Thread</label>
                    <Select onValueChange={v => setSelectedSourceThread(v)} value={selectedSourceThread || undefined}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select thread" /></SelectTrigger>
                      <SelectContent>
                        {aiThreads.length === 0 && <div className="px-2 py-1 text-[10px] text-muted-foreground">No assistant threads</div>}
                        {aiThreads.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" className="w-full" disabled={!selectedSourceThread || creating} onClick={createDoctorThread}>
                    {creating && creatingSourceThread === selectedSourceThread ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}<span className="ml-1">Create Consultation</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={loadInitial}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">We’ll summarize the selected AI thread and seed the consultation automatically.</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 flex flex-col rounded-xl border bg-gradient-to-b from-background/60 to-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
              {activeDoctorThread ? (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
                    {messages.map(m => (
                      <div key={m.id} className={cn("group relative rounded-lg p-4 pr-5 text-sm max-w-[720px] border shadow-sm transition", m.role === "user" ? "bg-primary/10 border-primary/40 ml-auto hover:border-primary" : m.role === "doctor" ? "bg-emerald-600/15 border-emerald-600/40 hover:border-emerald-500/60" : "bg-muted/60 border-border hover:border-muted-foreground/40")}> 
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground">{m.role}</span>
                              <span className="text-[10px] text-muted-foreground/60">{/* timestamp placeholder */}</span>
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {m.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                  <div className="border-t border-border bg-background/70 p-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <Textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }}} placeholder="Type a question or note. Shift+Enter for newline." className="min-h-[70px] max-h-48 resize-none" />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()} className="h-11 px-5 self-end"><Send className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 px-1">Messages are not yet visible to a real doctor. Prototype only.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground/90 font-medium">No consultation selected</p>
                    <p className="text-xs max-w-xs text-muted-foreground/70">Create a new consultation from an AI thread on the left or pick an existing one to view its summary and messages.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="doctors" className="mt-4 flex-1">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mergedDoctors.map((d, i) => {
              const initials = d.full_name.split(/\s+/).map(p => p[0]).slice(0,2).join("")
              const rating = (4 + (i % 2 ? 0.5 : 0)).toFixed(1)
              return (
                <Card key={d.id} className="group relative overflow-hidden border-border/60 hover:border-primary/60 transition">
                  <CardHeader className="pb-2 flex flex-row items-start gap-3">
                    <Avatar className="h-11 w-11 border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`} alt={d.full_name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium leading-tight">{d.full_name}</CardTitle>
                      <p className="text-[11px] text-muted-foreground">{d.specialty || "General Practice"}</p>
                      <p className="text-[10px] text-amber-500 font-medium">★ {rating}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground space-y-3">
                    <p>Experienced in evidence-based preventive care and patient-centered guidance.</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => pickDoctor(d.id)}>Select</Button>
                      <Button size="sm" className="h-7 px-2 text-[11px]" disabled>Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export type __DoctorChatClientProps = { userId: string }
