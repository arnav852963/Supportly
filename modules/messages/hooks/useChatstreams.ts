"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { messageKeys } from "./use-messages"

export function useChatStreams(conversationId?: string) {
  const [streaminText, setStreaminText] = useState("")
  const [isstreaming, setIsstreaming] = useState(false)
  const queryClient = useQueryClient()

  async function sendMessage({
    conversationId: targetId,
    content,
    onChunk,
  }: {
    conversationId?: string
    content: string
    onChunk?: () => void
  }) {
    const activeConversationId = targetId || conversationId
    if (!activeConversationId || !content.trim() || isstreaming) return

    setIsstreaming(true)
    setStreaminText("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          userMessage: content,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to send message")
      }

      // Read the stream chunks as they arrive from OpenAI
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      if (reader) {
        while (true) {
          const { done , value } = await reader.read()
          if (done) break

            accumulated += decoder.decode(value, { stream: true })
            setStreaminText(accumulated)
            onChunk?.()

          // await new Promise((resolve) => setTimeout(() => resolve("") , 1000))


        }
      }

      // 3. Clear temporary streaming state and re-sync final DB bot message
      // setStreaminText("")

      setIsstreaming(false)

      await queryClient.invalidateQueries({
        queryKey: messageKeys.byConversation(activeConversationId),
      })
      await queryClient.invalidateQueries({ queryKey: ["conversations"] })



    } catch (e) {
      console.error("Error in chat stream:", e)
      setStreaminText("")
    }
  }

  return {
    streaminText,
    isstreaming,
    sendMessage,
  }
}
