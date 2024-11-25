import { Document } from '@langchain/core/documents'
import { vectorStore } from './embed.ts'

export const findDocuments = async (text: string, numOfDocuments: number) => {
    const results: Document[] = await vectorStore.similaritySearch(
        text,
        numOfDocuments,
    )
    return results
}
