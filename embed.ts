import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from '@langchain/core/documents'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { basename, extname } from '@std/path'
import { embeddings } from './embeddings.ts'

const createEmbeddings = async () => {
    const loader = new DirectoryLoader(
        './entries',
        {
            '.md': (path) => new TextLoader(path),
        },
    )

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

const vectorStore = await createEmbeddings()

export const findDocuments = async (text: string, numOfDocuments: number) => {
    const results: Document[] = await vectorStore.similaritySearch(
        text,
        numOfDocuments,
    )
    return results
}
