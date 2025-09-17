import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Health information database for RAG pipeline
const healthKnowledgeBase = {
  symptoms: {
    flu: "Common flu symptoms include fever, chills, muscle aches, cough, congestion, runny nose, headaches, and fatigue. Symptoms typically last 3-7 days.",
    covid:
      "COVID-19 symptoms may include fever, cough, shortness of breath, fatigue, muscle aches, headache, loss of taste or smell, sore throat, and congestion.",
    dehydration:
      "Signs of dehydration include thirst, dry mouth, little or no urination, dark-colored urine, fatigue, dizziness, and confusion.",
  },
  prevention: {
    covid:
      "Prevent COVID-19 by getting vaccinated, wearing masks in crowded areas, maintaining social distance, washing hands frequently, and avoiding large gatherings.",
    flu: "Prevent flu by getting annual flu vaccination, washing hands regularly, avoiding close contact with sick people, and maintaining good health habits.",
  },
  general: {
    diet: "A healthy diet includes fruits, vegetables, whole grains, lean proteins, and limited processed foods. Aim for 5-9 servings of fruits and vegetables daily.",
    sleep:
      "Adults need 7-9 hours of sleep per night. Good sleep hygiene includes consistent bedtime, comfortable environment, and avoiding screens before bed.",
    doctor:
      "See a doctor if you have persistent symptoms, high fever, difficulty breathing, chest pain, severe headache, or any concerning health changes.",
  },
}

async function searchKnowledgeBase(query: string) {
  const lowerQuery = query.toLowerCase()
  const relevantInfo = []
  let sources = ["WHO", "CDC"]

  // Search through knowledge base
  for (const [category, items] of Object.entries(healthKnowledgeBase)) {
    for (const [key, value] of Object.entries(items)) {
      if (
        lowerQuery.includes(key) ||
        (category === "symptoms" && lowerQuery.includes("symptom")) ||
        (category === "prevention" && lowerQuery.includes("prevent")) ||
        (key === "diet" && (lowerQuery.includes("diet") || lowerQuery.includes("eat"))) ||
        (key === "sleep" && lowerQuery.includes("sleep")) ||
        (key === "doctor" && (lowerQuery.includes("doctor") || lowerQuery.includes("see")))
      ) {
        relevantInfo.push(value)
        if (key === "diet") sources = ["WHO", "Dietary Guidelines"]
        if (key === "sleep") sources = ["Sleep Foundation", "CDC"]
      }
    }
  }

  return { relevantInfo, sources }
}

async function callGeminiAPI(message: string, context: string[]) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found, using fallback response")
    return {
      response:
        "I'm currently unable to access my full knowledge base. Please consult with a healthcare professional for medical advice.",
      sources: ["Healthcare Professional Recommended"],
    }
  }

  try {
    const prompt = `You are a helpful AI health assistant that provides accurate medical information from trusted sources like WHO and CDC. 

IMPORTANT INSTRUCTIONS:
- Do NOT use any emojis in your response
- Format your response using markdown for better readability (use **bold**, *italic*, bullet points, etc.)
- Provide clear, concise, and professional medical information
- Always include appropriate medical disclaimers

Context from health database:
${context.join("\n")}

User question: ${message}

Please provide a helpful, accurate response based on the context above. If the context doesn't contain relevant information, provide general health guidance and recommend consulting healthcare professionals. Format your response in markdown without using any emojis.

Response:`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm unable to provide a response at this time."

    return {
      response: generatedText,
      sources: ["Gemini AI", "WHO", "CDC", "Medical Literature"],
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      response:
        "I'm experiencing technical difficulties. Please try again later or consult with a healthcare professional for urgent matters.",
      sources: ["Healthcare Professional Recommended"],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { message } = await request.json()

    // Check and update rate limit using the database function
    const { data: canSendMessage, error: rateLimitError } = await supabase.rpc("add_user_message", {
      user_uuid: user.id,
      content: message,
    })

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError)
      return NextResponse.json({ error: "Failed to check rate limit" }, { status: 500 })
    }

    if (!canSendMessage) {
      return NextResponse.json(
        {
          rateLimitExceeded: true,
          error: "Daily message limit exceeded. You can send 8 messages per day.",
        },
        { status: 429 },
      )
    }

    const { relevantInfo, sources } = await searchKnowledgeBase(message)

    let response = ""
    let finalSources = sources

    if (relevantInfo.length > 0) {
      // Use knowledge base info with Gemini API for enhanced response
      const geminiResult = await callGeminiAPI(message, relevantInfo)
      response = geminiResult.response
      finalSources = [...new Set([...sources, ...geminiResult.sources])]
    } else {
      // Use Gemini API for general health queries
      const geminiResult = await callGeminiAPI(message, [])
      response = geminiResult.response
      finalSources = geminiResult.sources
    }

    response = response.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      "",
    )

    if (
      response &&
      !response.toLowerCase().includes("consult") &&
      !response.toLowerCase().includes("healthcare professional")
    ) {
      response +=
        "\n\n**Please note:** This information is for educational purposes only and should not replace professional medical advice. Consult with a healthcare provider for personalized medical guidance."
    }

    return NextResponse.json({
      response,
      sources: finalSources,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your request" }, { status: 500 })
  }
}
