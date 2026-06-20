# ZZZ Dashboard — "Soundsystem" (Next.js)

Ground-up redesign of Andres's Zenless Zone Zero roster/stat dashboard. New Eridu **hi-fi/vinyl**
identity: disc drives are records, the equipment screen is a speaker stack, stats read as VU meters.
Sibling to `wuwa-dashboard-next`; the legacy vanilla `zzz-dashboard` repo stays separate and untouched.

## Stack
Next.js 16 (App Router, static `output: "export"`) · React 19 · TypeScript · Tailwind v4 ·
Supabase (`dashboard_profiles`, profile `andres-zzz`). Matches the WuWa next dashboard conventions.

## Run
```
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → out/
npm run grade      # headless: print Alice's grade + sheet/effective (tsx)
```

## Layout
```
src/app/            layout + roster home + r/[name] agent route
src/components/      RosterTile (album tile) … deck components port next
src/lib/
  grading/           ★ the engine — gradeBuild / computeStats / swapDiscSet (framework-agnostic ESM)
    grading.js         validated engine (shared with the prototype)
    grading-config.json  archetype weights, SSS…E scale, rollValues, setEffects
    grading.d.ts / index.ts   typed surface
  types.ts           Agent / DiscPiece / EffectMod schema
  roster.ts          seed roster + Alice reference build
  supabase.ts        client + profile keys (andres-zzz / wife-zzz)
  base-path.ts       GH Pages prefix helper
public/assets/       icons, equipment frame, disc/w-engine art, portraits
docs/                interknot grading research
HANDOFF.md           full status + next steps (read this first)
```

## Status
Scaffold + engine integration done; roster home + a build-time-graded agent route render. The full
interactive **"Now Playing" deck** (editable hex frame, VU meters, sheet/effective) lives in the
prototype at `Claude Space/zzz-redesign-mockups/c-soundsystem.html` and ports into components next.
See `HANDOFF.md`.
