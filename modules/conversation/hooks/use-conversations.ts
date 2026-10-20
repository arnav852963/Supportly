"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from "../actions"

export const conversationKeys = {
  all: ["conversations"] as const,
  detail: (id: string) => ["conversations", id] as const,
}

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: () => getConversations(),
  })
}

export function useConversation(id?: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id!),
    queryFn: () => getConversation(id!),
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title?: string) => createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}

export function useUpdateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateConversation(id, title),
    onMutate: async ({ id, title }) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: conversationKeys.all })
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(id) })

      // 2. Snapshot the previous data for rollback
      const previousConversations = queryClient.getQueryData<any[]>(conversationKeys.all)
      const previousDetail = queryClient.getQueryData<any>(conversationKeys.detail(id))

      // 3. Optimistically update the conversation list in cache
      if (previousConversations) {
        queryClient.setQueryData<any[]>(
          conversationKeys.all,
          previousConversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date() } : c
          )
        )
      }

      // 4. Optimistically update the single conversation detail in cache
      if (previousDetail) {
        queryClient.setQueryData(conversationKeys.detail(id), {
          ...previousDetail,
          title,
          updatedAt: new Date(),
        })
      }

      return { previousConversations, previousDetail, id }
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.all, context.previousConversations)
      }
      if (context?.previousDetail && context?.id) {
        queryClient.setQueryData(conversationKeys.detail(context.id), context.previousDetail)
      }
      toast.error("Failed to rename conversation")
    },
    onSettled: (_data, _error, variables) => {
      // Re-sync with database
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.id) })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      queryClient.removeQueries({ queryKey: conversationKeys.detail(id) })
    },
  })
}
