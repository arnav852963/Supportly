"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
    onMutate: async ({ conversationId, content, role = ROLE.USER }) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: messageKeys.byConversation(conversationId),
      })

      // 2. Snapshot previous messages and conversations
      const previousMessages = queryClient.getQueryData<any[]>(
        messageKeys.byConversation(conversationId)
      )
      const previousConversations = queryClient.getQueryData<any[]>(["conversations"])

      // 3. Create optimistic message
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        content,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // 4. Optimistically append message to feed
      queryClient.setQueryData<any[]>(
        messageKeys.byConversation(conversationId),
        (old = []) => [...old, optimisticMessage]
      )

      // 5. Optimistically update preview in sidebar conversation list
      if (previousConversations) {
        queryClient.setQueryData<any[]>(
          ["conversations"],
          previousConversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  updatedAt: new Date(),
                  messages: [{ content, role, createdAt: new Date() }],
                }
              : c
          )
        )
      }

      return { previousMessages, previousConversations, conversationId }
    },
    onError: (_err, _variables, context) => {
      // Rollback on failure
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.byConversation(context.conversationId),
          context.previousMessages
        )
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations"], context.previousConversations)
      }
      toast.error("Failed to send message")
    },
    onSettled: (_data, _error, variables) => {
      // Re-sync with database
      queryClient.invalidateQueries({
        queryKey: messageKeys.byConversation(variables.conversationId),
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
