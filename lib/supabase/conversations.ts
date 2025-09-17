import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  uploaded_files?: {
    id: string
    file_name: string
    file_size: number
    file_type: string
    storage_path: string
  }[]
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: Message[]
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return null

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        title,
        created_at,
        updated_at,
        messages (
          id,
          content,
          role,
          created_at,
          uploaded_files (
            id,
            file_name,
            file_size,
            file_type,
            storage_path
          )
        )
      `)
      .eq("id", conversationId)
      .eq("user_id", user.user.id)
      .single()

    if (error) throw error

    // Sort messages by created_at
    if (data.messages) {
      data.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }

    return data as Conversation
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return null
  }
}

export async function saveMessage(
  conversationId: string,
  content: string,
  role: "user" | "assistant",
): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return null

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.user.id,
        content,
        role,
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation's updated_at timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

    return data.id
  } catch (error) {
    console.error("Error saving message:", error)
    return null
  }
}

export async function updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return false

    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId)
      .eq("user_id", user.user.id)

    return !error
  } catch (error) {
    console.error("Error updating conversation title:", error)
    return false
  }
}

export async function generateConversationTitle(messages: Message[]): Promise<string> {
  // Simple title generation based on first user message
  const firstUserMessage = messages.find((m) => m.role === "user")
  if (!firstUserMessage) return "New Conversation"

  const content = firstUserMessage.content.trim()
  if (content.length <= 50) return content

  // Extract first sentence or first 50 characters
  const firstSentence = content.split(".")[0]
  if (firstSentence.length <= 50) return firstSentence + "."

  return content.substring(0, 47) + "..."
}
