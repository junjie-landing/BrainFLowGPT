'use client'

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  Panel,
  getRectOfNodes,
  getTransformForBounds,
  PanOnScrollMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PlusCircle, Trash2, Copy, Send, Download } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { getAIResponse } from '@/app/actions/chat'
import { toPng } from 'html-to-image'
import ReactMarkdown from 'react-markdown'
import { NodeData, ChatMessage, TreeNode } from '@/types/chat'
import { buildChatContext } from '@/lib/chat-context'
const NODE_WIDTH = 500
const GRID_SPACING_X = 512
const VERTICAL_SPACING = 50

const buildTree = (nodes: Node[], edges: Edge[]): TreeNode => {
  const nodeMap: { [key: string]: TreeNode } = {}
  nodes.forEach(node => {
    nodeMap[node.id] = { id: node.id, children: [], width: 1 }
  })

  edges.forEach(edge => {
    const parent = nodeMap[edge.source]
    const child = nodeMap[edge.target]
    if (parent && child) {
      parent.children.push(child)
    }
  })

  const calculateWidths = (node: TreeNode): number => {
    if (node.children.length === 0) return 1
    node.width = node.children.reduce((sum, child) => sum + calculateWidths(child), 0)
    return node.width
  }

  const root = nodeMap['0']
  calculateWidths(root)
  return root
}

const positionNodes = (tree: TreeNode, x: number, y: number, nodes: Node[], edges: Edge[]): Node[] => {
  const node = nodes.find(n => n.id === tree.id)
  if (node) {
    node.position = { x, y }
  }

  let currentX = x - (tree.width - 1) * GRID_SPACING_X / 2
  tree.children.forEach(child => {
    const childWidth = child.width
    const childX = currentX + (childWidth - 1) * GRID_SPACING_X / 2
    const parentNode = nodes.find(n => n.id === tree.id)
    const childNode = nodes.find(n => n.id === child.id)
    if (parentNode && childNode) {
      const parentHeight = parentNode.data.height || 0
      positionNodes(child, childX, y + parentHeight + VERTICAL_SPACING, nodes, edges)
    }
    currentX += childWidth * GRID_SPACING_X
  })

  return nodes
}

const initialNodes: Node[] = [
  { id: '0', data: { input: 'Welcome to WanderChat!', response: 'You can chat and branch out your conversation whenever you like!', height: 0 }, position: { x: 0, y: 0 }, type: 'chatNode' },
]

const initialEdges: Edge[] = []

let nodeId = 4

function ChatNode({ data, id }: NodeProps) {
  const [showAddButton, setShowAddButton] = useState(false)
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const [showCopyButton, setShowCopyButton] = useState(false)
  const [input, setInput] = useState(data.input)
  const [response, setResponse] = useState(data.response)
  const [isSubmitted, setIsSubmitted] = useState(false) // Added new state variable
  const [isLoading, setIsLoading] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const prevHeightRef = useRef<number>(data.height)

  const handleAdd = () => {
    data.onAdd(id)
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const aiResponse = await getAIResponse(input, data.context)
      setResponse(aiResponse)
      data.updateNodeData(id, { input, response: aiResponse })
      setIsSubmitted(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDelete = () => {
    data.onDelete(id)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Input: ${input}\nResponse: ${response}`)
    toast({
      title: "Copied to clipboard",
      description: "Node content has been copied to your clipboard.",
    })
  }

  useEffect(() => {
    if (nodeRef.current) {
      const height = nodeRef.current.offsetHeight
      if (height !== prevHeightRef.current) {
        data.updateNodeData(id, { height })
        prevHeightRef.current = height
      }
    }
  }, [id, data, input, response])

  useEffect(() => {
    if (input === '') {
      const textarea = nodeRef.current?.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  }, [input]);

  return (
    <Card
      ref={nodeRef}
      className="relative p-4 pt-8 shadow-md"
      style={{ width: NODE_WIDTH }}
      onMouseEnter={() => {
        setShowAddButton(true)
        setShowDeleteButton(true)
      }}
      onMouseLeave={() => {
        setShowAddButton(false)
        setShowDeleteButton(false)
      }}
    >
      {(isSubmitted || id == '0') && (
        <div className="mb-2" onMouseDown={(e) => e.stopPropagation()}>
          <p className="font-bold text-lg">{input}</p>
        </div>
      )}
      <div className="space-y-2 mb-2" onMouseDown={(e) => e.stopPropagation()}>
        {response && (
          <div
            className="p-2 bg-gray-100 rounded relative"
            onMouseEnter={() => setShowCopyButton(true)}
            onMouseLeave={() => setShowCopyButton(false)}
          >
            <div className="prose prose-sm max-w-none [&_p]:mb-4 [&_ul]:mb-4 [&_ol]:mb-4 [&_blockquote]:mb-4 [&_pre]:mb-4">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
            {showCopyButton && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      {id !== '0' && !isSubmitted && ( // Updated to conditionally render input box
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="pr-10 resize-none text-sm min-h-[2.5rem] overflow-hidden"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <Button
            size="sm" // Updated size
            className="absolute right-2 bottom-2 p-1" // Updated styling
            onClick={handleSubmit}
            disabled={!input.trim()}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      )}
      {id !== '0' && showDeleteButton && (
        <Button
          variant="ghost"
          size="sm" // Updated size
          className="absolute top-2 right-2 p-1 z-10" // Updated styling
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
      {showAddButton && ( // Updated line to show add button for all nodes
        <Button
          variant="outline"
          size="icon"
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          onClick={handleAdd}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      )}
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </Card>
  )
}

const nodeTypes = {
  chatNode: ChatNode,
}

export function EnhancedFlexibleChatFlowchartComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const updateRequiredRef = useRef(false)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  const onAdd = useCallback((parentId: string) => {
    const newNodeId = nodeId.toString()
    nodeId++

    setNodes((nds) => {
      const parentNode = nds.find(n => n.id === parentId)
      let initialX = 0
      let initialY = 0
      if (parentNode) {
        const parentChildren = edges.filter(e => e.source === parentId).length
        initialX = parentNode.position.x + (parentChildren * 100)
        initialY = parentNode.position.y + 100
      }

      const context = buildChatContext(nds, edges, parentId)

      const newNode = {
        id: newNodeId,
        data: {
          input: '',
          response: '',
          height: 0,
          context
        },
        position: { x: initialX, y: initialY },
        type: 'chatNode',
      }
      return [...nds, newNode]
    })

    setEdges((eds) => [
      ...eds,
      {
        id: `e${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
      },
    ])

    updateRequiredRef.current = true
  }, [setNodes, setEdges, edges])

  const onDelete = useCallback((id: string) => {
    const deleteNodeAndChildren = (nodeId: string, currentNodes: Node[], currentEdges: Edge[]): { nodes: Node[], edges: Edge[] } => {
      const childEdges = currentEdges.filter(edge => edge.source === nodeId)
      const childNodes = childEdges.map(edge => currentNodes.find(node => node.id === edge.target)!).filter(Boolean)

      let updatedNodes = currentNodes.filter(node => node.id !== nodeId)
      let updatedEdges = currentEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)

      childNodes.forEach(childNode => {
        const result = deleteNodeAndChildren(childNode.id, updatedNodes, updatedEdges)
        updatedNodes = result.nodes
        updatedEdges = result.edges
      })

      return { nodes: updatedNodes, edges: updatedEdges }
    }

    const { nodes: updatedNodes, edges: updatedEdges } = deleteNodeAndChildren(id, nodes, edges)
    setNodes(updatedNodes)
    setEdges(updatedEdges)
    updateRequiredRef.current = true
  }, [nodes, edges, setNodes, setEdges])

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node))
    )
    updateRequiredRef.current = true
  }, [setNodes])

  const updateNodePositions = useCallback(() => {
    const tree = buildTree(nodes, edges)
    const updatedNodes = positionNodes(tree, 0, 0, nodes, edges)
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const updatedNode = updatedNodes.find((n) => n.id === node.id)
        return updatedNode ? { ...node, position: updatedNode.position } : node
      })
    )
    updateRequiredRef.current = false
  }, [nodes, edges, setNodes])

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node, nodes: Node[]) => {
    updateRequiredRef.current = true;
  }, []);

  useEffect(() => {
    if (updateRequiredRef.current) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      updateTimeoutRef.current = setTimeout(() => {
        updateNodePositions()
        updateTimeoutRef.current = null
      }, 50) // Reduced from 100ms to 50ms
    }
  }, [nodes, edges, updateNodePositions])

  const onDownloadImage = useCallback(() => {
    const nodesBounds = getRectOfNodes(nodes)
    const transform = getTransformForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      0.5
    )

    // Find the viewport element (contains only nodes and edges)
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) return

    // Temporarily hide background and controls
    const background = document.querySelector('.react-flow__background') as HTMLElement
    const controls = document.querySelector('.react-flow__controls') as HTMLElement
    const panel = document.querySelector('.react-flow__panel') as HTMLElement

    if (background) background.style.display = 'none'
    if (controls) controls.style.display = 'none'
    if (panel) panel.style.display = 'none'

    toPng(viewport, {
      backgroundColor: '#ffffff',
      width: nodesBounds.width ,
      height: nodesBounds.height ,
      style: {
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    })
      .then((dataUrl) => {
        const a = document.createElement('a')
        a.setAttribute('download', 'flowchart.png')
        a.setAttribute('href', dataUrl)
        a.click()
      })
      .catch((error) => {
        console.error('Error downloading image:', error)
        toast({
          title: "Error",
          description: "Failed to download image",
        })
      })
      .finally(() => {
        // Restore visibility of hidden elements
        if (background) background.style.display = 'block'
        if (controls) controls.style.display = 'block'
        if (panel) panel.style.display = 'block'
      })
  }, [nodes])

  return (
    <div className="w-full h-[66vh] rounded-lg my-10 shadow-lg">
      <ReactFlow
        nodes={nodes.map((node) => ({ ...node, data: { ...node.data, onAdd, onDelete, updateNodeData } }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={
          {maxZoom: 1,}
        }
        minZoom={0.1}
        maxZoom={4}
        zoomOnScroll={false}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Vertical}
        // nodesDraggable={true}
        onNodeDragStop={onNodeDragStop}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadImage}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export as PNG
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}
