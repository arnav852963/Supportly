"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ROLE } from "@/app/generated/prisma/enums"
import { useMessages } from "../hooks"
import { MessageItem } from "./message-item"
import { MessagesEmpty } from "./messages-empty"

interface MessageListProps {
  conversationId: string
  streaminText?: string
  isstreaming?: boolean
}

export function MessageList({
  conversationId,
  streaminText = "",
  isstreaming = false,
}: MessageListProps) {
  const { data: messages, isLoading, isError, refetch } = useMessages(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages?.length, streaminText])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-start gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-14 w-2/3 rounded-2xl rounded-tl-xs" />
        </div>
        <div className="flex flex-row-reverse items-start gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-10 w-1/2 rounded-2xl rounded-tr-xs" />
        </div>
        <div className="flex items-start gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-20 w-3/4 rounded-2xl rounded-tl-xs" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-destructive">Failed to load messages</p>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2">
          Try again
        </Button>
      </div>
    )
  }

  if ((!messages || messages.length === 0) && !isstreaming) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <MessagesEmpty />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 px-6">
      <div className="space-y-1 py-4">
        {messages?.map((msg) => (
          <MessageItem
            key={msg.id}
            id={msg.id}
            content={msg.content}
            role={msg.role}
            createdAt={msg.createdAt}
          />
        ))}

        {/* Real-time Streaming AI Response */}
        {isstreaming && (
          <MessageItem
            id="streaming-bot"
            content={streaminText || "Thinking..."}
            role={ROLE.BOT}
          />
        )}

        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  )
}
