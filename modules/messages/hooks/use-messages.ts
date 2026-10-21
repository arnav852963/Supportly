"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ROLE } from "@/app/generated/prisma/enums"
import { getMessages, createMessage, updateMessage, deleteMessage } from "../actions"

export const messageKeys = {
  all: ["messages"] as const,
  byConversation: (conversationId: string) => ["messages", conversationId] as const,
}

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: messageKeys.byConversation(conversationId!),
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  })
}

export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      role = ROLE.USER,
    }: {
      conversationId: string
      content: string
      role?: ROLE
    }) => createMessage({ conversationId, content, role }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.byConversation(data.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateMessage(id, content),
    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.byConversation(updatedMessage.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: (deletedMessage) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.byConversation(deletedMessage.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}
