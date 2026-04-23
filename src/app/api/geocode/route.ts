import type { NextRequest } from 'next/server'
import type { Coords } from '@/lib/location'

type GeocodeResponse = { coords: Coords; label: string }

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip')?.trim()
  if (!zip) return Response.json({ error: 'zip required' }, { status: 400 })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey || apiKey === 'your_google_places_api_key') {
    return Response.json({ error: 'Geocoding API not configured' }, { status: 503 })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' || !data.results?.[0]) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    const result = data.results[0]
    const { lat, lng } = result.geometry.location

    const components = result.address_components as Array<{ long_name: string; types: string[] }>
    const label =
      components.find(c => c.types.includes('locality'))?.long_name ??
      components.find(c => c.types.includes('postal_town'))?.long_name ??
      result.formatted_address.split(',')[0]

    return Response.json({ coords: { lat, lng }, label } satisfies GeocodeResponse)
  } catch (err) {
    console.error('[geocode] Error:', err)
    return Response.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
