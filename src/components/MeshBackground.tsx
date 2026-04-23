'use client'

import { type BlobColors } from '@/lib/vibe-quiz'

export default function MeshBackground({ colors }: { colors: BlobColors }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        className="mesh-blob mesh-blob-1"
        style={{ backgroundColor: colors[0], top: '-4rem', left: '-4rem' }}
      />
      <div
        className="mesh-blob mesh-blob-2"
        style={{ backgroundColor: colors[1], top: '-2rem', right: '-4rem' }}
      />
      <div
        className="mesh-blob mesh-blob-3"
        style={{ backgroundColor: colors[2], bottom: '-4rem', left: 'calc(50% - 8rem)' }}
      />
    </div>
  )
}
