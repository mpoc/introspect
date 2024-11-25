import { OllamaEmbeddings } from '@langchain/ollama'
import { Ollama } from '@langchain/ollama'

export const embeddings = new OllamaEmbeddings({
    model: 'nomic-embed-text:v1.5',
    baseUrl: 'http://localhost:11434',
})

export const llm = new Ollama({
    model: 'llama3.1:8b',
    baseUrl: 'http://localhost:11434',
    verbose: false,
})
