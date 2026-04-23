'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MeshBackground from '@/components/MeshBackground'
import { getVibeProfile, clearVibeProfile, type UserPersona } from '@/lib/guest-profile'
import { DEFAULT_BLOB_COLORS, resolveArchetype } from '@/lib/vibe-quiz'
import { getBrowserCoords, googleMapsUrl, type Coords } from '@/lib/location'
import { saveActiveQuest, type StructuredQuest } from '@/lib/active-quests'
import type { Quest, LyraResponse } from '@/app/api/lyra/route'
import type { Place } from '@/app/api/places/route'

type Tab = 'home' | 'quest' | 'crew'
type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied'

type ChatMessage = {
  id: string
  role: 'user' | 'lyra'
  content: string
  quests?: Quest[]
  structuredQuest?: StructuredQuest
}

type GeminiTurn = { role: 'user' | 'model'; parts: Array<{ text: string }> }

// ── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [profile, setProfile] = useState<UserPersona | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const router = useRouter()

  useEffect(() => { setProfile(getVibeProfile()); setLoaded(true) }, [])
  if (!loaded) return null

  const blobColors = profile?.blobColors ?? DEFAULT_BLOB_COLORS

  function handleTabPress(t: Tab) {
    setTab(t)
    if (t === 'quest') router.push('/adventure')
    if (t === 'crew')  router.push('/lobby')
  }

  return (
    <>
      <MeshBackground colors={blobColors} />
      <main className="relative flex flex-col pb-nav-safe"
        style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))', minHeight: '100dvh', zIndex: 1 }}>
        {!profile ? <SplashView /> : (
          <DashboardView
            profile={profile}
            onRecalibrate={() => { clearVibeProfile(); setProfile(null) }}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0" style={{ zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'rgba(2,6,23,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-stretch">
          <NavTab label="Home"  active={tab === 'home'}  onClick={() => handleTabPress('home')}  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
          <NavTab label="Quest" active={tab === 'quest'} onClick={() => handleTabPress('quest')} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>} />
          <NavTab label="Crew"  active={tab === 'crew'}  onClick={() => handleTabPress('crew')}  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        </div>
      </nav>
    </>
  )
}

function NavTab({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150"
      style={{ minHeight: 60, color: active ? 'var(--color-violet)' : 'var(--color-text-muted)' }}>
      {icon}
      <span className="text-[10px] tracking-[0.14em] uppercase font-medium">{label}</span>
    </button>
  )
}

// ── Splash ───────────────────────────────────────────────────────────────────

function SplashView() {
  return (
    <div className="flex flex-col justify-between flex-1 px-6">
      <div />
      <div className="flex flex-col items-center gap-5 text-center">
        <h1 className="text-glow-violet text-[3.5rem] font-semibold leading-[1.1] tracking-[0.12em] uppercase" style={{ color: 'var(--color-text-primary)' }}>
          Adventure<br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>OS</span>
        </h1>
        <p className="max-w-[16rem] text-sm leading-relaxed tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Your city is the dungeon.<br />Every street holds a quest.
        </p>
        <div className="w-12 h-px" style={{ background: 'var(--color-border-strong)' }} />
      </div>
      <div className="w-full flex flex-col gap-3 max-w-sm mx-auto">
        <Link href="/onboarding" className="glass-btn-primary flex items-center justify-center w-full h-14 rounded-2xl text-sm font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--color-text-primary)' }}>Begin Quest</Link>
        <Link href="/adventure" className="glass-btn flex items-center justify-center w-full h-14 rounded-2xl text-sm font-medium tracking-[0.12em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Continue as Guest</Link>
        <p className="text-center text-xs tracking-wide mt-1" style={{ color: 'var(--color-text-dim)' }}>No account needed to explore</p>
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function DashboardView({ profile, onRecalibrate }: { profile: UserPersona; onRecalibrate: () => void }) {
  const router = useRouter()

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [quests, setQuests]     = useState<Quest[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [history, setHistory]   = useState<GeminiTurn[]>([])
  const messagesEndRef           = useRef<HTMLDivElement>(null)
  const greetedRef               = useRef(false)

  // Location state
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const [locationLabel, setLocationLabel]   = useState('')
  const [zipInput, setZipInput]             = useState('')
  const [zipError, setZipError]             = useState('')
  const coordsRef                            = useRef<Coords | null>(null)

  // Quest generation state
  const [generatingQuest, setGeneratingQuest] = useState(false)
  const [savedQuestId, setSavedQuestId]       = useState<string | null>(null)

  // ── Location helpers ────────────────────────────────────────────────────

  async function requestGPS(): Promise<Coords | null> {
    setLocationStatus('requesting')
    try {
      const c = await getBrowserCoords()
      coordsRef.current = c
      setLocationStatus('granted')
      setLocationLabel('Near You')
      return c
    } catch {
      setLocationStatus('denied')
      return null
    }
  }

  async function handleZipSubmit() {
    setZipError('')
    if (!zipInput.trim()) return
    try {
      const res = await fetch(`/api/geocode?zip=${encodeURIComponent(zipInput.trim())}`)
      const data = await res.json()
      if (data.error || !data.coords) { setZipError('Location not found — try a nearby city name.'); return }
      coordsRef.current = data.coords
      setLocationStatus('granted')
      setLocationLabel(data.label)
    } catch {
      setZipError('Could not connect. Try again.')
    }
  }

  // ── Lyra chat ───────────────────────────────────────────────────────────

  const sendToLyra = useCallback(async (text: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/lyra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, tags: profile.tags, history }),
      })
      const data = await res.json() as LyraResponse
      const lyraMsg: ChatMessage = { id: crypto.randomUUID(), role: 'lyra', content: data.reply, quests: data.quests }
      setMessages(prev => [...prev, lyraMsg])
      if (data.quests?.length) setQuests(data.quests)
      setHistory(prev => [...prev,
        { role: 'user',  parts: [{ text }] },
        { role: 'model', parts: [{ text: JSON.stringify(data) }] },
      ])
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'lyra', content: 'Signal lost. Try again.' }])
    } finally {
      setLoading(false)
    }
  }, [profile.tags, history])

  // Greeting — fired once on mount
  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    const tagList = Object.entries(profile.tags).map(([p, v]) => `${p}: ${v}`).join(', ')
    sendToLyra(
      `Give me a single opening greeting. Acknowledge my 5 persona traits (${tagList}) naturally, ` +
      `then suggest 4 personalised quests. 2–3 sentences max — confident, warm, ready to go.`
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }])
    await sendToLyra(text)
  }

  // ── Quest generation ────────────────────────────────────────────────────

  async function handleGenerateQuest() {
    let coords = coordsRef.current
    if (!coords) {
      coords = await requestGPS()
      if (!coords) return  // GPS denied — zip input is now shown
    }

    setGeneratingQuest(true)
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: '🗺  Generate a real quest near me' }])

    try {
      // Step 1: fetch nearby places
      const placesRes = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng, tags: profile.tags }),
      })
      const places: Place[] = await placesRes.json()

      // Step 2: generate structured quest
      const lyraRes = await fetch('/api/lyra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'generate quest', tags: profile.tags, places, generateQuest: true }),
      })
      const data: LyraResponse = await lyraRes.json()

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'lyra',
        content: data.reply,
        structuredQuest: data.structuredQuest,
      }])
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'lyra', content: 'Quest generation failed. Check your connection.' }])
    } finally {
      setGeneratingQuest(false)
    }
  }

  const archetype = resolveArchetype(profile.tags)
  const isLoading = loading || generatingQuest

  return (
    <div className="flex flex-col flex-1 px-4 gap-3">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs tracking-[0.22em] uppercase" style={{ color: 'var(--color-cyan)' }}>Persona OS</p>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{archetype}</h1>

          {/* Location status line */}
          {locationStatus === 'idle' && (
            <button onClick={requestGPS} className="text-[10px] tracking-wide mt-0.5 text-left" style={{ color: 'var(--color-text-muted)' }}>
              📍 Set location to generate real quests
            </button>
          )}
          {locationStatus === 'requesting' && (
            <p className="text-[10px] tracking-wide mt-0.5 animate-calibration-pulse" style={{ color: 'var(--color-text-muted)' }}>📍 Getting your location…</p>
          )}
          {locationStatus === 'granted' && (
            <p className="text-[10px] tracking-wide mt-0.5" style={{ color: 'var(--color-success)' }}>📍 {locationLabel}</p>
          )}
          {locationStatus === 'denied' && (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                value={zipInput}
                onChange={e => { setZipInput(e.target.value); setZipError('') }}
                onKeyDown={e => e.key === 'Enter' && handleZipSubmit()}
                placeholder="Zip or city…"
                className="bg-transparent text-[10px] outline-none border-b w-24"
                style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)', caretColor: 'var(--color-violet)', paddingBottom: 2 }}
              />
              <button onClick={handleZipSubmit} className="text-[10px] tracking-wide" style={{ color: 'var(--color-cyan)' }}>Go</button>
              {zipError && <p className="text-[10px]" style={{ color: 'var(--color-danger)' }}>{zipError}</p>}
            </div>
          )}
        </div>

        <button onClick={onRecalibrate}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 44, height: 44, border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Trait chips */}
      <div className="flex flex-wrap gap-1.5">
        {Object.values(profile.tags).map(v => (
          <span key={v} className="text-[10px] px-2.5 py-1 rounded-full tracking-wide"
            style={{ background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(124,58,237,0.28)', color: 'var(--color-text-primary)' }}>
            {v}
          </span>
        ))}
      </div>

      {/* Lyra chat panel */}
      <div className="glass rounded-2xl flex flex-col overflow-hidden" style={{ flex: '1 1 0', minHeight: 0 }}>

        {/* Lyra header */}
        <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 32, height: 32, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Lyra</p>
            <p className="text-[10px] tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              {generatingQuest ? 'Mapping your quest…' : isLoading ? 'Thinking…' : 'Your AI guide'}
            </p>
          </div>
          {isLoading && (
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="rounded-full animate-calibration-pulse"
                  style={{ width: 5, height: 5, background: 'var(--color-violet)', animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                style={{
                  maxWidth: '82%',
                  ...(msg.role === 'user'
                    ? { background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(124,58,237,0.35)', color: 'var(--color-text-primary)', borderBottomRightRadius: 6 }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderBottomLeftRadius: 6 }),
                }}>
                {msg.content}
              </div>

              {/* Structured quest card inline in chat */}
              {msg.structuredQuest && (
                <StructuredQuestCard
                  quest={msg.structuredQuest}
                  saved={savedQuestId === msg.structuredQuest.id}
                  onSave={() => { saveActiveQuest(msg.structuredQuest!); setSavedQuestId(msg.structuredQuest!.id) }}
                  onView={() => router.push('/adventure')}
                />
              )}

              {/* Simple quest suggestions */}
              {msg.quests && msg.quests.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 w-full" style={{ scrollbarWidth: 'none' }}>
                  {msg.quests.map(q => <SimpleQuestCard key={q.id} quest={q} />)}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 flex gap-1.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderBottomLeftRadius: 6 }}>
                {[0,1,2].map(i => (
                  <div key={i} className="rounded-full animate-calibration-pulse"
                    style={{ width: 6, height: 6, background: 'var(--color-text-muted)', animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* Generate Quest button */}
          <button
            onClick={handleGenerateQuest}
            disabled={isLoading}
            title="Generate a real quest near you"
            className="flex items-center justify-center rounded-xl flex-shrink-0 transition-opacity"
            style={{
              width: 44, height: 44,
              background: locationStatus === 'granted' ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${locationStatus === 'granted' ? 'rgba(6,182,212,0.40)' : 'var(--color-border)'}`,
              color: locationStatus === 'granted' ? 'var(--color-cyan)' : 'var(--color-text-muted)',
              opacity: isLoading ? 0.5 : 1,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
          </button>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Lyra anything…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ minHeight: 44, color: 'var(--color-text-primary)', caretColor: 'var(--color-violet)' }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center rounded-xl flex-shrink-0 transition-opacity"
            style={{
              width: 44, height: 44,
              background: input.trim() && !isLoading ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(124,58,237,0.35)',
              color: input.trim() && !isLoading ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              opacity: isLoading ? 0.5 : 1,
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Simple quest cards below chat (from Lyra suggestions) */}
      {quests.length > 0 && (
        <div className="flex flex-col gap-2 pb-2">
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Queued Quests</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {quests.map(q => <SimpleQuestCard key={q.id} quest={q} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Structured quest card (real waypoints, saveable) ─────────────────────────

function StructuredQuestCard({
  quest, saved, onSave, onView,
}: {
  quest: StructuredQuest
  saved: boolean
  onSave: () => void
  onView: () => void
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3 w-full"
      style={{ border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 0 24px rgba(124,58,237,0.12)' }}>

      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] tracking-[0.20em] uppercase mb-0.5" style={{ color: 'var(--color-cyan)' }}>Structured Quest</p>
          <p className="text-base font-bold tracking-tight leading-snug"
            style={{ background: 'linear-gradient(135deg, #a78bfa, var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {quest.narrativeTitle}
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.28)', color: 'var(--color-cyan)' }}>
          {quest.estimatedDuration}
        </span>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.75)' }}>{quest.description}</p>

      {/* Waypoints */}
      <div className="flex flex-col gap-1.5">
        {quest.waypoints.map((wp, i) => (
          <div key={wp.id} className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-full flex-shrink-0 text-[10px] font-bold"
              style={{ width: 20, height: 20, background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.45)', color: 'var(--color-violet)' }}>
              {i + 1}
            </div>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{wp.name}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {saved ? (
          <button onClick={onView}
            className="flex-1 h-10 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase glass-btn-primary"
            style={{ color: 'var(--color-text-primary)' }}>
            View Quest →
          </button>
        ) : (
          <button onClick={onSave}
            className="flex-1 h-10 rounded-xl text-xs font-semibold tracking-[0.12em] uppercase glass-btn-primary"
            style={{ color: 'var(--color-text-primary)' }}>
            + Save Quest
          </button>
        )}
      </div>
    </div>
  )
}

// ── Simple quest card (Lyra chat suggestions) ────────────────────────────────

function SimpleQuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="flex-shrink-0 glass rounded-xl text-left flex flex-col gap-1.5 p-3" style={{ width: 155 }}>
      <span className="text-[10px] tracking-[0.16em] uppercase font-medium px-2 py-0.5 rounded-full self-start"
        style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.28)', color: 'var(--color-cyan)' }}>
        {quest.tag}
      </span>
      <p className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{quest.title}</p>
      <p className="text-[11px] leading-snug line-clamp-2" style={{ color: 'rgba(148,163,184,0.65)' }}>{quest.description}</p>
    </div>
  )
}

// Suppress unused import — googleMapsUrl is used in adventure page
void googleMapsUrl
