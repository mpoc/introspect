import { askJournal } from './generate.ts'

if (import.meta.main) {
    const question = Deno.args[0]
    if (!question) {
        console.log('No question provided')
        Deno.exit(0)
    }
    console.log(await askJournal(question))
}
