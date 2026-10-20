"use client"

import { Sparkles } from "lucide-react"

export function MessagesEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Sparkles className="size-6 text-primary" />
      </div>
      <h3 className="mt-3 text-base font-medium text-foreground">
        How can I help you today?
      </h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Send a message below to start your conversation with Supportly.
      </p>
    </div>
  )
}
