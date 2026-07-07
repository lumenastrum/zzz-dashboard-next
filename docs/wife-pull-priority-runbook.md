# Cosmea's Pull Priority — update runbook

The **Pulls** tab on her side (`/wife/pulls`) is her ranked "what to convene next" wishlist. It's
**her-exclusive** (A.'s view has no Pulls tab) and it's **editorial data in code**, not Supabase —
so updating it is an edit + a rebuild, nothing live to sync.

> One-line mental model: *a pull pick is worth ranking by how it slots into the teams she ALREADY runs,
> not by how strong it is in a vacuum.* A T0 unit that fights her cores ranks low (see Velina); a
> "strong-not-broken" unit that drops into her finished comps ranks high (see Norma).

---

## Where everything lives

| Thing | Path |
|---|---|
| The ranked list (the data) | `src/lib/pull-priority.ts` → `WIFE_PULL_PRIORITY` |
| The crate card UI | `src/components/PullCrate.tsx` |
| The page + grid | `src/app/wife/pulls/page.tsx` |
| Crate styling | `src/app/globals.css` (search `wishlist crates`) |
| Emote stickers | `public/assets/emotes/<slug>.webp` |
| Emote staging script | `scripts/stage-emotes.py` |
| Emote source PNGs (outside repo) | `Gacha Dashboards/zzz-design-ideas/agent emotes/<slug>_emote.png` |
| Who gets the tab | `pullPriorityFor()` / `hasPullPriority()` in `pull-priority.ts` (keyed `wife-zzz`) |

---

## The `PullRec` shape

```ts
{
  rank: 5,                       // 1 = pull first. Renumber the whole list after inserting.
  name: "Norma",                 // display name
  section: "Stun",              // ZZZ specialty — card subtitle + type icon
  attribute: "Fire",            // ZZZ element — drives the crate's element accent (--ec)
  priority: "High · Upcoming",  // the badge wording (free text)
  tier: 4,                       // 1–5 → VU meter fill + heat color (see table below)
  emotes: ["norma"],            // emote slug(s); 2 slugs = dual cover (e.g. ["lycaon","soukaku"])
  why: "...",                    // the liner-notes paragraph (flip side)
  team: "...",                   // the teams she'd run it in (flip side)
  upcoming: true,                // OPTIONAL — unreleased: dashed border + "◷ Upcoming" pill + eta line
  eta: "v3.0 Ph.2 · ~Jul 2026", // OPTIONAL — shown only when upcoming
  leak: true,                    // OPTIONAL — adds a "leak" tag to the eta line
}
```

### tier → meter / heat color

| tier | meter | heat color | use for |
|---|---|---|---|
| 5 | ▮▮▮▮▮ | red | must-pull, account-defining |
| 4 | ▮▮▮▮▯ | amber | very high / high |
| 3 | ▮▮▮▯▯ | yellow | medium-high / medium |
| 2 | ▮▮▯▯▯ | steel blue | medium-low / low / off-archetype |
| 1 | ▮▯▯▯▯ | dim | lowest current need / skip |

`tier` is the visual; `priority` is the words. Keep them roughly agreeing but `priority` can be more
specific ("Low · Off-archetype", "High · Upcoming").

---

## Adding / re-ranking a pick (the normal case)

1. **Research the unit** (see below) and decide its **fit for HER roster**, not its raw power.
2. **Stage the emote** if it's a new agent:
   - Drop `<slug>_emote.png` into `Gacha Dashboards/zzz-design-ideas/agent emotes/` (transparent PNG).
   - Run `py scripts/stage-emotes.py` (PowerShell) → it converts every emote to `public/assets/emotes/<slug>.webp`.
   - The crate self-hides a missing emote (no 404 box), but then it's just a blank cover — stage it.
3. **Edit `WIFE_PULL_PRIORITY`** in `src/lib/pull-priority.ts`: insert the entry, then **renumber every
   `rank:` so they run 1..N with no gaps** (the page renders in array order; rank is the printed number).
4. **Build + verify**:
   ```
   npm run build            # in PowerShell — must be TS/lint clean
   npx next dev -p 3210     # then open http://localhost:3210/wife/pulls/
   ```
   Eyeball: emote loads, meter fill matches tier, flip shows the why/team, count says "N On The Wishlist".
5. Commit. (No Supabase write — it's all static.)

---

## Researching a pick — the method

**Division of labor** (our standing rule): A. = Prydwen manual; Clio = r/mains megathreads;
chibi-Clio subagents = **WebFetch/WebSearch only, NEVER camoufox** (it's solo-only and dogpiles).

**Released / current-meta units** — Prydwen + Game8 + a recent tier list. Pull: element/type/faction,
the core kit mechanic, the canonical teams, and meta standing. Then the important part: **map it onto
her owned agents** (roster lives in `src/lib/roster.ts`, her slice is `PROFILE_ROSTER["wife-zzz"]`).
Ask: does it *enable a team she already fields*, or does it need a piece she doesn't own / fight a core
she's built? Example — **Velina** is T0 but her Wind *Vortex overrides Disorder*, which is the engine
Alice/Miyabi/Yanagi/Vivian run on → ranked **Low · Off-archetype** despite the raw power.

**Upcoming / leaked units** — you'll need leak/beta sources: Prydwen beta pages, `hakush.in/zzz` beta
data, `r/ZZZLeaksAndInfo`, and recent leak writeups on Game8 / Icy-Veins / zzz.gg. Treat numbers as
**provisional**. Set `upcoming: true`, fill `eta` (patch + rough month), and set `leak: true` so the card
shows the disclaimer tag. Example — **Norma** (v3.0 Ph.2, ~Jul 2026) drops into her Yixuan/Yidhari Rupture
and Ye Shunguang/Cissia Attack lanes with every support already owned → **High · Upcoming**, tempered by
overlapping Ju Fufu + being beta.

If a site blocks a plain fetch, retry it via the Jina proxy: `https://r.jina.ai/<full-url>`.

**Quick prompt to hand a research subagent** (paste her roster + this ask):
> "Assess ZZZ agent <NAME> as a pull priority for THIS roster: <paste PROFILE_ROSTER + sections>.
> WebFetch/WebSearch only, no camoufox. Return: element/type/faction, kit summary, intended teams,
> **fit for her specific owned agents** (synergy/anti-synergy), meta standing, and a High/Med/Low verdict
> with justification grounded in her roster. For leaks, flag uncertainty + expected patch."

---

## When her roster changes

The recs are relative to what she owns. After she pulls a new unit (or you re-seed her roster), **re-read
the existing `why`/`team` lines** — a pick's reasoning often references "she already has X." If she now
owns X, the rec may move down or drop. Pull-priority is a living list; it's worth a pass each patch.

## Gotchas

- **Renumber after inserting.** `rank` is the printed number; the array order is what renders. Gaps look broken.
- **Every rec needs a staged emote** or the cover is blank (it won't error, just looks empty).
- **`section` first word drives the type icon** — for a dual like "Stun · Support" the icon uses "Stun".
  If a section has no `type_<slug>.webp` icon, that chip self-hides.
- **The tab only appears for profiles in `BY_PROFILE`** (`pull-priority.ts`). Adding another profile's list
  there lights up its Pulls tab automatically.
