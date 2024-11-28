import { ChatSection } from '@llamaindex/chat-ui'
import { useChat } from 'ai/react'

export const Chat = () => {
    const handler = useChat({ api: 'http://localhost:8000/api/chat' })
    return <ChatSection handler={handler} />
}
