'use server'

import OpenAI from 'openai'
import { ChatMessage } from '@/types/chat'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function getAIResponse(input: string, context: ChatMessage[] = []) {
  try {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...context,
      { role: 'user', content: input }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || 'No response generated'
  } catch (error) {
    console.error('Error in getAIResponse:', error)
    throw error
  }
}
