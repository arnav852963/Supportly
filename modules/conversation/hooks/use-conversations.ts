"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
    onSuccess: (_, variables) => {
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
