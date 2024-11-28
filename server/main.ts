import { Application } from 'jsr:@oak/oak/application'
import { Router } from 'jsr:@oak/oak/router'
import { LangChainAdapter } from 'ai'
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts'
import { CoreMessage } from 'ai'
import routeStaticFilesFrom from './util/routeStaticFilesFrom.ts'
import { chatWithJournalStream } from './chat.ts'
import type { IterableReadableStream } from '@langchain/core'

const createResponseFromLangchainStream = (
    stream: IterableReadableStream<string>,
) => LangChainAdapter.toDataStreamResponse(stream, {
    init: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
        },
    },
})

export const app = new Application()
const router = new Router()
    .post('/api/chat', async (ctx) => {
        console.log({ body: await ctx.request.body.json() })

        const body: { messages: CoreMessage[] } = await ctx.request.body.json()
        const stream = await chatWithJournalStream(
            // @ts-expect-error More than string
            body.messages.filter(msg => msg.role === 'user').at(-1).content,
            body.messages,
        )
        const dataStream = createResponseFromLangchainStream(stream)
        ctx.response.with(dataStream)
    })

app.use(oakCors())
app.use(router.routes())
app.use(routeStaticFilesFrom([
    `${Deno.cwd()}/client/dist`,
    `${Deno.cwd()}/client/public`,
]))

if (import.meta.main) {
    console.log('Server listening on port http://localhost:8000')
    await app.listen({ port: 8000 })
}
