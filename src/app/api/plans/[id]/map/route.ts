import { getPlan } from '@/lib/plans-db'

export const runtime = 'nodejs'

const ROSE = '0xA23B4C'

/** Proxies a Google Static Map for a saved plan so the API key never reaches the browser. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  const { id } = await params
  const saved = key ? await getPlan(id) : null
  const stops = saved?.plan.stops
    .filter((stop) => stop.lat != null && stop.lng != null)
    .sort((a, b) => a.order - b.order)

  if (!key || !stops?.length) {
    return new Response(null, { status: 404 })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/staticmap')
  url.searchParams.set('size', '640x400')
  url.searchParams.set('scale', '2')
  for (const stop of stops) {
    url.searchParams.append('markers', `color:${ROSE}|label:${stop.order}|${stop.lat},${stop.lng}`)
  }
  if (stops.length > 1) {
    url.searchParams.set('path', `color:${ROSE}CC|weight:4|${stops.map((s) => `${s.lat},${s.lng}`).join('|')}`)
  }
  url.searchParams.set('key', key)

  const response = await fetch(url)
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok || !contentType.startsWith('image/')) {
    console.error('Static map failed', response.status, await response.text().catch(() => ''))
    return new Response(null, { status: 502 })
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  })
}
