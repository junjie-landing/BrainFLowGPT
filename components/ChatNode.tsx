'use client'

import { Handle, Position } from 'reactflow'
import { ChatComponent } from './ChatComponent'

interface ChatNodeProps {
  data: {
    label: string
  }
}

export function ChatNode({ data }: ChatNodeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-[600px]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data.label}
        </h3>
      </div>

      <div className="p-4">
        <ChatComponent />
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-500 dark:!bg-gray-400"
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-500 dark:!bg-gray-400"
      />
    </div>
  )
}
