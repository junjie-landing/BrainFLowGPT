import axios from 'axios'
import { supabase } from './supabase'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Add auth interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Handle 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // You might want to redirect to login or refresh the token
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
