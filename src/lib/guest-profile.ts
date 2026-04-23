import { supabase } from './supabase'
import { type BlobColors, type PersonaWeights, type Craving, ZERO_WEIGHTS, DEFAULT_BLOB_COLORS } from './vibe-quiz'

const GUEST_ID_KEY = 'aos_guest_id'
const PERSONA_KEY = 'userVibe'

function getOrCreateGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

export type UserPersona = {
  guestId: string
  tags: Record<string, string>
  weights: PersonaWeights
  currentCraving: Craving
  blobColors: BlobColors
  completedAt: string
}

// Back-compat alias used by lobby page
export type VibeProfile = UserPersona

export async function saveUserPersona(
  tags: Record<string, string>,
  weights: PersonaWeights,
  blobColors: BlobColors = DEFAULT_BLOB_COLORS,
): Promise<void> {
  const guestId = getOrCreateGuestId()
  const persona: UserPersona = {
    guestId,
    tags,
    weights,
    currentCraving: (tags.palate as Craving) ?? 'savory',
    blobColors,
    completedAt: new Date().toISOString(),
  }

  localStorage.setItem(PERSONA_KEY, JSON.stringify(persona))

  if (supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: guestId,
        vibe_tags: Object.entries(tags).map(([k, v]) => `${k}:${v}`),
      })
    } catch {
      // Expected to fail for guest users without auth
    }
  }
}

export function getVibeProfile(): UserPersona | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PERSONA_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserPersona
    if (!parsed.weights) parsed.weights = { ...ZERO_WEIGHTS }
    if (!parsed.currentCraving) parsed.currentCraving = (parsed.tags?.palate as Craving) ?? 'savory'
    return parsed
  } catch {
    return null
  }
}

export function updateCurrentCraving(craving: Craving): void {
  const profile = getVibeProfile()
  if (!profile) return
  profile.currentCraving = craving
  localStorage.setItem(PERSONA_KEY, JSON.stringify(profile))
}

export function clearVibeProfile(): void {
  localStorage.removeItem(PERSONA_KEY)
}
