'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  QUIZ_STEPS,
  DEFAULT_BLOB_COLORS,
  ZERO_WEIGHTS,
  type BlobColors,
  type PersonaWeights,
} from '@/lib/vibe-quiz'
import { saveUserPersona } from '@/lib/guest-profile'
import MeshBackground from '@/components/MeshBackground'

type Phase = 'enter' | 'idle' | 'exit'

export default function OnboardingPage() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [collectedTags, setCollectedTags] = useState<Record<string, string>>({})
  const [collectedWeights, setCollectedWeights] = useState<PersonaWeights>({ ...ZERO_WEIGHTS })
  const [phase, setPhase] = useState<Phase>('enter')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [blobColors, setBlobColors] = useState<BlobColors>(DEFAULT_BLOB_COLORS)
  const [calibrating, setCalibrating] = useState(false)
  const [finalColors, setFinalColors] = useState<BlobColors>(DEFAULT_BLOB_COLORS)

  useEffect(() => {
    const t = setTimeout(() => setPhase('idle'), 340)
    return () => clearTimeout(t)
  }, [stepIndex])

  function handleChoice(
    choiceId: string,
    tags: Record<string, string>,
    colors: BlobColors,
    weight: Partial<PersonaWeights>,
  ) {
    if (phase !== 'idle') return

    setSelectedId(choiceId)
    setBlobColors(colors)

    const newTags = { ...collectedTags, ...tags }
    const newWeights = { ...collectedWeights }
    for (const [k, v] of Object.entries(weight)) {
      newWeights[k as keyof PersonaWeights] += v as number
    }

    setTimeout(() => {
      setPhase('exit')
      setTimeout(async () => {
        if (stepIndex < QUIZ_STEPS.length - 1) {
          setCollectedTags(newTags)
          setCollectedWeights(newWeights)
          setStepIndex(i => i + 1)
          setSelectedId(null)
          setPhase('enter')
        } else {
          await saveUserPersona(newTags, newWeights, colors).catch(() => {})
          setFinalColors(colors)
          setCalibrating(true)
        }
      }, 320)
    }, 200)
  }

  if (calibrating) {
    return (
      <>
        <MeshBackground colors={finalColors} />
        <CalibrationScreen onDone={() => router.push('/')} />
      </>
    )
  }

  const step = QUIZ_STEPS[stepIndex]
  const animClass =
    phase === 'enter' ? 'animate-cards-enter' :
    phase === 'exit'  ? 'animate-cards-exit'  : ''

  return (
    <>
      <MeshBackground colors={blobColors} />

      <main
        className="relative flex flex-col min-h-screen px-4 pb-safe"
        style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))', zIndex: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <Link
            href="/"
            className="flex items-center justify-center rounded-xl active:opacity-50"
            style={{
              width: 44, height: 44,
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Link>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {QUIZ_STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === stepIndex ? '20px' : '5px',
                  height: '5px',
                  background: i <= stepIndex ? 'var(--color-violet)' : 'var(--color-border-strong)',
                }}
              />
            ))}
          </div>

          <span
            className="font-mono text-xs tabular-nums"
            style={{ width: 44, textAlign: 'right', color: 'var(--color-text-muted)' }}
          >
            {String(stepIndex + 1).padStart(2, '0')}/{QUIZ_STEPS.length}
          </span>
        </div>

        {/* Animated content */}
        <div className={`flex flex-col flex-1 gap-4 ${animClass}`}>

          {/* Category + question */}
          <div className="flex flex-col gap-1">
            <p
              className="text-xs tracking-[0.22em] uppercase font-medium"
              style={{ color: 'var(--color-cyan)' }}
            >
              {step.category}
            </p>
            <h2
              className="text-xl font-semibold leading-snug tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {step.question}
            </h2>
          </div>

          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {step.choices.map(choice => (
              <ChoiceCard
                key={choice.id}
                choice={choice}
                isSelected={selectedId === choice.id}
                disabled={phase !== 'idle'}
                onClick={() => handleChoice(choice.id, choice.tags, choice.blobColors, choice.weight)}
              />
            ))}
          </div>

        </div>
      </main>
    </>
  )
}

// ── Choice card ──────────────────────────────────────────────────────────────

type ChoiceCardProps = {
  choice: {
    id: string
    label: string
    sublabel: string
    imageUrl: string
    blobColors: BlobColors
  }
  isSelected: boolean
  disabled: boolean
  onClick: () => void
}

function ChoiceCard({ choice, isSelected, disabled, onClick }: ChoiceCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative rounded-2xl overflow-hidden text-left"
      style={{
        aspectRatio: '3 / 4',
        border: isSelected
          ? '1.5px solid rgba(124, 58, 237, 0.75)'
          : '1px solid rgba(255,255,255,0.09)',
        boxShadow: isSelected
          ? '0 0 24px rgba(124, 58, 237, 0.30), inset 0 1px 0 rgba(255,255,255,0.12)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Background image — dark fallback while images load */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${choice.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(8, 10, 24, 1)',
        }}
      />

      {/* Gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(2,6,23,0.97) 0%, rgba(2,6,23,0.45) 45%, rgba(2,6,23,0.08) 100%)',
        }}
      />

      {/* Corner brackets */}
      <CornerBrackets active={isSelected} />

      {/* Checkmark badge */}
      {isSelected && (
        <div
          className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
          style={{
            width: 24, height: 24,
            background: 'var(--color-violet)',
            boxShadow: '0 0 12px rgba(124,58,237,0.70)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Label panel */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(2,6,23,0.60)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <p
          className="text-sm font-bold tracking-wide leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {choice.label}
        </p>
        <p
          className="text-[10px] mt-0.5 leading-snug"
          style={{ color: 'rgba(148,163,184,0.65)' }}
        >
          {choice.sublabel}
        </p>
      </div>
    </button>
  )
}

// Sci-fi corner bracket overlays
function CornerBrackets({ active }: { active: boolean }) {
  const color = active ? 'rgba(124,58,237,0.85)' : 'rgba(255,255,255,0.16)'
  const s = 12
  const t = 1.5

  const wrap: React.CSSProperties = { position: 'absolute', width: s, height: s }
  const line: React.CSSProperties = { position: 'absolute', background: color, transition: 'background 0.2s ease' }

  return (
    <>
      <div style={{ ...wrap, top: 8, left: 8 }}>
        <div style={{ ...line, top: 0, left: 0, width: s, height: t }} />
        <div style={{ ...line, top: 0, left: 0, width: t, height: s }} />
      </div>
      <div style={{ ...wrap, top: 8, right: 8 }}>
        <div style={{ ...line, top: 0, right: 0, width: s, height: t }} />
        <div style={{ ...line, top: 0, right: 0, width: t, height: s }} />
      </div>
      <div style={{ ...wrap, bottom: 8, left: 8 }}>
        <div style={{ ...line, bottom: 0, left: 0, width: s, height: t }} />
        <div style={{ ...line, bottom: 0, left: 0, width: t, height: s }} />
      </div>
      <div style={{ ...wrap, bottom: 8, right: 8 }}>
        <div style={{ ...line, bottom: 0, right: 0, width: s, height: t }} />
        <div style={{ ...line, bottom: 0, right: 0, width: t, height: s }} />
      </div>
    </>
  )
}

// ── Calibration screen ───────────────────────────────────────────────────────

function CalibrationScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <main
      className="animate-calibration-enter relative flex flex-col items-center justify-center min-h-screen px-6 gap-10"
      style={{ zIndex: 1 }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 64, height: 64,
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.35)',
          boxShadow: '0 0 40px rgba(124,58,237,0.25)',
        }}
      >
        <svg
          className="animate-calibration-pulse"
          width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </div>

      <div className="text-center flex flex-col gap-2">
        <p className="text-xs tracking-[0.22em] uppercase" style={{ color: 'var(--color-cyan)' }}>
          Calibrating your OS
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Building your persona profile…
        </p>
      </div>

      <div
        className="rounded-full overflow-hidden"
        style={{ width: 192, height: 2, background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full animate-progress-fill"
          style={{ background: 'linear-gradient(90deg, var(--color-violet), var(--color-cyan))' }}
        />
      </div>
    </main>
  )
}
