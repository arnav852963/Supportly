"use client"

import { useState } from "react"
import { Bot, User, MoreHorizontal, Pencil, Trash2, Copy, Check } from "lucide-react"
import { cn } from "cn"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROLE } from "@/app/generated/prisma/enums"
import { useUpdateMessage, useDeleteMessage } from "../hooks"

interface MessageItemProps {
  id: string
  content: string
  role: ROLE | "USER" | "BOT"
  createdAt?: Date | string
}

export function MessageItem({ id, content, role, createdAt }: MessageItemProps) {
  const isUser = role === ROLE.USER
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [copied, setCopied] = useState(false)

  const updateMutation = useUpdateMessage()
  const deleteMutation = useDeleteMessage()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  const handleSaveEdit = () => {
    if (!editContent.trim()) return

    updateMutation.mutate(
      { id, content: editContent.trim() },
      {
        onSuccess: () => setIsEditing(false),
      }
    )
  }

  const handleCancelEdit = () => {
    setEditContent(content)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "group flex w-full items-start gap-3 py-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-primary/10 text-primary font-medium"
          )}
        >
          {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Bubble + Actions */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        {isEditing ? (
          <div className="w-full min-w-72 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-sm"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group/bubble">
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words",
                isUser
                  ? "rounded-tr-xs bg-primary text-primary-foreground"
                  : "rounded-tl-xs border bg-card text-card-foreground"
              )}
            >
              {content}
            </div>

            {/* Quick Actions Menu */}
            <div
              className={cn(
                "absolute top-1 opacity-0 transition-opacity group-hover/bubble:opacity-100",
                isUser ? "-left-8" : "-right-8"
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="size-3" />
                      <span className="sr-only">Message options</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align={isUser ? "end" : "start"} className="w-32">
                  <DropdownMenuItem onClick={handleCopy}>
                    {copied ? (
                      <Check className="mr-2 size-3 text-green-500" />
                    ) : (
                      <Copy className="mr-2 size-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </DropdownMenuItem>

                  {isUser ? (
                    <DropdownMenuItem
                      onClick={() => {
                        setEditContent(content)
                        setIsEditing(true)
                      }}
                    >
                      <Pencil className="mr-2 size-3" />
                      Edit
                    </DropdownMenuItem>
                  ) : null}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 size-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {createdAt ? (
          <span className="mt-1 px-1 text-[10px] text-muted-foreground">
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null}
      </div>
    </div>
  )
}
