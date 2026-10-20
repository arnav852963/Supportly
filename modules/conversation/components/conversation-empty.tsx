"use client"

import { MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useCreateConversation } from "../hooks"

interface ConversationEmptyProps {
  onSelect: (id: string) => void
}

export function ConversationEmpty({ onSelect }: ConversationEmptyProps) {
  const createMutation = useCreateConversation()

  const handleCreate = () => {
    createMutation.mutate("New Conversation", {
      onSuccess: (newConvo) => {
        onSelect(newConvo.id)
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MessageSquarePlus className="size-6" />
      </div>
      <h3 className="mt-3 text-sm font-medium text-foreground">No conversations</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Your chat history will appear here.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={handleCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? <Spinner className="size-3.5" /> : null}
        Start first chat
      </Button>
    </div>
  )
}
