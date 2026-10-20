"use client"

import { Bot, MessageSquarePlus, Sparkles, Code, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useCreateConversation } from "@/modules/conversation/hooks"

interface ChatWelcomeProps {
  onSelect: (id: string) => void
}

const STARTER_PROMPTS = [
  {
    icon: Sparkles,
    title: "Brainstorm ideas",
    prompt: "Help me brainstorm features for a new SaaS product",
  },
  {
    icon: Code,
    title: "Explain code",
    prompt: "Explain how React Server Actions and optimistic updates work",
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    prompt: "Help me debug a database connection issue in PostgreSQL",
  },
]

export function ChatWelcome({ onSelect }: ChatWelcomeProps) {
  const createMutation = useCreateConversation()

  const handleCreate = (title = "New Chat") => {
    createMutation.mutate(title, {
      onSuccess: (newConvo) => {
        onSelect(newConvo.id)
      },
    })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
        <Bot className="size-7" />
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        Welcome to Supportly
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Select a conversation from the sidebar or start a new chat to begin chatting with your AI assistant.
      </p>

      <Button
        size="lg"
        onClick={() => handleCreate()}
        disabled={createMutation.isPending}
        className="mt-6 gap-2 shadow-xs"
      >
        {createMutation.isPending ? (
          <Spinner className="size-4" />
        ) : (
          <MessageSquarePlus className="size-4" />
        )}
        Start a New Chat
      </Button>

      {/* Starter Prompt Cards */}
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {STARTER_PROMPTS.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              role="button"
              tabIndex={0}
              onClick={() => handleCreate(item.title)}
              className="cursor-pointer text-left transition-all hover:border-primary/50 hover:bg-muted/40"
            >
              <CardContent className="p-4">
                <Icon className="size-4 text-primary" />
                <h3 className="mt-2 text-sm font-medium leading-none">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.prompt}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
