import { NextResponse } from 'next/server'

import { autocompletePlaces } from '@/lib/places'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ suggestions: [] })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const suggestions = await autocompletePlaces(q)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Autocomplete route failed', error)
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
