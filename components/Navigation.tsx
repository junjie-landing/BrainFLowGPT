'use client'

import { AuthButton } from './AuthButton'

export function Navigation() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      {/* Your existing navigation items */}
      <div className="flex items-center space-x-4">
        <AuthButton />
      </div>
    </nav>
  )
}
