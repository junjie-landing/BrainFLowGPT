import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { ChatMessage } from '@/lib/openai'

// Create an OpenAI API client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages,
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)

  // Return a StreamingTextResponse, which can be consumed by the client
  return new StreamingTextResponse(stream)
}

export async function GET() {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not set in environment variables' },
      { status: 500 }
    )
  }

  try {
    const response = await openai.models.list()
    return Response.json({ valid: response.data.length > 0 })
  } catch (error) {
    console.error('Error validating OpenAI API key:', error)
    return Response.json({ valid: false }, { status: 500 })
  }
}
