import { Node, Edge } from 'reactflow'
import { ChatMessage, NodeData } from '@/types/chat'

/**
 * Builds the chat context for a given node.
 * @param nodes - The nodes of the flowchart.
 * @param edges - The edges of the flowchart.
 * @param currentNodeId - The ID of the current node.
 * @returns The chat context.
 */
export function buildChatContext(
  nodes: Node<NodeData>[],
  edges: Edge[],
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
    if (node && node.data.input && node.data.response) {
      // Add both the input and response as context
      context.unshift(
        { role: 'user', content: node.data.input },
        { role: 'assistant', content: node.data.response }
      )
    }
    // Move to parent node
    currentId = parentMap[currentId]
  }

  return context.filter(msg => msg.content) // Remove any empty messages
}
