import {run} from "@openai/agents"

import prisma from "@/lib/prisma";

import {supportlyAgent} from "@/modules/ai/agent";

import {messageToInput} from "@/modules/ai/message-to-input";
import {ROLE} from "@/app/generated/prisma/enums";
import {Message} from "@/app/generated/prisma/client";

export async function saveUserMessage(conversationId: string, content: string) {
    await  prisma.message.create({
        data:{
            id: crypto.randomUUID(),
            conversationId,
            role: ROLE.USER,
            content
        }
    })

    await prisma.conversation.update({
        where:{id : conversationId},
        data:{
            updatedAt: new Date()
        }
    })
}

export async function saveBotMessage(conversationId: string, content: string) {
    await  prisma.message.create({
        data:{
            id: crypto.randomUUID(),
            conversationId,
            role: ROLE.BOT,
            content
        }
    })

    await prisma.conversation.update({
        where:{id : conversationId},
        data:{
            updatedAt: new Date()
        }
    })
}

export const getConversationMessages = async (conversationId : string)  => {

    const messages  = await prisma.message.findMany({
        where:{
             conversationId
        },
        orderBy:{ updatedAt:"asc" }
    })

    return messages

}

export async function runStreamingSupportChat(conversationId: string , userMessage: string){

    await saveUserMessage(conversationId , userMessage)

    const messages: Message[] = await getConversationMessages(conversationId)

    const agentStreams  = await run(supportlyAgent , messageToInput(messages) , {stream: true} );

    const textStream   = agentStreams.toTextStream();
    let reply  = "";


    return new ReadableStream<string>({
        async start(controller) {
            try {
                for await (const chunk of textStream) {
                    reply += chunk;
                    console.log( "bot reply here --> ", reply)
                    controller.enqueue(chunk);
                }
                await saveBotMessage(conversationId , reply)

            } catch (e) {
                console.error("Error in runStreamingSupportChat:", e);

            }
            finally {
                controller.close()
            }
        }
    })



}




