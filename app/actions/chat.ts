'use server'

import OpenAI from 'openai'

export async function getAIResponse(message: string) {
  try {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      })

    console.log('Environment check:', {
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length,
      nodeEnv: process.env.NODE_ENV
    })

    // check all process.env variables
    console.log("all process.env variables: ", process.env)

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured in environment variables')
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Always format your responses in markdown."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "gpt-4o-mini",
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to get AI response')
  }
}
