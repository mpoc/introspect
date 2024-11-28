import { ChatSection } from '@llamaindex/chat-ui'
import { useChat } from 'ai/react'

export const Chat = () => {
    const handler = useChat()
    return <ChatSection handler={handler} />
}
