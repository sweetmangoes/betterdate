import { getMeetingAreaLabel, type QuizAnswers } from '@betterdate/shared'

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

type SearchCenter = {
  lat: number
  lng: number
  radiusMeters: number
  label: string
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

/** Approximate distance in meters between two lat/lng points. */
function haversineMeters(a: GeocodeResult, b: GeocodeResult): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function buildSearchQueries(answers: QuizAnswers, areaLabel: string): string[] {
  const queries: string[] = []
  const inArea = areaLabel

  for (const vibe of answers.vibes) {
    switch (vibe) {
      case 'foodie':
        queries.push(`best restaurants ${inArea}`)
        break
      case 'cozy':
        queries.push(`cozy cafe or wine bar ${inArea}`)
        break
      case 'outdoorsy':
        queries.push(`parks or scenic walking spots ${inArea}`)
        break
      case 'culture':
        queries.push(`museums galleries or cultural attractions ${inArea}`)
        break
      case 'playful':
        queries.push(`fun date activities or entertainment ${inArea}`)
        break
    }
  }

  if (answers.time === 'evening' || answers.time === 'flexible') {
    queries.push(`cocktail bars or dessert spots ${inArea}`)
  }
  if (answers.time === 'morning' || answers.time === 'afternoon') {
    queries.push(`brunch cafes or daytime date spots ${inArea}`)
  }
  if (answers.energy === 'adventurous') {
    queries.push(`unique experiences or activities ${inArea}`)
  }
  if (answers.energy === 'low_key') {
    queries.push(`quiet intimate restaurants ${inArea}`)
  }

  if (!queries.some((q) => q.includes('restaurant') || q.includes('cafe'))) {
    queries.push(`restaurants ${inArea}`)
  }

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

async function resolveSearchCenter(answers: QuizAnswers): Promise<SearchCenter | null> {
  const label = getMeetingAreaLabel(answers)

  switch (answers.meetingPreference) {
    case 'neighborhood': {
      const geo = await geocodeLocation(answers.location.trim())
      if (!geo) return null
      return { lat: geo.lat, lng: geo.lng, radiusMeters: 5500, label }
    }
    case 'near_me': {
      const geo = await geocodeLocation(answers.myLocation.trim())
      if (!geo) return null
      return { lat: geo.lat, lng: geo.lng, radiusMeters: 6500, label }
    }
    case 'near_them': {
      const geo = await geocodeLocation(answers.theirLocation.trim())
      if (!geo) return null
      return { lat: geo.lat, lng: geo.lng, radiusMeters: 6500, label }
    }
    case 'midpoint': {
      const [mine, theirs] = await Promise.all([
        geocodeLocation(answers.myLocation.trim()),
        geocodeLocation(answers.theirLocation.trim()),
      ])
      if (!mine || !theirs) return null

      const distance = haversineMeters(mine, theirs)
      // Search around the midpoint with a radius that scales with how far apart you are
      const radiusMeters = clamp(distance * 0.35, 3500, 14000)

      return {
        lat: (mine.lat + theirs.lat) / 2,
        lng: (mine.lng + theirs.lng) / 2,
        radiusMeters,
        label,
      }
    }
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
  radiusMeters?: number
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
        // Places Text Search (New) caps circle radius at 50km
        radius: Math.min(params.radiusMeters ?? 8000, 50_000),
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
    console.error('Places text search failed', response.status, text, params.textQuery)

    // Retry once without price filter — invalid priceLevels can 400 the whole request
    if (params.priceLevels?.length) {
      return textSearch({ ...params, priceLevels: undefined })
    }

    throw new Error(`Google Places search failed (${response.status}).`)
  }

  const data = (await response.json()) as PlacesSearchResponse

  return (data.places ?? [])
    .filter((place) => place.id && place.displayName?.text)
    .map((place) => {
      const id = normalizePlaceId(place.id!)
      const address = place.formattedAddress ?? place.shortFormattedAddress ?? ''
      const neighborhood =
        place.shortFormattedAddress?.split(',')[0]?.trim() ||
        address.split(',')[1]?.trim() ||
        address.split(',')[0]?.trim() ||
        'Nearby'

      return {
        id,
        name: place.displayName!.text!,
        address,
        neighborhood,
        lat: place.location?.latitude ?? 0,
        lng: place.location?.longitude ?? 0,
        rating: place.rating,
        priceLevel: place.priceLevel,
        mapsUrl:
          place.googleMapsUri ??
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName!.text!)}&query_place_id=${id}`,
        primaryType: place.primaryType,
        types: place.types ?? [],
      } satisfies PlaceCandidate
    })
}

/** Strip `places/` prefix the model (or API resource names) sometimes include. */
export function normalizePlaceId(placeId: string): string {
  return placeId.trim().replace(/^places\//, '')
}

export async function findPlaceCandidates(answers: QuizAnswers): Promise<PlaceCandidate[]> {
  const center = await resolveSearchCenter(answers)
  if (!center) {
    throw new Error(
      'Could not find those locations on the map. Try a clearer city, neighborhood, or landmark.',
    )
  }

  const queries = buildSearchQueries(answers, center.label)
  const priceLevels = budgetToPriceLevels(answers.budget)

  const settled = await Promise.allSettled(
    queries.map((textQuery) =>
      textSearch({
        textQuery,
        lat: center.lat,
        lng: center.lng,
        radiusMeters: center.radiusMeters,
        priceLevels:
          /restaurant|cafe|bar|brunch|dessert|cocktail|wine/i.test(textQuery) ? priceLevels : undefined,
      }),
    ),
  )

  const byId = new Map<string, PlaceCandidate>()
  let failures = 0
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      for (const place of result.value) {
        if (!byId.has(place.id)) byId.set(place.id, place)
      }
    } else {
      failures += 1
      console.error('Places query failed', result.reason)
    }
  }

  if (byId.size === 0) {
    throw new Error(
      failures > 0
        ? 'We could not look up places nearby right now. Please try generating again.'
        : 'Could not find enough local places for that area. Try a more specific city or neighborhood.',
    )
  }

  return [...byId.values()].slice(0, 18)
}

export type LocationSuggestion = {
  placeId: string
  text: string
  mainText: string
  secondaryText: string
}

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string
      text?: { text?: string }
      types?: string[]
      structuredFormat?: {
        mainText?: { text?: string }
        secondaryText?: { text?: string }
      }
    }
  }>
}

/** Geographic / address types — keep streets & neighborhoods, drop restaurants etc. */
const GEOGRAPHIC_TYPES = new Set([
  'geocode',
  'political',
  'locality',
  'sublocality',
  'sublocality_level_1',
  'sublocality_level_2',
  'sublocality_level_3',
  'neighborhood',
  'colloquial_area',
  'administrative_area_level_1',
  'administrative_area_level_2',
  'administrative_area_level_3',
  'administrative_area_level_4',
  'postal_code',
  'postal_code_prefix',
  'route',
  'street_address',
  'premise',
  'subpremise',
  'intersection',
])

function isGeographicPrediction(types: string[] | undefined): boolean {
  if (!types?.length) return true
  return types.some((type) => GEOGRAPHIC_TYPES.has(type))
}

export type AutocompleteBias = {
  lat: number
  lng: number
  /** Search bias radius in meters. Default covers a metro area (~50km). */
  radiusMeters?: number
}

/** Autocomplete neighborhoods, towns, and streets, biased to the user's location. */
export async function autocompletePlaces(
  input: string,
  bias?: AutocompleteBias | null,
): Promise<LocationSuggestion[]> {
  const trimmed = input.trim()
  if (trimmed.length < 2) return []

  const body: Record<string, unknown> = {
    input: trimmed,
    languageCode: 'en',
  }

  if (bias) {
    body.locationBias = {
      circle: {
        center: { latitude: bias.lat, longitude: bias.lng },
        // Wide enough for suburbs like Orleans relative to downtown Ottawa
        radius: bias.radiusMeters ?? 50_000,
      },
    }
    body.origin = { latitude: bias.lat, longitude: bias.lng }
  }

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': getApiKey(),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Places autocomplete failed', response.status, text)
    throw new Error('Location suggestions failed. Check GOOGLE_MAPS_API_KEY and Places API (New).')
  }

  const data = (await response.json()) as AutocompleteResponse

  const mapped = (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> =>
      Boolean(prediction?.placeId && prediction.text?.text),
    )
    .map((prediction) => {
      const text = prediction.text!.text!
      const mainText = prediction.structuredFormat?.mainText?.text ?? text.split(',')[0] ?? text
      const secondaryText = prediction.structuredFormat?.secondaryText?.text ?? ''
      return {
        placeId: prediction.placeId!,
        text,
        mainText,
        secondaryText,
        types: prediction.types ?? [],
      }
    })

  const geographic = mapped.filter((item) => isGeographicPrediction(item.types))
  const preferred = geographic.length > 0 ? geographic : mapped

  return preferred.slice(0, 6).map(({ placeId, text, mainText, secondaryText }) => ({
    placeId,
    text,
    mainText,
    secondaryText,
  }))
}
