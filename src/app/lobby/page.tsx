'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MeshBackground from '@/components/MeshBackground'
import { getVibeProfile } from '@/lib/guest-profile'
import { DEFAULT_BLOB_COLORS } from '@/lib/vibe-quiz'
import { supabase } from '@/lib/supabase'

type Member = { id: string; joinedAt: number }

function generateRoomCode(): string {
  // Omit O, I, 0, 1 to avoid read errors
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function LobbyPage() {
  const router = useRouter()
  const profile = getVibeProfile()
  const blobColors = profile?.blobColors ?? DEFAULT_BLOB_COLORS

  const [roomCode] = useState(generateRoomCode)
  const [members, setMembers] = useState<Member[]>([])
  const [connected, setConnected] = useState(false)
  const [copied, setCopied] = useState(false)

  const guestId = profile?.guestId ?? 'guest'

  const setupRealtime = useCallback(() => {
    if (!supabase) return   // keys not configured yet — lobby works visually without it

    const channel = supabase.channel(`lobby:${roomCode}`, {
      config: { presence: { key: guestId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ joinedAt: number }>()
        const joined: Member[] = Object.entries(state).map(([id, metas]) => ({
          id,
          joinedAt: metas[0]?.joinedAt ?? Date.now(),
        }))
        setMembers(joined)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          await channel.track({ joinedAt: Date.now() })
        }
      })

    return () => { supabase!.removeChannel(channel) }
  }, [roomCode, guestId])

  useEffect(() => {
    const cleanup = setupRealtime()
    // Show self in lobby immediately even without Supabase
    setMembers([{ id: guestId, joinedAt: Date.now() }])
    return cleanup
  }, [setupRealtime, guestId])

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <MeshBackground colors={blobColors} />

      <main
        className="relative flex flex-col min-h-screen px-5 pt-14 pb-safe"
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--color-cyan)' }}>
              Raid Mode
            </p>
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Lobby Open
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: connected ? 'var(--color-success)' : 'var(--color-text-dim)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {connected ? 'Live' : 'Connecting…'}
            </span>
          </div>
        </div>

        {/* Room code */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3 mb-6">
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
            Share this code
          </p>
          <p
            className="text-4xl font-bold tracking-[0.25em]"
            style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
          >
            {roomCode}
          </p>
          <button
            onClick={copyCode}
            className="glass-btn h-9 px-4 rounded-xl text-xs font-medium tracking-wider uppercase"
            style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Members */}
        <div className="flex flex-col gap-3 flex-1">
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
            Crew ({members.length})
          </p>

          <div className="flex flex-col gap-2">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="glass rounded-xl px-4 h-14 flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(124,58,237,0.25)', color: 'var(--color-text-primary)' }}
                >
                  {i + 1}
                </div>
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {m.id === guestId ? 'You (Host)' : `Player ${i + 1}`}
                </span>
                {m.id === guestId && (
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.20)', color: 'var(--color-violet)' }}
                  >
                    Host
                  </span>
                )}
              </div>
            ))}

            {members.length < 2 && (
              <div
                className="rounded-xl px-4 h-14 flex items-center gap-3"
                style={{ border: '1px dashed var(--color-border)', opacity: 0.5 }}
              >
                <div className="w-8 h-8 rounded-full" style={{ background: 'var(--color-border)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                  Waiting for crew…
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Start CTA */}
        <div className="flex flex-col gap-3 max-w-sm w-full mx-auto">
          <button
            onClick={() => router.push('/adventure')}
            className="glass-btn-primary w-full h-14 rounded-2xl text-sm font-semibold tracking-[0.18em] uppercase"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {members.length >= 2 ? 'Launch Raid' : 'Solo for now'}
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {members.length >= 2
              ? `${members.length} adventurers ready`
              : 'You can start solo or wait for your crew'}
          </p>
        </div>
      </main>
    </>
  )
}
