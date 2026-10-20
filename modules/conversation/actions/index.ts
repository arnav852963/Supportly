"use server"

import { getSession } from "@/modules/auth/actions/session"
import prisma from "@/lib/prisma"

export async function getConversations() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.conversation.findMany({
    where: { creatorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function getConversation(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!conversation || conversation.creatorId !== session.user.id) {
    throw new Error("Conversation not found")
  }

  return conversation
}

export async function createConversation(title?: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.conversation.create({
    data: {
      id: crypto.randomUUID(),
      title: title?.trim() || "New Conversation",
      creatorId: session.user.id,
    },
  })
}

export async function updateConversation(id: string, title: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.conversation.findUnique({ where: { id } })
  if (!existing || existing.creatorId !== session.user.id) {
    throw new Error("Conversation not found")
  }

  return prisma.conversation.update({
    where: { id },
    data: { title: title.trim() },
  })
}

export async function deleteConversation(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.conversation.findUnique({ where: { id } })
  if (!existing || existing.creatorId !== session.user.id) {
    throw new Error("Conversation not found")
  }

  await prisma.message.deleteMany({ where: { conversationId: id } })
  return prisma.conversation.delete({ where: { id } })
}
