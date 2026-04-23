export type Place = {
  id: string
  name: string
  address: string
  types: string[]
  rating?: number
  location: { lat: number; lng: number }
}

// Maps each archetype to Google Places API (v1) includedTypes
const ARCHETYPE_TYPES: Record<string, string[]> = {
  ranger:      ['park'],
  streetrat:   ['bar', 'night_club'],
  sailor:      ['tourist_attraction'],
  architect:   ['tourist_attraction'],
  ghost:       ['library', 'book_store'],
  socialite:   ['restaurant', 'bar'],
  partner:     ['cafe', 'restaurant'],
  leader:      ['restaurant', 'bar'],
  scholar:     ['museum', 'library'],
  futurist:    ['art_gallery', 'tourist_attraction'],
  artist:      ['art_gallery'],
  occultist:   ['museum'],
  savory:      ['restaurant'],
  sweet:       ['bakery', 'cafe'],
  caffeine:    ['cafe'],
  mixologist:  ['bar'],
  drifter:     ['park'],
  nomad:       ['tourist_attraction'],
  flaneur:     ['park', 'shopping_mall'],
  specialist:  ['tourist_attraction'],
}

const MOCK_PLACES: Place[] = [
  { id: 'p1', name: 'City Botanical Garden', address: '1 Garden Way, City, ST 00001', types: ['park'], location: { lat: 0, lng: 0 } },
  { id: 'p2', name: 'The Old History Museum', address: '10 Museum Row, City, ST 00001', types: ['museum'], location: { lat: 0, lng: 0 } },
  { id: 'p3', name: 'Corner Espresso Bar', address: '22 Main St, City, ST 00001', types: ['cafe'], location: { lat: 0, lng: 0 } },
  { id: 'p4', name: 'The Hidden Cellar', address: '7 Back Alley, City, ST 00001', types: ['bar'], location: { lat: 0, lng: 0 } },
  { id: 'p5', name: 'Harbour Promenade', address: 'Waterfront Walk, City, ST 00001', types: ['tourist_attraction'], location: { lat: 0, lng: 0 } },
]

export async function POST(request: Request) {
  const { lat, lng, tags } = await request.json() as {
    lat: number
    lng: number
    tags: Record<string, string>
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey || apiKey === 'your_google_places_api_key') {
    return Response.json(MOCK_PLACES)
  }

  // Collect unique place types from all 5 persona tags, max 5
  const types = [...new Set(
    Object.values(tags).flatMap(tag => ARCHETYPE_TYPES[tag] ?? [])
  )].slice(0, 5)

  if (types.length === 0) types.push('tourist_attraction')

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.location',
      },
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 1500,
          },
        },
      }),
    })

    const data = await res.json()

    if (!data.places?.length) return Response.json(MOCK_PLACES)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const places: Place[] = (data.places as any[]).map(p => ({
      id: p.id ?? crypto.randomUUID(),
      name: p.displayName?.text ?? 'Unknown Place',
      address: p.formattedAddress ?? '',
      types: p.types ?? [],
      rating: p.rating,
      location: { lat: p.location?.latitude ?? lat, lng: p.location?.longitude ?? lng },
    }))

    return Response.json(places.slice(0, 5))
  } catch (err) {
    console.error('[places] Error:', err)
    return Response.json(MOCK_PLACES)
  }
}
