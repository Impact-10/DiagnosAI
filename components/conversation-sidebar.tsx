"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

interface ConversationSidebarProps {
  currentConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  className?: string
}

export function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  className = "",
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const supabase = createClient()
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          title,
          created_at,
          updated_at,
          messages(count)
        `)
        .eq("user_id", user.user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      const conversationsWithCount = data.map((conv) => ({
        ...conv,
        message_count: conv.messages?.[0]?.count || 0,
      }))

      setConversations(conversationsWithCount)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const supabase = createClient()
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.user.id,
          title: "New Conversation",
        })
        .select()
        .single()

      if (error) throw error

      const newConversation = {
        ...data,
        message_count: 0,
      }

      setConversations((prev) => [newConversation, ...prev])
      onConversationSelect(data.id)
      onNewConversation()

      toast({
        title: "Success",
        description: "New conversation created",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      })
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("conversations").delete().eq("id", conversationId)

      if (error) throw error

      setConversations((prev) => prev.filter((c) => c.id !== conversationId))

      if (currentConversationId === conversationId) {
        const remaining = conversations.filter((c) => c.id !== conversationId)
        if (remaining.length > 0) {
          onConversationSelect(remaining[0].id)
        } else {
          createNewConversation()
        }
      }

      toast({
        title: "Success",
        description: "Conversation deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      })
    }
  }

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id)
    setEditTitle(conversation.title)
  }

  const saveTitle = async (conversationId: string) => {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("conversations")
        .update({ title: editTitle.trim() })
        .eq("id", conversationId)

      if (error) throw error

      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, title: editTitle.trim() } : c)))

      setEditingId(null)
      toast({
        title: "Success",
        description: "Conversation title updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      })
    }
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={`w-80 border-r bg-muted/30 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-80 border-r bg-muted/30 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <Button onClick={createNewConversation} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new conversation to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentConversationId === conversation.id ? "bg-primary/10 border-primary/20" : ""
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="space-y-2">
                  {editingId === conversation.id ? (
                    <div className="flex items-center space-x-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-6 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTitle(conversation.id)
                          if (e.key === "Escape") cancelEditing()
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          saveTitle(conversation.id)
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelEditing()
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate flex-1">{conversation.title}</h3>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(conversation)
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conversation.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(conversation.updated_at)}</span>
                    <span>{conversation.message_count} messages</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
