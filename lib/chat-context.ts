import { ChatMessage } from '@/types/chat'

export function buildChatContext(
  nodes: any[],
  edges: any[],
  currentNodeId: string
): ChatMessage[] {
  const context: ChatMessage[] = []
  let currentId = currentNodeId

  // Build a map of parent relationships
  const parentMap = edges.reduce((acc: Record<string, string>, edge) => {
    acc[edge.target] = edge.source
    return acc
  }, {})

  // Traverse up the tree to collect context
  while (currentId) {
    const node = nodes.find(n => n.id === currentId)
    if (node && node.data.input) {
      context.unshift(
        { role: 'user', content: node.data.input },
        { role: 'assistant', content: node.data.response }
      )
    }
    currentId = parentMap[currentId]
  }

  return context.filter(msg => msg.content) // Remove empty messages
}
