import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts'
import { llm } from './models.ts'
import { vectorStore } from './embed.ts'
import { format } from '@std/datetime/format'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'

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

const contextualizeQSystemPrompt =
    `You are helping analyze personal journal entries over time with deep insight and sophistication. Given the chat history and the latest question, reformulate the question to capture its full context and intent, especially if it references previous insights or patterns discussed. Focus on maintaining the depth and analytical rigor of the original question while making it standalone. Do NOT answer the question - only reformulate it if needed or return it as is. Ensure the reformulated question maintains the spirit of looking for subtle patterns and profound connections rather than surface-level observations.`

const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ['system', contextualizeQSystemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
])

const conversationalPrompt = ChatPromptTemplate.fromMessages([
    ['system', systemGuidance],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
])

const createHistoryAwareJournalRetriever = () => {
    const retriever = vectorStore.asRetriever(5)
    return createHistoryAwareRetriever({
        llm,
        retriever,
        rephrasePrompt: contextualizeQPrompt,
    })
}

const messageHistoryStore: Record<string, ChatMessageHistory> = {}
const getMessageHistory = (sessionId: string): ChatMessageHistory => {
    if (!(sessionId in messageHistoryStore)) {
        messageHistoryStore[sessionId] = new ChatMessageHistory()
    }
    return messageHistoryStore[sessionId]
}

const createConversationalChain = async () => {
    const historyAwareRetriever = await createHistoryAwareJournalRetriever()

    const questionAnswerChain = await createStuffDocumentsChain({
        llm,
        prompt: conversationalPrompt,
    })

    const chain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain: questionAnswerChain,
    })

    return new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory,
        inputMessagesKey: 'input',
        historyMessagesKey: 'chat_history',
        outputMessagesKey: 'answer',
    })
}

export const chatWithJournal = async (
    question: string,
    sessionId: string = 'default',
) => {
    const chain = await createConversationalChain()

    const response = await chain.invoke(
        { input: question },
        { configurable: { sessionId } },
    )

    return response.answer
}

export const chatWithJournalStream = async (
    question: string,
    sessionId: string = 'default',
) => {
    const chain = await createConversationalChain()

    return chain.stream(
        { input: question },
        { configurable: { sessionId } },
    )
}
