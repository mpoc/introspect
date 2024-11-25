import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { basename, extname } from '@std/path'
import { embeddings } from './models.ts'

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

export const vectorStore = await createEmbeddings()
