# GitHub Wrapped

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Tests](https://img.shields.io/badge/tests-49_passing-brightgreen)

**Your year on GitHub, as a Spotify-Wrapped-style story you can share.**

Type any GitHub username and get a swipeable recap of their last year — total
contributions, longest streak, busiest month, top languages, a full contribution
heatmap, and a "developer persona" — ending in a share card built for link
previews.

<!-- TODO: replace with your deployed URL -->
### ▶ [Live demo](https://TODO.vercel.app)

<!-- TODO: record a 5s swipe-through, save as docs/demo.gif, uncomment -->
<!-- ![GitHub Wrapped walkthrough](docs/demo.gif) -->

---

## Highlights

- **One GraphQL request → a full recap.** A single call to GitHub's
  `contributionsCollection` feeds a pure `computeStats()` function that derives
  streaks, weekday/month breakdowns, language totals, and heatmap intensity
  levels — no client-side data massaging.
- **Story-format UI.** Full-screen gradient cards with keyboard, click, and
  swipe navigation, an Instagram-style progress bar, and a fade between cards.
- **Charts & heatmap.** Weekday and language breakdowns with Recharts; a
  GitHub-style 53-week contribution heatmap with month labels and a hover
  readout.
- **Developer persona.** A rule-based classifier turns the stats into a label —
  *The Streak Keeper*, *The Weekend Warrior*, *The Polyglot*, *The Sprinter*…
- **Dynamic Open Graph image.** `next/og` renders a per-user 1200×630 share card
  on the fly, so pasting a link into Slack / iMessage / X shows real stats
  instead of a generic logo.
- **Cached & rate-limited.** Results are cached in Redis (Upstash) with negative
  caching for unknown users; middleware rate-limits by IP so the GitHub token is
  never the bottleneck. Both degrade gracefully to a no-op when unconfigured.
- **Tested.** `computeStats`, the persona classifier, and the request helpers
  are covered by ~49 unit tests.

## How it works

```
/username  ──►  app/[login]/page.tsx
                   ├─ fetchWrapped(login, year)        lib/github.ts
                   │     └─ Redis cache → GitHub GraphQL API
                   ├─ computeStats(raw)                lib/wrapped.ts   (pure, tested)
                   ├─ classifyPersona(stats)           lib/persona.ts   (pure, tested)
                   └─ <Story> → buildCards()           components/story/

/username/opengraph-image  ──►  next/og ImageResponse   (same data, cached)

middleware.ts  ──►  @upstash/ratelimit  (per-IP, sliding window)
```

The interesting parts:

- **`computeStats` is pure and side-effect-free** — it takes the raw GraphQL
  payload and returns a plain object. That's what makes it trivially testable
  and reusable by both the page and the OG image route.
- **The heatmap reshapes, it doesn't refetch** — the weekly calendar already
  comes back from the same GraphQL call; the component just buckets days by
  weekday and pads the partial first/last weeks.
- **Everything external is optional** — no `GITHUB_TOKEN` still renders the UI
  shell; no Upstash vars just skips caching and rate limiting.

## Tech

| | |
|---|---|
| Framework | Next.js 16 (App Router, RSC) · React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 · shadcn/ui · Phosphor Icons |
| Charts | Recharts |
| Data | GitHub GraphQL API via Octokit |
| Cache / limiting | Upstash Redis · `@upstash/ratelimit` |
| Images | `next/og` (Satori) |
| Runtime / tests | Bun |

## Running locally

**Prerequisites:** [Bun](https://bun.sh) and a
[GitHub personal access token](https://github.com/settings/tokens) (classic,
no scopes needed — it only reads public data).

```bash
bun install
cp .env.example .env.local   # then fill in the values below
bun dev
```

`.env.local`:

```
GITHUB_TOKEN=ghp_your_token

# optional — enables caching + rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Open [localhost:3000](http://localhost:3000).

## Scripts

```bash
bun dev          # dev server
bun test         # unit tests
bun run typecheck
bun run lint
bun run build
```

## Notes & limitations

- **Public data only.** Private contributions would need an OAuth login flow —
  not implemented.
- **No commit timestamps.** GitHub's contribution calendar doesn't expose them,
  so there's no night-owl / early-bird stat.
- **Organizations aren't users.** `/vercel` resolves to "not found" — the
  `user(login:)` query only matches people.
- A user with no activity in the target year gets an empty recap, not an error.