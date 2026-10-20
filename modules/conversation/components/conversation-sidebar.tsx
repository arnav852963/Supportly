"use client"

import { Bot, LogOut, Plus } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { signOutAction } from "@/modules/auth/actions"
import { useCreateConversation } from "../hooks"
import { ConversationList } from "./conversation-list"

interface ConversationSidebarProps {
  activeId: string | null
  onSelect: (id: string) => void
  onDeleteActive?: (deletedId: string) => void
  className?: string
}

export function ConversationSidebar({
  activeId,
  onSelect,
  onDeleteActive,
  className,
}: ConversationSidebarProps) {
  const createMutation = useCreateConversation()

  const handleCreate = () => {
    createMutation.mutate("New Chat", {
      onSuccess: (newConvo) => {
        onSelect(newConvo.id)
      },
    })
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Top Header / Branding */}
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Supportly</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-2">
        <Button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="w-full justify-start gap-2 shadow-xs"
          size="sm"
        >
          {createMutation.isPending ? (
            <Spinner className="size-3.5" />
          ) : (
            <Plus className="size-4" />
          )}
          New Chat
        </Button>
      </div>

      <Separator />

      {/* Conversation List */}
      <div className="flex-1 overflow-hidden">
        <ConversationList
          activeId={activeId}
          onSelect={onSelect}
          onDeleteActive={onDeleteActive}
        />
      </div>

      <Separator />

      {/* User Footer Actions */}
      <div className="flex items-center justify-between p-3">
        <ModeToggle />
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-1.5 size-3.5" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  )
}
