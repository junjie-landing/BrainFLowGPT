import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const headersList = headers()
  const token = headersList.get('authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Your protected route logic here
    return NextResponse.json({ message: 'Protected data' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
