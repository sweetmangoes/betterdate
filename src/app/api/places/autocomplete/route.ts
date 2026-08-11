import { NextResponse } from 'next/server'

import { autocompletePlaces } from '@/lib/places'

export const runtime = 'nodejs'

function parseCoord(value: string | null): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function GET(request: Request) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ suggestions: [] })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const lat = parseCoord(searchParams.get('lat'))
  const lng = parseCoord(searchParams.get('lng'))

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const bias =
    lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      ? { lat, lng }
      : null

  try {
    const suggestions = await autocompletePlaces(q, bias)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Autocomplete route failed', error)
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
