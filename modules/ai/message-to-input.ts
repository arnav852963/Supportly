import {assistant , user , type AgentInputItem} from "@openai/agents-core";
import {Message, ROLE} from "@/app/generated/prisma/client";

export function messageToInput(message: Message[]) : AgentInputItem[]{

    return message.map((m) =>{
        if(m.role === ROLE.BOT){
            return assistant(m.content)
        }else{
            return user(m.content)
        }
    })
}