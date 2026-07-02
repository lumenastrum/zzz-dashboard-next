# ZZZ Soundsystem — raw data access for Couch-Clio

CLI hooks into Andres's ZZZ roster data. No screenshots, no squinting — curl the truth.
Written by Windows-Clio, 2026-07-01. 💅

## Where the truth lives

| Data | Source of truth | How to pull |
|---|---|---|
| Roster, discs, substats, W-engines, main stats | Supabase blob (`dashboard_profiles` table) | Supabase REST (below) or `npm run peek` |
| Shiyu Defense logs | In code: `src/lib/shiyu.ts` (editorial) | GH Pages JSON or `npm run peek -- shiyu` |
| Deadly Assault logs | In code: `src/lib/assault.ts` (editorial) | GH Pages JSON or `npm run peek -- assault` |

Profiles: **`andres-zzz`** (Andres) and **`wife-zzz`** (Courtney). The `andres` / `wife` rows in
the same table belong to the LEGACY dashboard — don't read those for current builds.

## 1. Supabase REST — roster/discs/stats, zero setup

Works from any shell with curl. The anon key is public by design (it ships in the site bundle).

```bash
# in bash (Mac) — set once per session
export ZZZ_URL="https://ayhrqkxdeecybjhmgdoq.supabase.co/rest/v1/dashboard_profiles"
export ZZZ_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aHJxa3hkZWVjeWJqaG1nZG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTI0NjcsImV4cCI6MjA5Mzg2ODQ2N30.GN-y9xEyNfQUVUXCqOGJC5cpN35X7B8PpOlFJPn10A8"

# full blob (agents incl. every disc + substat + rolls), newest truth
curl -s "$ZZZ_URL?profile=eq.andres-zzz&select=data,updated_at" -H "apikey: $ZZZ_KEY"

# agent names only
curl -s "$ZZZ_URL?profile=eq.andres-zzz&select=data" -H "apikey: $ZZZ_KEY" \
  | jq -r '.[0].data.agents[].name'

# one agent, complete (discs, subs, wengine, mainStats)
curl -s "$ZZZ_URL?profile=eq.andres-zzz&select=data" -H "apikey: $ZZZ_KEY" \
  | jq '.[0].data.agents[] | select(.name == "Miyabi")'

# just an agent's discs
curl -s "$ZZZ_URL?profile=eq.andres-zzz&select=data" -H "apikey: $ZZZ_KEY" \
  | jq '.[0].data.agents[] | select(.name == "Alice") | .discs.pieces'

# every profile row + freshness
curl -s "$ZZZ_URL?select=profile,updated_at" -H "apikey: $ZZZ_KEY" | jq .
```

PowerShell flavor (Windows sessions):

```powershell
# in PowerShell
$k = @{ apikey = "<anon key above>" }
(Invoke-RestMethod "https://ayhrqkxdeecybjhmgdoq.supabase.co/rest/v1/dashboard_profiles?profile=eq.andres-zzz&select=data,updated_at" -Headers $k).data.agents | Select-Object name, level, mindscape
```

## 2. GH Pages JSON — Shiyu + Deadly Assault, zero setup

Published by every deploy (`scripts/export-endgame.ts` runs as `prebuild`), keyed by profile,
shape `{ generated, profiles: { "andres-zzz": { cycles, history }, ... } }`:

```bash
curl -s https://lumenastrum.github.io/zzz-dashboard-next/data/shiyu.json   | jq '.profiles["andres-zzz"]'
curl -s https://lumenastrum.github.io/zzz-dashboard-next/data/assault.json | jq '.profiles["andres-zzz"].cycles[0]'
```

`cycles[0]` is always the current/marquee rotation; `history` is everything older, newest first.

## 3. `npm run peek` — the full CLI (needs the repo cloned)

Repo: `lumenastrum/zzz-dashboard-next`. Read-only; grades come from the same engine the site uses.

```bash
npm run peek                          # roster summary, graded (andres-zzz)
npm run peek -- roster --json         # raw agents array (everything)
npm run peek -- agent miyabi          # discs + substats + per-disc grades + stat sheet
npm run peek -- agent alice --json    # { agent, grade, stats } machine-readable
npm run peek -- shiyu                 # Shiyu cycles + history
npm run peek -- assault               # Deadly Assault cycles + history
npm run peek -- blob --json           # untouched Supabase row
npm run peek -- profiles              # all rows in dashboard_profiles
npm run peek -- roster --profile wife-zzz   # Courtney's view (any subcommand takes --profile)
```

## Schema cheat sheet

**Agent** (blob `data.agents[]`): `name`, `section` (Anomaly/Attack/Stun/Support/Rupture),
`attribute`, `rank` (S/A), `mindscape` ("M0"…"M6"), `level`, `wengine {name, rank, refine}`,
`discs.pieces[]`, `mainStats[]` (character-screen values), `relevant[]` (scaling stats),
`base{}` (derived hidden bases).

**DiscPiece**: `slot` (1–6), `set`, `level` (+0…+15), `main {stat, value}`,
`subs[] {stat, rolls, value?}` — `rolls` is ZZZ PropertyLevel, 1–6.

**Shiyu**: rating ladder B → A → S → S+ (S+ = season award: S in every room AND total ≥ 100,000).
Rooms log rating, boss, recommended/resistance attributes, clearing team (+bangboo), scores
(total = damage + elimination), clear time. `medal` is a house award, not in-game.

**Deadly Assault**: 3-minute score attacks vs a boss trio. Score = damage + performance
(perf caps at 5,000). Challenge Targets 6,000 / 14,000 / 20,000 award up to 3 pips per room,
9 per cycle. Rooms log boss, buff run (with wiki effect text), gimmick, team, scores, pips.
`medals {crown, shield}` are account-wide career tallies.

## Gotchas

- **wife-zzz mindscapes**: her blob inherited Andres's mindscape strings during seeding, but her
  account runs everything at M0 — the app forces M0 via `displayMindscape()`. Raw blob values for
  her are NOT trustworthy for mindscape; everything else is.
- **Zhao** (and any "identity only" agent) has no build in the blob — the roster identity lives in
  `src/lib/roster.ts`, not Supabase.
- **Read-only etiquette**: pull freely, but writes go through the app (or the seeded scripts) —
  the blob has no versioning, an errant upsert clobbers it. Local backups land in `/backups/`.
