export type BlobColors = [string, string, string]

export type PersonaWeights = {
  // Environment
  ranger: number; streetrat: number; sailor: number; architect: number
  // Social
  ghost: number; socialite: number; partner: number; leader: number
  // Discovery
  scholar: number; futurist: number; artist: number; occultist: number
  // Palate
  savory: number; sweet: number; caffeine: number; mixologist: number
  // Tempo
  drifter: number; nomad: number; flaneur: number; specialist: number
}

export const ZERO_WEIGHTS: PersonaWeights = {
  ranger: 0, streetrat: 0, sailor: 0, architect: 0,
  ghost: 0, socialite: 0, partner: 0, leader: 0,
  scholar: 0, futurist: 0, artist: 0, occultist: 0,
  savory: 0, sweet: 0, caffeine: 0, mixologist: 0,
  drifter: 0, nomad: 0, flaneur: 0, specialist: 0,
}

export type Craving = 'savory' | 'sweet' | 'caffeine' | 'mixologist'

export type VibeChoice = {
  id: string
  label: string
  sublabel: string
  imageUrl: string
  tags: Record<string, string>
  blobColors: BlobColors
  weight: Partial<PersonaWeights>
}

export type VibeStep = {
  category: string
  question: string
  choices: [VibeChoice, VibeChoice, VibeChoice, VibeChoice]
}

export const DEFAULT_BLOB_COLORS: BlobColors = [
  'rgba(124, 58, 237, 0.45)',
  'rgba(6, 182, 212, 0.35)',
  'rgba(67, 56, 202, 0.28)',
]

// Maps tag value → human label used on dashboard
export const ARCHETYPE_LABELS: Record<string, string> = {
  ranger: 'The Ranger',       streetrat: 'The Streetrat',
  sailor: 'The Sailor',       architect: 'The Architect',
  ghost: 'The Ghost',         socialite: 'The Socialite',
  partner: 'The Partner',     leader: 'The Leader',
  scholar: 'The Scholar',     futurist: 'The Futurist',
  artist: 'The Artist',       occultist: 'The Occultist',
  savory: 'The Savory',       sweet: 'The Sweet',
  caffeine: 'The Caffeine',   mixologist: 'The Mixologist',
  drifter: 'The Drifter',     nomad: 'The Nomad',
  flaneur: 'The Flâneur',     specialist: 'The Specialist',
}

// Reads resolved labels from the tags object (one tag per pillar)
export function resolveArchetype(tags: Record<string, string>): string {
  return Object.values(tags)
    .map(v => ARCHETYPE_LABELS[v] ?? v)
    .join(' · ')
}

// ── Quiz data ────────────────────────────────────────────────────────────────

export const QUIZ_STEPS: VibeStep[] = [
  {
    category: 'Initialize Map',
    question: 'Which do you prefer?',
    choices: [
      {
        id: 'ranger',
        label: 'The Ranger',
        sublabel: 'Parks, nature, trails',
        imageUrl: '/images/quiz/environment_ranger.webp',
        tags: { environment: 'ranger' },
        blobColors: ['rgba(16, 185, 129, 0.52)', 'rgba(15, 118, 110, 0.45)', 'rgba(5, 150, 105, 0.38)'],
        weight: { ranger: 1 },
      },
      {
        id: 'streetrat',
        label: 'The Streetrat',
        sublabel: 'Alleys, neon, transit',
        imageUrl: '/images/quiz/environment_streetrat.webp',
        tags: { environment: 'streetrat' },
        blobColors: ['rgba(124, 58, 237, 0.55)', 'rgba(79, 70, 229, 0.48)', 'rgba(109, 40, 217, 0.40)'],
        weight: { streetrat: 1 },
      },
      {
        id: 'sailor',
        label: 'The Sailor',
        sublabel: 'Waterfront, docks, salt air',
        imageUrl: '/images/quiz/environment_sailor.webp',
        tags: { environment: 'sailor' },
        blobColors: ['rgba(37, 99, 235, 0.55)', 'rgba(6, 182, 212, 0.48)', 'rgba(14, 165, 233, 0.40)'],
        weight: { sailor: 1 },
      },
      {
        id: 'architect',
        label: 'The Architect',
        sublabel: 'Heights, rooftops, skyline',
        imageUrl: '/images/quiz/environment_architect.webp',
        tags: { environment: 'architect' },
        blobColors: ['rgba(100, 116, 139, 0.55)', 'rgba(71, 85, 105, 0.48)', 'rgba(51, 65, 85, 0.42)'],
        weight: { architect: 1 },
      },
    ],
  },
  {
    category: 'Social Matrix',
    question: 'How do you move through a crowd?',
    choices: [
      {
        id: 'ghost',
        label: 'The Ghost',
        sublabel: 'Solo, hidden, off-grid',
        imageUrl: '/images/quiz/social_ghost.webp',
        tags: { social: 'ghost' },
        blobColors: ['rgba(15, 118, 110, 0.52)', 'rgba(30, 58, 138, 0.48)', 'rgba(6, 78, 59, 0.40)'],
        weight: { ghost: 1 },
      },
      {
        id: 'socialite',
        label: 'The Socialite',
        sublabel: 'Crowds, vibe, be seen',
        imageUrl: '/images/quiz/social_socialite.webp',
        tags: { social: 'socialite' },
        blobColors: ['rgba(234, 179, 8, 0.52)', 'rgba(249, 115, 22, 0.45)', 'rgba(239, 68, 68, 0.38)'],
        weight: { socialite: 1 },
      },
      {
        id: 'partner',
        label: 'The Partner',
        sublabel: 'Duos, intimate, close',
        imageUrl: '/images/quiz/social_partner.webp',
        tags: { social: 'partner' },
        blobColors: ['rgba(244, 63, 94, 0.45)', 'rgba(251, 113, 133, 0.38)', 'rgba(253, 164, 175, 0.30)'],
        weight: { partner: 1 },
      },
      {
        id: 'leader',
        label: 'The Leader',
        sublabel: 'Lively groups, energy',
        imageUrl: '/images/quiz/social_leader.webp',
        tags: { social: 'leader' },
        blobColors: ['rgba(220, 38, 38, 0.52)', 'rgba(234, 88, 12, 0.45)', 'rgba(202, 138, 4, 0.38)'],
        weight: { leader: 1 },
      },
    ],
  },
  {
    category: 'Discovery Protocol',
    question: 'What pulls your eyes first?',
    choices: [
      {
        id: 'scholar',
        label: 'The Scholar',
        sublabel: 'History, stone, echoes',
        imageUrl: '/images/quiz/discovery_scholar.webp',
        tags: { discovery: 'scholar' },
        blobColors: ['rgba(180, 83, 9, 0.50)', 'rgba(146, 64, 14, 0.44)', 'rgba(217, 119, 6, 0.38)'],
        weight: { scholar: 1 },
      },
      {
        id: 'futurist',
        label: 'The Futurist',
        sublabel: 'Tech, glass, neon rain',
        imageUrl: '/images/quiz/discovery_futurist.webp',
        tags: { discovery: 'futurist' },
        blobColors: ['rgba(6, 182, 212, 0.55)', 'rgba(37, 99, 235, 0.45)', 'rgba(124, 58, 237, 0.40)'],
        weight: { futurist: 1 },
      },
      {
        id: 'artist',
        label: 'The Artist',
        sublabel: 'Street art, colour, raw walls',
        imageUrl: '/images/quiz/discovery_artist.webp',
        tags: { discovery: 'artist' },
        blobColors: ['rgba(192, 38, 211, 0.50)', 'rgba(234, 179, 8, 0.42)', 'rgba(124, 58, 237, 0.38)'],
        weight: { artist: 1 },
      },
      {
        id: 'occultist',
        label: 'The Occultist',
        sublabel: 'Mysterious, eerie, hidden lore',
        imageUrl: '/images/quiz/discovery_occultist.webp',
        tags: { discovery: 'occultist' },
        blobColors: ['rgba(88, 28, 135, 0.60)', 'rgba(55, 48, 163, 0.50)', 'rgba(76, 29, 149, 0.42)'],
        weight: { occultist: 1 },
      },
    ],
  },
  {
    category: 'Palate Config',
    question: 'You follow the scent. Where does it lead?',
    choices: [
      {
        id: 'savory',
        label: 'The Savory',
        sublabel: 'Umami, spice, midnight wok',
        imageUrl: '/images/quiz/palate_savory.webp',
        tags: { palate: 'savory' },
        blobColors: ['rgba(234, 88, 12, 0.55)', 'rgba(185, 28, 28, 0.45)', 'rgba(202, 138, 4, 0.40)'],
        weight: { savory: 1 },
      },
      {
        id: 'sweet',
        label: 'The Sweet',
        sublabel: 'Pastries, light, glass cafés',
        imageUrl: '/images/quiz/palate_sweet.webp',
        tags: { palate: 'sweet' },
        blobColors: ['rgba(244, 114, 182, 0.48)', 'rgba(251, 113, 133, 0.40)', 'rgba(252, 165, 165, 0.32)'],
        weight: { sweet: 1 },
      },
      {
        id: 'caffeine',
        label: 'The Caffeine',
        sublabel: 'Coffee, tea, ritual warmth',
        imageUrl: '/images/quiz/palate_caffeine.webp',
        tags: { palate: 'caffeine' },
        blobColors: ['rgba(120, 53, 15, 0.55)', 'rgba(146, 64, 14, 0.48)', 'rgba(180, 83, 9, 0.40)'],
        weight: { caffeine: 1 },
      },
      {
        id: 'mixologist',
        label: 'The Mixologist',
        sublabel: 'Bars, cocktails, late nights',
        imageUrl: '/images/quiz/palate_mixologist.webp',
        tags: { palate: 'mixologist' },
        blobColors: ['rgba(30, 58, 138, 0.52)', 'rgba(6, 182, 212, 0.45)', 'rgba(132, 204, 22, 0.35)'],
        weight: { mixologist: 1 },
      },
    ],
  },
  {
    category: 'Tempo Calibration',
    question: 'One day. Infinite city. How do you run it?',
    choices: [
      {
        id: 'drifter',
        label: 'The Drifter',
        sublabel: 'Deep dive, stillness',
        imageUrl: '/images/quiz/tempo_drifter.webp',
        tags: { tempo: 'drifter' },
        blobColors: ['rgba(161, 98, 7, 0.48)', 'rgba(74, 222, 128, 0.38)', 'rgba(217, 119, 6, 0.35)'],
        weight: { drifter: 1 },
      },
      {
        id: 'nomad',
        label: 'The Nomad',
        sublabel: 'High speed, maximum flow',
        imageUrl: '/images/quiz/tempo_nomad.webp',
        tags: { tempo: 'nomad' },
        blobColors: ['rgba(37, 99, 235, 0.55)', 'rgba(6, 182, 212, 0.48)', 'rgba(79, 70, 229, 0.42)'],
        weight: { nomad: 1 },
      },
      {
        id: 'flaneur',
        label: 'The Flâneur',
        sublabel: 'Lazy wandering, no plan',
        imageUrl: '/images/quiz/tempo_flaneur.webp',
        tags: { tempo: 'flaneur' },
        blobColors: ['rgba(167, 139, 250, 0.48)', 'rgba(139, 92, 246, 0.40)', 'rgba(196, 181, 253, 0.32)'],
        weight: { flaneur: 1 },
      },
      {
        id: 'specialist',
        label: 'The Specialist',
        sublabel: 'Targeted goal, precision',
        imageUrl: '/images/quiz/tempo_specialist.webp',
        tags: { tempo: 'specialist' },
        blobColors: ['rgba(6, 182, 212, 0.52)', 'rgba(226, 232, 240, 0.22)', 'rgba(14, 165, 233, 0.40)'],
        weight: { specialist: 1 },
      },
    ],
  },
]
