'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MeshBackground from '@/components/MeshBackground'
import { getVibeProfile } from '@/lib/guest-profile'
import { getActiveQuests, removeActiveQuest, type StructuredQuest } from '@/lib/active-quests'
import { DEFAULT_BLOB_COLORS } from '@/lib/vibe-quiz'
import { googleMapsUrl } from '@/lib/location'

export default function AdventurePage() {
  const router = useRouter()
  const [quest, setQuest]               = useState<StructuredQuest | null>(null)
  const [loaded, setLoaded]             = useState(false)
  const [completed, setCompleted]       = useState<Set<string>>(new Set())

  const profile    = typeof window !== 'undefined' ? getVibeProfile() : null
  const blobColors = profile?.blobColors ?? DEFAULT_BLOB_COLORS

  useEffect(() => {
    const quests = getActiveQuests()
    setQuest(quests[0] ?? null)
    setLoaded(true)
  }, [])

  function toggleWaypoint(id: string) {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAbandon() {
    if (!quest) return
    removeActiveQuest(quest.id)
    setQuest(null)
  }

  if (!loaded) return null

  return (
    <>
      <MeshBackground colors={blobColors} />

      <main
        className="relative flex flex-col min-h-screen pb-safe"
        style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))', zIndex: 1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 44, height: 44, border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs tracking-[0.20em] uppercase" style={{ color: 'var(--color-cyan)' }}>Active Quest</p>
            <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              {quest?.narrativeTitle ?? 'The Journey'}
            </h1>
          </div>
        </div>

        {!quest ? (
          <EmptyState onGoHome={() => router.push('/')} />
        ) : (
          <QuestView
            quest={quest}
            completed={completed}
            onToggle={toggleWaypoint}
            onAbandon={handleAbandon}
          />
        )}
      </main>
    </>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6 text-center">
      <div className="flex items-center justify-center rounded-2xl"
        style={{ width: 64, height: 64, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.28)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>No active quest</p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Ask Lyra to generate a real quest<br />from the Home dashboard.
        </p>
      </div>
      <button onClick={onGoHome}
        className="glass-btn-primary h-14 px-8 rounded-2xl text-sm font-semibold tracking-[0.18em] uppercase"
        style={{ color: 'var(--color-text-primary)' }}>
        Go to Dashboard
      </button>
    </div>
  )
}

// ── Quest view ───────────────────────────────────────────────────────────────

function QuestView({
  quest, completed, onToggle, onAbandon,
}: {
  quest: StructuredQuest
  completed: Set<string>
  onToggle: (id: string) => void
  onAbandon: () => void
}) {
  const allDone = quest.waypoints.every(wp => completed.has(wp.id))

  return (
    <div className="flex flex-col flex-1 px-5 gap-6">

      {/* Quest info card */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-2xl font-bold tracking-tight leading-tight"
          style={{ background: 'linear-gradient(135deg, #a78bfa, var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {quest.narrativeTitle}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.80)' }}>{quest.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.28)', color: 'var(--color-cyan)' }}>
            {quest.estimatedDuration}
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.28)', color: 'var(--color-violet)' }}>
            {quest.waypoints.length} waypoints
          </span>
          {allDone && (
            <span className="text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: 'var(--color-success)' }}>
              Complete ✓
            </span>
          )}
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="flex flex-col">
        {quest.waypoints.map((wp, i) => {
          const isDone = completed.has(wp.id)
          const isLast = i === quest.waypoints.length - 1
          return (
            <div key={wp.id} className="flex gap-4">

              {/* Timeline spine */}
              <div className="flex flex-col items-center" style={{ width: 32 }}>
                <button
                  onClick={() => onToggle(wp.id)}
                  className="flex items-center justify-center rounded-full font-bold text-xs flex-shrink-0 transition-all duration-200"
                  style={{
                    width: 32, height: 32,
                    background: isDone ? 'var(--color-violet)' : 'rgba(124,58,237,0.20)',
                    border: `1.5px solid ${isDone ? 'var(--color-violet)' : 'rgba(124,58,237,0.45)'}`,
                    color: isDone ? 'white' : 'var(--color-violet)',
                    boxShadow: isDone ? '0 0 16px rgba(124,58,237,0.50)' : 'none',
                  }}>
                  {isDone
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : i + 1
                  }
                </button>
                {!isLast && (
                  <div className="flex-1 w-px my-1" style={{ background: 'rgba(124,58,237,0.22)', minHeight: 24 }} />
                )}
              </div>

              {/* Waypoint content */}
              <div className={`flex flex-col gap-2 pb-6 flex-1 ${isLast ? '' : ''}`}>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {wp.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,0.80)' }}>{wp.address}</p>
                </div>

                {/* Side quest */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.20)' }}>
                  <p className="text-[10px] tracking-[0.16em] uppercase mb-1" style={{ color: 'var(--color-violet)' }}>Side Quest</p>
                  <p className="text-xs leading-snug" style={{ color: 'rgba(148,163,184,0.80)' }}>{wp.sideQuest}</p>
                </div>

                {/* Navigate button */}
                <a
                  href={googleMapsUrl(wp.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn h-9 px-3 rounded-xl text-[10px] font-medium tracking-[0.12em] uppercase self-start flex items-center gap-1.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Navigate
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Primary CTA — "Start Navigation" opens first waypoint */}
      <div className="flex flex-col gap-3 mt-auto">
        <a
          href={googleMapsUrl(quest.waypoints[0].address)}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-btn-primary flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-sm font-semibold tracking-[0.18em] uppercase"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Start Navigation
        </a>

        <button
          onClick={onAbandon}
          className="text-xs tracking-wide text-center py-2"
          style={{ color: 'var(--color-text-dim)' }}
        >
          Abandon Quest
        </button>
      </div>
    </div>
  )
}
