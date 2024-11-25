import {
    RunnablePassthrough,
    RunnableSequence,
} from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { llm } from './models.ts'
import { vectorStore } from './embed.ts'
import type { Document } from '@langchain/core/documents'
import { format } from '@std/datetime/format'

const prompt = PromptTemplate.fromTemplate(
    `You are a helpful AI assistant that helps analyze personal journal entries.
Use the following journal entries to answer the question. If you cannot answer the question with
the provided entries, say so. Keep your responses concise and focused.

Context from journal entries:
{context}

Question: {question}

Answer: `,
)

const formatEntriesAsString = (docs: Document[]) => {
    return docs.map((doc) =>
        `${format(doc.metadata.timestamp, 'yyyy-MM-dd')}: ${doc.pageContent}`
    )
}

const createChain = () => {
    return RunnableSequence.from([
        {
            context: vectorStore.asRetriever().pipe(formatEntriesAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
        llm,
        new StringOutputParser(),
    ])
}

export const askJournal = async (question: string) => {
    const chain = createChain()
    const response = await chain.invoke(question)
    return response
}

// Example usage:
// await askJournal("What have I been learning recently?")
// await askJournal("How have I been feeling about myself?")
// await askJournal("What are some challenges I've faced?")
