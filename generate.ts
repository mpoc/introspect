import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { formatDocumentsAsString } from 'langchain/util/document'
import { findDocuments } from './retrieve.ts'
import { llm } from './llm.ts'

const TEMPLATE =
    `You are a helpful AI assistant that helps analyze personal journal entries.
Use the following journal entries to answer the question. If you cannot answer the question with
the provided entries, say so. Keep your responses concise and focused.

Context from journal entries:
{context}

Question: {question}

Answer: ` as const

const createChain = () => {
    return RunnableSequence.from([
        {
            context: async (input: { question: string }) => {
                const docs = await findDocuments(input.question, 3)
                return formatDocumentsAsString(docs)
            },
            question: (input: { question: string }) => input.question,
        },
        (formattedInput) =>
            TEMPLATE
                .replace('{context}', formattedInput.context)
                .replace('{question}', formattedInput.question),
        llm,
        new StringOutputParser(),
    ])
}

export const askJournal = async (question: string) => {
    const chain = createChain()
    const response = await chain.invoke({
        question,
    })
    return response
}

// Example usage:
// await askJournal("What have I been learning recently?")
// await askJournal("How have I been feeling about myself?")
// await askJournal("What are some challenges I've faced?")
