const STORAGE_KEY = 'aos_active_quests'

export type Waypoint = {
  id: string
  name: string
  address: string
  sideQuest: string
  placeId?: string
}

export type StructuredQuest = {
  id: string
  narrativeTitle: string
  description: string
  waypoints: Waypoint[]
  estimatedDuration: string
  createdAt: string
}

export function saveActiveQuest(quest: StructuredQuest): void {
  if (typeof window === 'undefined') return
  const existing = getActiveQuests().filter(q => q.id !== quest.id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([quest, ...existing]))
}

export function getActiveQuests(): StructuredQuest[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StructuredQuest[]) : []
  } catch {
    return []
  }
}

export function removeActiveQuest(id: string): void {
  if (typeof window === 'undefined') return
  const updated = getActiveQuests().filter(q => q.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
