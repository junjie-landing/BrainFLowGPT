'use client'

import { useState } from 'react'
import { useAuth } from './AuthContext'

interface AuthButtonProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthButton({ mode }: AuthButtonProps) {
  const { user, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'sign-up') {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      setShowModal(false)
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  if (user) {
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Sign Out
      </button>
    )
  }

  const buttonStyles = mode === 'sign-up'
    ? "px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/80 transition-colors"
    : "px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors";

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={buttonStyles}
      >
        {mode === 'sign-up' ? 'Sign Up' : 'Sign In'}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg w-full max-w-md">
            <h2 className="mb-4 text-xl font-bold">
              {mode === 'sign-up' ? 'Create an account' : 'Welcome back'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-black rounded-md hover:bg-black/80 transition-colors"
                >
                  {mode === 'sign-up' ? 'Sign Up' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
