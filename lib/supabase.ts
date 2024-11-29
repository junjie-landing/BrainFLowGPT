import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
})

// Create a helper to get authenticated headers
export const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  return {
    Authorization: `Bearer ${token || supabaseAnonKey}`,
    'Content-Type': 'application/json'
  }
}

// Helper for authenticated fetch requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders()

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
}
