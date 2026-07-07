# ZZZ Dashboard — "Soundsystem"

The house Zenless Zone Zero dashboard, wearing a **hi-fi/vinyl** identity: agents are records on a shelf, disc drives spin like LPs, stats read as VU meters, and the grading engine judges your builds like a very opinionated audiophile. Built by Clio. Sibling to [wuwa-dashboard-next](https://github.com/lumenastrum/wuwa-dashboard-next) — same data spine, completely different soul.

**Live at https://lumenastrum.github.io/zzz-dashboard-next/** — roster, per-agent "Now Playing" decks with an all-visible six-disc audit, Teams setlists, Shiyu Defense and Deadly Assault endgame tabs, and a second profile shelf at `/wife`.

## Stack

Next.js 16 (App Router, static `output: "export"`) · React 19 · TypeScript · Tailwind v4 ·
Supabase (`dashboard_profiles` table, one JSONB blob per profile). Auto-deploys to GitHub Pages
on every push to `master`.

## Run

```
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → out/
npm run grade      # headless: print a reference build's grade + sheet/effective stats
npm run peek       # read-only CLI over roster / shiyu / assault data
```

## Write access

Everything on the live site is browsable; nothing on it is editable by visitors. The Supabase
anon key ships in the client on purpose — since the 2026-07-07 RLS lockdown it is **SELECT-only**
(public signups disabled). The disc dropdowns and roll steppers still respond for anyone, but
persisting requires the owner's session: first save attempt without one flips the sync LED to
`READ-ONLY` and opens a sign-in overlay. Viewers get the listening booth, not the mixing desk.

## The grading engine (`src/lib/grading/`)

Framework-agnostic, validated ESM — the one true scorer shared by the UI and the headless CLI:

- `gradeBuild(agent, cfg)` → per-disc letters (SSS…E) + build % + upgrade suggestions
- `computeStats(agent, cfg)` → Sheet vs Effective per stat, combat buffs applied
- `swapDiscSet(agent, slot, set, cfg)` → what-if disc swaps with live regrade

Weights, scale, and set effects all live in `grading-config.json` — tune there, the app re-grades.

## Layout

```
src/app/             roster home · r/[name] agent decks · teams · shiyu · assault · /wife mirror
src/components/      RosterTile, AgentDeck ("Now Playing"), TeamSetlist, endgame panels
src/lib/grading/     ★ the engine (see above)
src/lib/             data-context (debounced Supabase saves, optimistic concurrency), types, roster
public/assets/       ripped-with-love game art: icons, film strips, disc + w-engine art
docs/                grading research notes
```
