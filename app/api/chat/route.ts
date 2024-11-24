import { chat } from '@/lib/openai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    return await chat(messages)
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({ error: 'Error processing chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
