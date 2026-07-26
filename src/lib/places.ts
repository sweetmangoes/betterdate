import type { QuizAnswers } from '@betterdate/shared'

export type PlaceCandidate = {
  id: string
  name: string
  address: string
  neighborhood: string
  lat: number
  lng: number
  rating?: number
  priceLevel?: string
  mapsUrl: string
  primaryType?: string
  types: string[]
}

type GeocodeResult = {
  lat: number
  lng: number
  formattedAddress: string
}

const PLACES_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.location',
  'places.rating',
  'places.priceLevel',
  'places.googleMapsUri',
  'places.primaryType',
  'places.types',
].join(',')

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY')
  }
  return key
}

function budgetToPriceLevels(budget: QuizAnswers['budget']): string[] | undefined {
  switch (budget) {
    case '$':
      return ['PRICE_LEVEL_FREE', 'PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE']
    case '$$':
      return ['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE', 'PRICE_LEVEL_EXPENSIVE']
    case '$$$':
      return ['PRICE_LEVEL_MODERATE', 'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE']
  }
}

function buildSearchQueries(answers: QuizAnswers): string[] {
  const loc = answers.location.trim()
  const queries: string[] = []

  for (const vibe of answers.vibes) {
    switch (vibe) {
      case 'foodie':
        queries.push(`best restaurants in ${loc}`)
        break
      case 'cozy':
        queries.push(`cozy cafe or wine bar in ${loc}`)
        break
      case 'outdoorsy':
        queries.push(`parks or scenic walking spots in ${loc}`)
        break
      case 'culture':
        queries.push(`museums galleries or cultural attractions in ${loc}`)
        break
      case 'playful':
        queries.push(`fun date activities or entertainment in ${loc}`)
        break
    }
  }

  if (answers.time === 'evening' || answers.time === 'flexible') {
    queries.push(`cocktail bars or dessert spots in ${loc}`)
  }
  if (answers.time === 'morning' || answers.time === 'afternoon') {
    queries.push(`brunch cafes or daytime date spots in ${loc}`)
  }
  if (answers.energy === 'adventurous') {
    queries.push(`unique experiences or activities in ${loc}`)
  }
  if (answers.energy === 'low_key') {
    queries.push(`quiet intimate restaurants in ${loc}`)
  }

  // Always include a walkable food anchor
  if (!queries.some((q) => q.includes('restaurant') || q.includes('cafe'))) {
    queries.push(`restaurants in ${loc}`)
  }

  // Dedupe and cap at 4 searches to control cost
  return [...new Set(queries)].slice(0, 4)
}

async function geocodeLocation(location: string): Promise<GeocodeResult | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', location)
  url.searchParams.set('key', getApiKey())

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Geocoding failed', response.status, await response.text())
    return null
  }

  const data = (await response.json()) as {
    status: string
    results?: Array<{
      formatted_address: string
      geometry: { location: { lat: number; lng: number } }
    }>
  }

  if (data.status !== 'OK' || !data.results?.[0]) {
    console.error('Geocoding status', data.status)
    return null
  }

  const result = data.results[0]
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  }
}

type PlacesSearchResponse = {
  places?: Array<{
    id?: string
    displayName?: { text?: string }
    formattedAddress?: string
    shortFormattedAddress?: string
    location?: { latitude?: number; longitude?: number }
    rating?: number
    priceLevel?: string
    googleMapsUri?: string
    primaryType?: string
    types?: string[]
  }>
}

async function textSearch(params: {
  textQuery: string
  lat?: number
  lng?: number
  priceLevels?: string[]
}): Promise<PlaceCandidate[]> {
  const body: Record<string, unknown> = {
    textQuery: params.textQuery,
    pageSize: 5,
    languageCode: 'en',
  }

  if (params.lat != null && params.lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: 8000,
      },
    }
  }

  if (params.priceLevels?.length) {
    body.priceLevels = params.priceLevels
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': PLACES_FIELD_MASK,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Places text search failed', response.status, text)
    throw new Error('Google Places search failed. Check GOOGLE_MAPS_API_KEY and that Places API (New) is enabled.')
  }

  const data = (await response.json()) as PlacesSearchResponse

  return (data.places ?? [])
    .filter((place) => place.id && place.displayName?.text)
    .map((place) => {
      const address = place.formattedAddress ?? place.shortFormattedAddress ?? ''
      const neighborhood =
        place.shortFormattedAddress?.split(',')[0]?.trim() ||
        address.split(',')[1]?.trim() ||
        address.split(',')[0]?.trim() ||
        'Nearby'

      return {
        id: place.id!,
        name: place.displayName!.text!,
        address,
        neighborhood,
        lat: place.location?.latitude ?? 0,
        lng: place.location?.longitude ?? 0,
        rating: place.rating,
        priceLevel: place.priceLevel,
        mapsUrl:
          place.googleMapsUri ??
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName!.text!)}&query_place_id=${place.id}`,
        primaryType: place.primaryType,
        types: place.types ?? [],
      } satisfies PlaceCandidate
    })
}

export async function findPlaceCandidates(answers: QuizAnswers): Promise<PlaceCandidate[]> {
  const geocode = await geocodeLocation(answers.location)
  const queries = buildSearchQueries(answers)
  const priceLevels = budgetToPriceLevels(answers.budget)

  const batches = await Promise.all(
    queries.map((textQuery) =>
      textSearch({
        textQuery,
        lat: geocode?.lat,
        lng: geocode?.lng,
        // Only apply price filter to food/drink-ish queries to avoid wiping parks
        priceLevels:
          /restaurant|cafe|bar|brunch|dessert|cocktail|wine/i.test(textQuery) ? priceLevels : undefined,
      }),
    ),
  )

  const byId = new Map<string, PlaceCandidate>()
  for (const batch of batches) {
    for (const place of batch) {
      if (!byId.has(place.id)) {
        byId.set(place.id, place)
      }
    }
  }

  return [...byId.values()].slice(0, 18)
}

export function formatCandidatesForPrompt(candidates: PlaceCandidate[]): string {
  return candidates
    .map((place, index) => {
      const rating = place.rating != null ? `rating ${place.rating}` : 'no rating'
      const price = place.priceLevel ? `, ${place.priceLevel}` : ''
      const type = place.primaryType ?? place.types[0] ?? 'place'
      return `${index + 1}. id=${place.id} | ${place.name} | ${place.address} | ${type} | ${rating}${price}`
    })
    .join('\n')
}
