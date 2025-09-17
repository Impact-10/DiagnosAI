"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Send, Bot, User, AlertCircle, CheckCircle, Clock, XCircle, Menu, Paperclip, FileText } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import {
  getConversation,
  saveMessage,
  generateConversationTitle,
  updateConversationTitle,
} from "@/lib/supabase/conversations"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User as SupabaseUser } from "@supabase/supabase-js"

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  sources?: string[]
  files?: {
    id: string
    name: string
    size: number
    type: string
    storagePath: string
  }[]
}

const QUICK_QUESTIONS = [
  "What are the symptoms of flu?",
  "How to prevent COVID-19?",
  "When should I see a doctor?",
  "What is a healthy diet?",
  "How much sleep do I need?",
  "What are signs of dehydration?",
]

interface HealthChatbotProps {
  onChatStart?: () => void
  isExpanded?: boolean
  user: SupabaseUser
  dailyMessageCount: number
  conversationId?: string | null
  onToggleSidebar?: () => void
}

export function HealthChatbot({
  onChatStart,
  isExpanded = false,
  user,
  dailyMessageCount,
  conversationId,
  onToggleSidebar,
}: HealthChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessageCount, setCurrentMessageCount] = useState(dailyMessageCount)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)

  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    } else {
      // Reset to initial state for new conversation
      setMessages([
        {
          id: "1",
          content: `Hello ${user.email}! I'm your AI Health Assistant. I can provide reliable health information from trusted sources like WHO and CDC. You can also upload medical reports (PDF, images, Word docs) for personalized analysis. You have ${8 - dailyMessageCount} messages remaining today. How can I help you?`,
          role: "assistant",
          timestamp: new Date(),
          sources: ["WHO", "CDC"],
        },
      ])
    }
  }, [conversationId, user.email, dailyMessageCount])

  const loadConversation = async (convId: string) => {
    setIsLoadingConversation(true)
    try {
      const conversation = await getConversation(convId)
      if (conversation) {
        const formattedMessages: Message[] = conversation.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
          files: msg.uploaded_files?.map((file) => ({
            id: file.id,
            name: file.file_name,
            size: file.file_size,
            type: file.file_type,
            storagePath: file.storage_path,
          })),
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      })
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const createNewConversation = async (): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: "New Conversation",
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      })
      return null
    }
  }

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return

    // Check rate limit
    if (currentMessageCount >= 8) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content:
          "You've reached your daily limit of 8 messages. Please try again tomorrow or upgrade your plan for unlimited access.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    let activeConversationId = conversationId

    // Create new conversation if none exists
    if (!activeConversationId) {
      activeConversationId = await createNewConversation()
      if (!activeConversationId) return
    }

    if (messages.length === 1 && onChatStart) {
      onChatStart()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || "I've uploaded some files for analysis.",
      role: "user",
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    setMessages((prev) => [...prev, userMessage])

    // Save message to database
    const messageId = await saveMessage(activeConversationId, userMessage.content, "user")

    setInput("")
    setUploadedFiles([])
    setShowFileUpload(false)
    setIsLoading(true)

    try {
      const requestBody = {
        message: input || "Please analyze the uploaded files.",
        conversationId: activeConversationId,
        files: uploadedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.rateLimitExceeded) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "You've reached your daily limit of 8 messages. Please try again tomorrow or upgrade your plan for unlimited access.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
          sources: data.sources || ["WHO", "CDC", "Medical Literature"],
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Save assistant message
        await saveMessage(activeConversationId, assistantMessage.content, "assistant")

        setCurrentMessageCount((prev) => prev + 1)

        // Auto-generate title for new conversations
        if (messages.length <= 2) {
          const title = await generateConversationTitle([userMessage, assistantMessage])
          await updateConversationTitle(activeConversationId, title)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again later or consult with a healthcare professional for urgent matters.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    if (currentMessageCount >= 8) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content:
          "You've reached your daily limit of 8 messages. Please try again tomorrow or upgrade your plan for unlimited access.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    setInput(question)
    if (messages.length === 1 && onChatStart) {
      onChatStart()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const remainingMessages = 8 - currentMessageCount

  if (isLoadingConversation) {
    return (
      <Card className="w-full mx-auto shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`w-full mx-auto shadow-lg transition-all duration-500 ${isExpanded ? "max-w-6xl" : "max-w-4xl"}`}>
      <div
        className={`flex flex-col transition-all duration-500 ${isExpanded ? "h-[85vh] min-h-[600px] max-h-[900px]" : "h-[70vh] min-h-[500px] max-h-[800px]"}`}
      >
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onToggleSidebar && (
                <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <Badge variant={remainingMessages > 2 ? "default" : remainingMessages > 0 ? "secondary" : "destructive"}>
                {remainingMessages > 0 ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {remainingMessages}/8 messages remaining today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Resets at midnight</p>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${message.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(message.content)}</p>` }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>

                  {message.files && message.files.length > 0 && (
                    <div className="space-y-1">
                      {message.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded p-2">
                          <FileText className="h-3 w-3" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.sources && (
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</p>
                </div>

                {message.role === "user" && (
                  <div className="p-2 bg-secondary rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing your question...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {!isExpanded && (
          <div className="p-4 border-t bg-muted/30">
            <p className="text-sm font-medium mb-3">Quick Questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {QUICK_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs justify-start h-auto py-2 px-3 whitespace-normal text-left"
                  disabled={remainingMessages <= 0}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Collapsible open={showFileUpload} onOpenChange={setShowFileUpload}>
          <CollapsibleContent className="border-t">
            <div className="p-4">
              <FileUpload
                conversationId={conversationId || "temp"}
                onFilesChange={setUploadedFiles}
                disabled={remainingMessages <= 0}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={remainingMessages <= 0}
                className="flex-shrink-0 bg-transparent"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                remainingMessages > 0
                  ? "Ask about symptoms, prevention, or upload medical reports..."
                  : "Daily limit reached. Try again tomorrow."
              }
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading || remainingMessages <= 0}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && uploadedFiles.length === 0) || remainingMessages <= 0}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">{uploadedFiles.length} file(s) ready to upload</div>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>This AI provides general information only. Consult healthcare professionals for medical advice.</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
