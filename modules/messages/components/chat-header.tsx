"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useConversation,
  useUpdateConversation,
  useDeleteConversation,
} from "@/modules/conversation/hooks"

interface ChatHeaderProps {
  conversationId: string
  onDeleteActive?: () => void
}

export function ChatHeader({ conversationId, onDeleteActive }: ChatHeaderProps) {
  const { data: conversation } = useConversation(conversationId)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")

  const updateMutation = useUpdateConversation()
  const deleteMutation = useDeleteConversation()

  const handleOpenRename = () => {
    setEditTitle(conversation?.title || "")
    setIsRenameOpen(true)
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim()) return

    const newTitle = editTitle.trim()
    setIsRenameOpen(false)
    updateMutation.mutate({ id: conversationId, title: newTitle })
  }

  const handleDelete = () => {
    deleteMutation.mutate(conversationId, {
      onSuccess: () => {
        setIsDeleteOpen(false)
        if (onDeleteActive) onDeleteActive()
      },
    })
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-sm">
            {conversation?.title || "Conversation"}
          </h1>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            AI Assistant
          </span>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Conversation actions</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleOpenRename}>
                <Pencil className="mr-2 size-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename conversation</DialogTitle>
              <DialogDescription>
                Enter a new title for this conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Conversation title"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!editTitle.trim() || updateMutation.isPending}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? All messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
