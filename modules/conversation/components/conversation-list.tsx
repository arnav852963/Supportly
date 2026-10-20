"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useConversations } from "../hooks"
import { ConversationItem } from "./conversation-item"
import { ConversationEmpty } from "./conversation-empty"

interface ConversationListProps {
  activeId: string | null
  onSelect: (id: string) => void
  onDeleteActive?: (deletedId: string) => void
}

export function ConversationList({
  activeId,
  onSelect,
  onDeleteActive,
}: ConversationListProps) {
  const { data: conversations, isLoading, isError, refetch } = useConversations()

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-destructive">Failed to load conversations</p>
        <Button variant="ghost" size="xs" onClick={() => refetch()} className="mt-2">
          Try again
        </Button>
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return <ConversationEmpty onSelect={onSelect} />
  }

  return (
    <ScrollArea className="h-full px-2">
      <div className="space-y-1 py-2">
        {conversations.map((convo) => (
          <ConversationItem
            key={convo.id}
            id={convo.id}
            title={convo.title}
            latestMessage={convo.messages?.[0]?.content}
            isActive={convo.id === activeId}
            onSelect={onSelect}
            onDeleteActive={onDeleteActive}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
