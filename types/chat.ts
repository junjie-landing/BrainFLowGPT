export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface NodeData {
  input: string;
  response: string;
  height: number;
  context?: ChatMessage[];
  onAdd?: (id: string) => void;
  onDelete?: (id: string) => void;
  updateNodeData?: (id: string, data: Partial<NodeData>) => void;
}

export interface TreeNode {
  id: string;
  children: TreeNode[];
  width: number;
}

export interface ChatNodeProps {
  id: string;
  data: NodeData;
}
