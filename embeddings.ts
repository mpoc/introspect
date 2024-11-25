import { OllamaEmbeddings } from '@langchain/ollama'

export const embeddings = new OllamaEmbeddings({
    model: 'nomic-embed-text:v1.5',
    baseUrl: 'http://localhost:11434',
})
