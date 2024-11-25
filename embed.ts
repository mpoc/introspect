import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { ObsidianLoader } from '@langchain/community/document_loaders/fs/obsidian'
import { basename, extname } from '@std/path'
import { embeddings } from './models.ts'

const createEmbeddings = async () => {
    const loader = new ObsidianLoader('./entries')

    const docs = await loader.load()

    docs.forEach(
        (doc) =>
            doc.metadata.timestamp = new Date(
                basename(doc.metadata.source, extname(doc.metadata.source)),
            ),
    )

    const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        embeddings,
    )

    return vectorStore
}

export const vectorStore = await createEmbeddings()
