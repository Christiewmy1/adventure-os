export type Coords = { lat: number; lng: number }

export function getBrowserCoords(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 8000, maximumAge: 300_000 },
    )
  })
}

export function googleMapsUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
}
