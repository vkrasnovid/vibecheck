# VibeCheck.live

> **Paste text. See its emotional weather.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://platform.openai.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

---

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ⛈  VibeCheck.live                                    │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │  Paste your text here...                        │  │
│   │                                                 │  │
│   │                                  [Check Vibes] │  │
│   └─────────────────────────────────────────────────┘  │
│                                                         │
│  angry  toxic  passive-aggressive  anxious  love  chill │
│                                                         │
│   ════════════════════════════════ Intensity: 87%       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 😤 VIBE: ELECTRIC STORM                         │  │
│  │ Your text is radiating controlled fury with     │  │
│  │ hints of passive aggression...                  │  │
│  │ [Copy rewrite] [Share]                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## What It Does

VibeCheck analyzes any text — a message you're about to send, an email you received, a social media post — and reveals its true emotional weather. Paste your text, and watch the background transform into a living weather scene that mirrors the emotional energy of your words. Get a brutally honest vibe report before you hit send.

No fluff, no filter. Just the raw emotional truth of what your text is really saying.

---

## Features

- 🌩️ **6 Weather States** — Golden Sunrise (joy), Electric Neon (anxiety), Calm Ocean (peace), Cold Fog (detachment), Blood Moon (rage), Storm (conflict). Each with a unique animated background.
- ✨ **Word Particles** — Emotionally charged words float across the screen as animated Canvas2D particles, color-coded by emotion type.
- 🔪 **Brutally Honest Vibe Report** — AI-generated analysis that tells you exactly what emotional signals your text is sending, including red flag phrases and a suggested rewrite.
- 🔗 **Shareable Links** — Every analysis generates a unique URL you can share. Recipients see the same animated vibe when they open it.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion (UI transitions) |
| Particle Engine | Canvas2D (word particles + ambient FX) |
| AI | OpenAI GPT-4o-mini (JSON mode) |
| Deploy | Vercel (Edge Functions) |

---

## Quick Start

```bash
git clone https://github.com/vkrasnovid/vibecheck
cd vibecheck
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start checking vibes.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key. Get one at [platform.openai.com](https://platform.openai.com/api-keys). |

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=sk-...your_key_here...
```

---

## Deploy to Vercel

The fastest way to deploy VibeCheck is with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vkrasnovid/vibecheck)

**Manual deploy:**

```bash
npm install -g vercel
vercel
```

During setup, add `OPENAI_API_KEY` as an environment variable in your Vercel project settings.

**Recommended settings:**
- Framework: Next.js (auto-detected)
- Build command: `npm run build`
- Output directory: `.next`
- Environment variable: `OPENAI_API_KEY` → your key

The API route (`/api/analyze`) runs on Vercel Edge Functions for minimal cold-start latency.

---

## How It Works

1. **Input** — User pastes text (10–5,000 characters) into the hero textarea.

2. **Analysis** — A `POST /api/analyze` request sends the text to GPT-4o-mini with a structured prompt requesting JSON output: weather type, emotion breakdown, intensity score, key phrases, red flags, and a rewrite suggestion.

3. **State update** — The response populates a central `useReducer` state, triggering parallel UI updates:
   - `WeatherBackground` applies a CSS animated class matching the weather type (gradient + keyframe animations, GPU-accelerated)
   - `ParticleCanvas` spawns word particles on a Canvas2D layer — each keyword drifts, bounces softly at edges, and fades through a bell-curve opacity lifecycle
   - `VibeSidebar` slides in via Framer Motion with the full analysis

4. **Share** — The input text is Base64url-encoded into a query parameter (`?v=...`). Opening a share URL auto-triggers analysis. A `html2canvas` snapshot captures the animated UI for mobile share sheets.

5. **No database** — All state lives in the URL and client memory. Zero backend storage required.

---

## Project Structure

```
vibecheck/
├── app/
│   ├── page.tsx              # Main UI + share URL handling
│   ├── api/analyze/route.ts  # OpenAI API route (Edge)
│   └── share/[encoded]/      # SSR share page for OG previews
├── components/               # UI components (InputPanel, VibeSidebar, etc.)
├── hooks/                    # useVibeState, useParticleEngine, useWeatherTransition
├── lib/                      # OpenAI client, prompt builder, weather config, physics
└── types/vibecheck.ts        # Shared TypeScript types
```

---

## License

MIT
