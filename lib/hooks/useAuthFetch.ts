import { useAuth } from '@/components/AuthContext'
import { useCallback } from 'react'

export function useAuthFetch() {
  const { session } = useAuth()

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Handle unauthorized access
      // You might want to redirect to login or refresh the token
      throw new Error('Unauthorized')
    }

    return response
  }, [session])

  return authFetch
}
