// Helper function to create a new chat message
export function createMessage(role: 'user' | 'assistant' | 'system', content: string) {
  return { role, content }
}

// Type for chat messages
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}
