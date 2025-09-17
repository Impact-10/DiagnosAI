"use client"

import { useState } from "react"
import { HealthChatbot } from "@/components/health-chatbot"
import { Header } from "@/components/header"
import { FeatureCards } from "@/components/feature-cards"
import type { User } from "@supabase/supabase-js"

interface ClientHomeProps {
  user: User
  dailyMessageCount: number
}

export function ClientHome({ user, dailyMessageCount }: ClientHomeProps) {
  const [isChatStarted, setIsChatStarted] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section - Hide when chat is started */}
          {!isChatStarted && (
            <section className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Health Assistant
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Get accurate, personalized health information powered by AI. Access reliable medical guidance 24/7 from
                trusted sources like WHO and CDC.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Daily limit:</span> {dailyMessageCount}/8 messages used today
                </p>
              </div>
            </section>
          )}

          {/* Chat Interface - Expands when chat starts */}
          <HealthChatbot
            onChatStart={() => setIsChatStarted(true)}
            isExpanded={isChatStarted}
            user={user}
            dailyMessageCount={dailyMessageCount}
          />

          {/* Feature Cards - Hide when chat is started */}
          {!isChatStarted && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-center mb-6">Why Choose Our AI Health Assistant</h2>
              <FeatureCards />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
