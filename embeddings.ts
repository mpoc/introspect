import { OllamaEmbeddings } from '@langchain/ollama'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from '@langchain/core/documents'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { basename, extname } from '@std/path'

const createEmbeddings = async () => {
    const embeddings = new OllamaEmbeddings({
        model: 'nomic-embed-text:v1.5',
        baseUrl: 'http://localhost:11434',
    })

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
    // @ts-expect-error Property 'similaritySearch' does not exist on type 'MemoryVectorStore'.
    const results: Document[] = await vectorStore.similaritySearch(
        text,
        numOfDocuments,
    )
    return results
}
