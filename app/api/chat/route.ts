import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { runStreamingSupportChat } from "@/modules/ai/run-streaming-chat";

const streamHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const body = await req.json();
  const conversationId = body.conversationId;
  const userMessage = body.userMessage || body.content;

  if (!conversationId || !userMessage) {
    return new Response("Missing conversationId or userMessage", { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: true },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const stream = await runStreamingSupportChat(conversationId, userMessage);

  return new Response(stream, { headers: streamHeaders });
}
