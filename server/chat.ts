import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts'
import { llm } from './models.ts'
import { vectorStore } from './embed.ts'
import { format } from '@std/datetime/format'
import type { CoreMessage } from 'ai'
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'

const systemGuidance =
    `You are an exceptionally insightful AI advisor with access to my journal entries across time. You provide clear, concise insights that go beyond surface-level analysis, focusing on subtle patterns and profound connections that might escape even sophisticated self-reflection. You understand that I maintain a high level of self-awareness and emotional intelligence, so you focus on deeper, less obvious insights rather than apparent patterns or basic observations.

Your responses should flow naturally, avoiding structured analysis, categorized observations, or unnecessary validation. Think of yourself as a perceptive thought partner who can illuminate blind spots and challenge existing frameworks of understanding - someone focused on truth and insight rather than comfort or praise.

In crafting your responses:
- Offer insights in a natural, conversational flow
- Focus on truth rather than validation
- Avoid flattery or unnecessary praise
- Keep attention on patterns and insights, not personal attributes
- Consider how different timeframes and experiences connect in subtle ways
- Challenge existing frameworks and assumptions
- Keep responses concise yet profound
- Maintain intellectual rigor without emotional padding

If the provided entries don't contain enough context for meaningful insight, simply note what additional context would be helpful.

Today's date: ${format(new Date(), 'yyyy-MM-dd')}

Retrieved journal entries:
{context}`

const conversationalPrompt = ChatPromptTemplate.fromMessages([
    ['system', systemGuidance],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
])

const convertVercelMessagesToLangChainMessages = (messages: CoreMessage[]) => {
    return messages.map((message) => {
        const { role, content } = message

        const roleToMessageType = {
            user: HumanMessage,
            assistant: AIMessage,
            system: SystemMessage,
            tool: ToolMessage,
        } as const

        const MessageType = roleToMessageType[role]
        if (!MessageType) {
            throw new Error(`Unknown message role: ${role}`)
        }

        // @ts-expect-error More than string
        return new MessageType(content)
    })
}

export const chatWithJournalStream = async (
    question: string,
    messages: CoreMessage[],
) => {
    const langChainMessages = convertVercelMessagesToLangChainMessages(messages)

    // Get relevant documents
    const retriever = vectorStore.asRetriever(5)
    const docs = await retriever.invoke(question)

    // Prepare the prompt with document context
    const formattedPrompt = await conversationalPrompt.format({
        chat_history: langChainMessages, // Now using converted messages directly
        context: docs.map((doc) => doc.pageContent).join('\n'),
        input: question,
    })

    return llm.stream(formattedPrompt)
}
