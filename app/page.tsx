"use client"

import { useState } from "react"
import { ConversationSidebar } from "@/modules/conversation"
import { ChatPanel } from "@/modules/messages"

export default function Home() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <ConversationSidebar
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onDeleteActive={() => setActiveConversationId(null)}
      />
      <ChatPanel
        conversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onDeleteActive={() => setActiveConversationId(null)}
      />
    </main>
  )
}
