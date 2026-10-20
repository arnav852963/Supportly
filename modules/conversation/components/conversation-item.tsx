"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "cn"
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
import { useUpdateConversation, useDeleteConversation } from "../hooks"

interface ConversationItemProps {
  id: string
  title: string | null
  latestMessage?: string | null
  isActive: boolean
  onSelect: (id: string) => void
  onDeleteActive?: (deletedId: string) => void
}

export function ConversationItem({
  id,
  title,
  latestMessage,
  isActive,
  onSelect,
  onDeleteActive,
}: ConversationItemProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(title || "")

  const updateMutation = useUpdateConversation()
  const deleteMutation = useDeleteConversation()

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim()) return

    const newTitle = editTitle.trim()
    setIsRenameOpen(false)
    updateMutation.mutate({ id, title: newTitle })
  }

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setIsDeleteOpen(false)
        if (isActive && onDeleteActive) {
          onDeleteActive(id)
        }
      },
    })
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect(id)
          }
        }}
        className={cn(
          "group relative flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
          isActive && "bg-muted font-medium text-foreground shadow-xs"
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-none">
            {title || "Untitled"}
          </p>
          {latestMessage ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {latestMessage}
            </p>
          ) : null}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-6 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                  <span className="sr-only">Actions</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  setEditTitle(title || "")
                  setIsRenameOpen(true)
                }}
              >
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
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename conversation</DialogTitle>
              <DialogDescription>
                Enter a new name for this conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Conversation name"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{title || "Untitled"}&rdquo;?
              This will remove all messages and cannot be undone.
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
