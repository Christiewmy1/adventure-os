import { GoogleGenerativeAI } from '@google/generative-ai'
import { randomUUID } from 'crypto'
import type { Place } from '@/app/api/places/route'
import type { StructuredQuest } from '@/lib/active-quests'

export type Quest = {
  id: string
  title: string
  tag: string
  description: string
}

export type LyraResponse = {
  reply: string
  quests?: Quest[]
  structuredQuest?: StructuredQuest
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_QUESTS: Quest[] = [
  { id: '1', title: 'Midnight Market Run',  tag: 'Street Food',  description: 'Follow the smoke to the best wok stall in the district.' },
  { id: '2', title: 'The Hidden Rooftop',   tag: 'Architecture', description: 'A forgotten terrace with a skyline view only locals know.' },
  { id: '3', title: 'Alley Gallery Crawl',  tag: 'Street Art',   description: 'A network of murals connecting three hidden courtyards.' },
  { id: '4', title: 'Dawn Waterfront Loop', tag: 'Nature',       description: 'The docks before the city wakes — cargo cranes and quiet water.' },
]

const MOCK_STRUCTURED_QUEST: StructuredQuest = {
  id: 'mock-quest-1',
  narrativeTitle: 'The Wandering Eye',
  description: 'A curated loop through the city\'s hidden layers — from green silence to neon depth.',
  waypoints: [
    { id: '1', name: 'City Botanical Garden', address: '1 Garden Way, City, ST 00001', sideQuest: 'Find one plant you\'ve never seen before and sketch it on your phone notes.' },
    { id: '2', name: 'The Old History Museum', address: '10 Museum Row, City, ST 00001', sideQuest: 'Locate the oldest artifact on display and spend 3 minutes just standing with it.' },
    { id: '3', name: 'Corner Espresso Bar', address: '22 Main St, City, ST 00001', sideQuest: 'Order something you\'ve never tried and write one sentence about how it tastes.' },
  ],
  estimatedDuration: '2–3 hours',
  createdAt: new Date().toISOString(),
}

// ── Prompt builders ──────────────────────────────────────────────────────────

const ARCHETYPE_MAP: Record<string, string> = {
  ranger: 'The Ranger',     streetrat: 'The Streetrat', sailor: 'The Sailor',    architect: 'The Architect',
  ghost: 'The Ghost',       socialite: 'The Socialite', partner: 'The Partner',  leader: 'The Leader',
  scholar: 'The Scholar',   futurist: 'The Futurist',   artist: 'The Artist',    occultist: 'The Occultist',
  savory: 'The Savory',     sweet: 'The Sweet',         caffeine: 'The Caffeine', mixologist: 'The Mixologist',
  drifter: 'The Drifter',   nomad: 'The Nomad',         flaneur: 'The Flâneur',  specialist: 'The Specialist',
}

function personaString(tags: Record<string, string>): string {
  return Object.entries(tags)
    .map(([pillar, val]) => `${pillar}: ${ARCHETYPE_MAP[val] ?? val}`)
    .join(', ')
}

function buildChatSystemPrompt(tags: Record<string, string>): string {
  return `You are Lyra — the intelligent guide inside Adventure OS, a real-life urban exploration app.
You are friendly, professional, and supportive. You speak with quiet confidence and a sense of wonder.
Keep all responses concise (2–3 sentences max for the reply text).

The user's persona profile: ${personaString(tags)}

Your job: Given the user's message, suggest 4 urban quest ideas that match their persona profile.
Tailor quests to their environment, discovery style, social preference, palate, and pace.

Respond ONLY with valid JSON (no markdown, no code fences) in exactly this shape:
{
  "reply": "conversational response string",
  "quests": [
    { "id": "1", "title": "Quest Name", "tag": "Category", "description": "One-sentence hook." },
    { "id": "2", "title": "Quest Name", "tag": "Category", "description": "One-sentence hook." },
    { "id": "3", "title": "Quest Name", "tag": "Category", "description": "One-sentence hook." },
    { "id": "4", "title": "Quest Name", "tag": "Category", "description": "One-sentence hook." }
  ]
}`
}

function buildQuestPrompt(tags: Record<string, string>, places: Place[]): string {
  const persona = personaString(tags)
  const placesList = places.map(p => `  - ${p.name} | ${p.address}`).join('\n')

  return `You are Lyra — the adventure guide for Adventure OS. You are friendly, professional, and inspiring.

User persona: ${persona}

Real nearby places found via location services:
${placesList}

Create a Structured Quest using ONLY the real places listed above. Pick the 3 that best match the persona.

Rules:
- narrativeTitle: evocative 2-3 words starting with "The " (e.g., "The Neon Vigil")
- description: 1-2 sentences of cinematic narrative flavour
- Each sideQuest: a specific, actionable self-care or social interaction task (e.g., "Sketch one detail you notice here" or "Strike up a conversation with a stranger about this place")
- Use the exact name and address from the list — do not invent or modify them
- estimatedDuration: realistic walking estimate (e.g., "2–3 hours")
- reply: one punchy sentence introducing the quest, friendly and excited

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "reply": "one sentence intro",
  "structuredQuest": {
    "narrativeTitle": "The ___",
    "description": "1-2 sentence flavour text",
    "waypoints": [
      { "id": "1", "name": "exact name", "address": "exact address", "sideQuest": "specific task" },
      { "id": "2", "name": "exact name", "address": "exact address", "sideQuest": "specific task" },
      { "id": "3", "name": "exact name", "address": "exact address", "sideQuest": "specific task" }
    ],
    "estimatedDuration": "X–Y hours"
  }
}`
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const { message, tags, history, places, generateQuest } = await request.json() as {
    message: string
    tags: Record<string, string>
    history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
    places?: Place[]
    generateQuest?: boolean
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    if (generateQuest) {
      return Response.json({
        reply: "Quest locked and loaded. Here's your mission.",
        structuredQuest: { ...MOCK_STRUCTURED_QUEST, id: randomUUID(), createdAt: new Date().toISOString() },
      } satisfies LyraResponse)
    }
    return Response.json({
      reply: "Your city is waiting — I've queued up some quests that match your vibe.",
      quests: MOCK_QUESTS,
    } satisfies LyraResponse)
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  // ── Quest generation mode ────────────────────────────────────────────────
  if (generateQuest && places?.length) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
      const result = await model.generateContent(buildQuestPrompt(tags, places))
      const raw = result.response.text().trim()
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const parsed = JSON.parse(cleaned) as { reply: string; structuredQuest: Omit<StructuredQuest, 'id' | 'createdAt'> }

      const structuredQuest: StructuredQuest = {
        ...parsed.structuredQuest,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      }

      return Response.json({ reply: parsed.reply, structuredQuest } satisfies LyraResponse)
    } catch (err) {
      console.error('[lyra] Quest generation error:', err)
      return Response.json({
        reply: "Quest locked and loaded. Here's your mission.",
        structuredQuest: { ...MOCK_STRUCTURED_QUEST, id: randomUUID(), createdAt: new Date().toISOString() },
      } satisfies LyraResponse)
    }
  }

  // ── Chat mode ────────────────────────────────────────────────────────────
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: buildChatSystemPrompt(tags),
    })

    const chat = model.startChat({ history: history ?? [] })
    const result = await chat.sendMessage(message)
    const raw = result.response.text().trim()
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(cleaned) as LyraResponse

    return Response.json(parsed)
  } catch (err) {
    console.error('[lyra] Chat error:', err)
    return Response.json({
      reply: "I'm having trouble connecting right now. Here are some quests to keep you moving.",
      quests: MOCK_QUESTS,
    } satisfies LyraResponse)
  }
}
