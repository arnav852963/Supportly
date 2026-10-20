"use client"

import { ChatWelcome } from "./chat-welcome"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"

interface ChatPanelProps {
  conversationId: string | null
  onSelectConversation: (id: string) => void
  onDeleteActive?: () => void
}

export function ChatPanel({
  conversationId,
  onSelectConversation,
  onDeleteActive,
}: ChatPanelProps) {
  if (!conversationId) {
    return <ChatWelcome onSelect={onSelectConversation} />
  }

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      <ChatHeader
        conversationId={conversationId}
        onDeleteActive={onDeleteActive}
      />
      <MessageList conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </section>
  )
}
