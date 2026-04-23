🗺️ Adventure OS: Full System Specification
Role: Lead Developer & Experience Architect

Project Goal: A context-aware "Real-Life RPG" for solo exploration, dates, and group hangouts.

1. Core Mission
To eliminate decision fatigue by transforming urban data into narrative-driven "Quests." The app must scale dynamically between three modes:

Solo ("Main Character"): Focus on immersion, reflection, and hidden gems.

Duo ("The Wingman"): Focus on romantic flow and conversation starters.

Group ("The Raid"): Focus on consensus via real-time collaborative voting.

2. Technical Stack (2026 Optimized)
Frontend: Next.js (App Router), Tailwind CSS. Constraint: Must be "Mobile-First" (thumb-friendly, no hover-states, native look).

Backend/Auth: Supabase (Postgres + PostGIS enabled).

AI Engine: Gemini 1.5 Flash (For high-speed, low-cost itinerary & quest generation).

APIs: - Google Places API (New) for venue data.

Google Routes API for "Scenic Path" navigation.

OpenWeather API for real-time "Pivot" logic.

3. Database Schema (SQL)
SQL
-- Enable Spatial Search
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles: Multi-Language & Gamification
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  vibe_points INT DEFAULT 0,
  preferred_lang TEXT DEFAULT 'en',
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues: The Lore Layer
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id TEXT UNIQUE,
  name TEXT,
  location geography(POINT),
  vibe_tags TEXT[], -- AI-extracted metadata
  is_sponsored BOOLEAN DEFAULT false,
  quest_data JSONB, -- Stores the "Side Quest" logic
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Adventures: The Session Tracker
CREATE TABLE adventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  mode TEXT CHECK (mode IN ('solo', 'duo', 'group')),
  status TEXT DEFAULT 'active',
  safety_timer_active BOOLEAN DEFAULT false,
  itinerary_json JSONB
);
4. Key Functional Requirements
A. The "Vibe Quiz" (Initial Onboarding)
A 5-step visual interface. Users select aesthetic imagery.

AI maps selections to a VibeProfile (e.g., "Cyberpunk + Quiet + High Energy").

B. The Quest Engine (LLM Logic)
Quest Generation: For every venue, Gemini must generate a "Side Quest."

Solo Quest: Observation-based (e.g., "Find the street art behind the cafe").

Group Quest: Interaction-based (e.g., "Everyone pick one drink for the person to their left").

Translation: Detect user language and serve Quests/Itineraries in that locale.

C. The "Safety Switch" (Optional)
A toggleable "Guardian Mode."

If active, the system starts a server-side timer.

If the user doesn't hit "I'm Safe" by timer_end, trigger a webhook to notify an emergency contact (Twilio SMS integration).

D. The Sponsorship Layer
In recommendation sorting, is_sponsored venues receive a priority "boost."

Sponsored venues feature "Premium Quests" (e.g., "Order the secret menu item for 2x Vibe Points").

5. UI/UX Style Guide
Visuals: Dark mode by default. High contrast. Large, tappable "Card" components.

Narrative: Use "RPG" language (e.g., "New Quest Available," "Raid Lobby Open," "Level Up Your Lore").

Real-Time: Use Supabase Realtime for the "Group Lobby" so friends see each other's swipes instantly.

6. Implementation Instructions for AI
Setup: Initialize Next.js and connect Supabase. Enable PostGIS.

Onboarding: Build the "Vibe Quiz" and save output to profiles.

Core Loop: Build a function that takes GPS + Vibe, fetches Google Places, filters via Gemini, and returns a 3-stop adventure.

Mobile Optimization: Ensure the app is PWA-ready (Progressive Web App) so it can be "installed" on a home screen without an app store.

Founder's Directive
"Build this as a professional-grade startup MVP. The code must be clean enough to be bundled into a native mobile app via Capacitor in the future. Prioritize User Experience and Narrative Flow over complex settings menus."