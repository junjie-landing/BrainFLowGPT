'use client'

import { useChat } from '@/lib/hooks/useChat'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export function ChatComponent() {
  const { messages, isLoading, error, sendMessage } = useChat()
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const tobesubmitted = input
    setInput('')
    await sendMessage(tobesubmitted)
  }

  console.log(`the message.content is ${JSON.stringify(messages)}`)

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center">Loading...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
