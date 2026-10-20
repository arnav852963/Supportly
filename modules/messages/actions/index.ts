"use server"

import { getSession } from "@/modules/auth/actions/session"
import prisma from "@/lib/prisma"
import { ROLE } from "@/app/generated/prisma/enums"

export async function getMessages(conversationId: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })
  if (!conversation || conversation.creatorId !== session.user.id) {
    throw new Error("Conversation not found")
  }

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  })
}

export async function createMessage({
  conversationId,
  content,
  role = ROLE.USER,
}: {
  conversationId: string
  content: string
  role?: ROLE
}) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })
  if (!conversation || conversation.creatorId !== session.user.id) {
    throw new Error("Conversation not found")
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        content: content.trim(),
        role,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ])

  return message
}

export async function updateMessage(id: string, content: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const message = await prisma.message.findUnique({
    where: { id },
    include: { conversation: true },
  })

  if (!message || message.conversation.creatorId !== session.user.id) {
    throw new Error("Message not found")
  }

  return prisma.message.update({
    where: { id },
    data: { content: content.trim() },
  })
}

export async function deleteMessage(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const message = await prisma.message.findUnique({
    where: { id },
    include: { conversation: true },
  })

  if (!message || message.conversation.creatorId !== session.user.id) {
    throw new Error("Message not found")
  }

  return prisma.message.delete({ where: { id } })
}
