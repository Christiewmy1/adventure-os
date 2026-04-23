import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adventure OS',
    short_name: 'AdventureOS',
    description: 'Your Real-Life RPG. Turn any city into a quest.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    orientation: 'portrait',
  }
}
