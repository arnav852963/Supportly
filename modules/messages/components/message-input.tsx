"use client"

import { useState, useRef } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { ROLE } from "@/app/generated/prisma/enums"
import { useQueryClient } from "@tanstack/react-query"
import { useCreateMessage, messageKeys } from "../hooks"

interface MessageInputProps {
  conversationId?: string
  onSend?: (content: string) => Promise<void>
  isstreaming?: boolean
}

export function MessageInput({
  conversationId,
  onSend,
  isstreaming = false,
}: MessageInputProps) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const createMutation = useCreateMessage()
  const queryClient = useQueryClient()

  const isBusy = isstreaming || createMutation.isPending

  const handleSend = async () => {
    if (!content.trim() || isBusy) return

    const trimmed = content.trim()
    setContent("")

    // Instantly append user message to the messages list and trigger re-render
    if (conversationId) {
      queryClient.setQueryData<any[]>(
        messageKeys.byConversation(conversationId),
        (old = []) => [
          ...old,
          {
            id: `temp-${Date.now()}`,
            conversationId,
            content: trimmed,
            role: ROLE.USER,
            createdAt: new Date(),
          },
        ]
      )
    }

    if (onSend) {
      try {
        await onSend(trimmed)
      } catch {
        setContent(trimmed)
      } finally {
        textareaRef.current?.focus()
      }
    } else if (conversationId) {
      createMutation.mutate(
        {
          conversationId,
          content: trimmed,
          role: ROLE.USER,
        },
        {
          onError: () => {
            setContent(trimmed)
          },
          onSettled: () => {
            textareaRef.current?.focus()
          },
        }
      )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 bg-background/80 backdrop-blur-xs">
      <div className="relative flex items-end gap-2 rounded-xl border bg-muted/30 p-2 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isstreaming}
          placeholder={
            isstreaming
              ? "AI is responding..."
              : "Ask a question or type a message... (Enter to send, Shift+Enter for new line)"
          }
          rows={1}
          className="min-h-10 resize-none border-0 bg-transparent p-1.5 text-sm shadow-none focus-visible:ring-0 focus-visible:border-0"
        />

        <Button
          size="icon-sm"
          onClick={handleSend}
          disabled={!content.trim() || isBusy}
          className="shrink-0 rounded-lg shadow-xs"
        >
          {isBusy ? (
            <Spinner className="size-3.5" />
          ) : (
            <SendHorizontal className="size-3.5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
