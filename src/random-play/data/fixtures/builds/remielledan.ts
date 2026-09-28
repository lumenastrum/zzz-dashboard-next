// Remielle Dan — the reference build for every deep panel (Specs, Scenes, Chapters).
// Sources are labelled per field because they DISAGREE on purpose-worthy details:
//   sheet  → in-game character screen, 2026-09-27 (A.'s screenshots)
//   discs  → dashboard blob via `npm run peek -- agent remielledan` (last Enka import; the blob's own
//            sheet is stale vs in-game — ATK 3,843/AP 355/DEF 915/CR 29% — re-import pending)
//   skills → in-game skills screen, 2026-09-27 (Dodge really is Lv 1)
//   goals  → zzz-dashboard-next src/lib/grading/grading-config.json ("Remielle Dan".targets)
import type { BuildDetail } from "../../types";

export const remielledan: BuildDetail = {
  slug: "remielledan",
  sheetSource: "IN-GAME · 09/27",
  sheet: [
    { stat: "HP", value: "10,692" }, { stat: "ATK", value: "4,078" }, { stat: "DEF", value: "784" },
    { stat: "Impact", value: "83" }, { stat: "CRIT Rate", value: "26.6%" }, { stat: "CRIT DMG", value: "64.4%" },
    { stat: "Anomaly Mastery", value: "115" }, { stat: "Anomaly Proficiency", value: "409" },
    { stat: "PEN Ratio", value: "0%" }, { stat: "Energy Regen", value: "1.2" },
  ],
  discSource: "DASHBOARD BLOB · LAST IMPORT",
  weakestSlot: 4,
  discs: [
    { slot: 1, set: "Feathered Fate", grade: "C", pct: 50.7, main: { stat: "HP", value: "2,200" },
      subs: [{ stat: "Anomaly Proficiency", rolls: 2, relevant: true }, { stat: "CRIT Rate", rolls: 4, relevant: false }, { stat: "HP%", rolls: 1, relevant: false }, { stat: "ATK%", rolls: 1, relevant: true }] },
    { slot: 2, set: "Astral Voice", grade: "S", pct: 83.6, main: { stat: "ATK", value: "316" },
      subs: [{ stat: "ATK%", rolls: 4, relevant: true }, { stat: "CRIT Rate", rolls: 1, relevant: false }, { stat: "Anomaly Proficiency", rolls: 2, relevant: true }, { stat: "CRIT DMG", rolls: 2, relevant: false }] },
    { slot: 3, set: "Feathered Fate", grade: "A", pct: 71.2, main: { stat: "DEF", value: "184" },
      subs: [{ stat: "Anomaly Proficiency", rolls: 3, relevant: true }, { stat: "HP%", rolls: 2, relevant: false }, { stat: "HP", rolls: 1, relevant: false }, { stat: "ATK%", rolls: 2, relevant: true }] },
    { slot: 4, set: "Astral Voice", grade: "C", pct: 47.4, main: { stat: "Anomaly Prof.", value: "92" },
      subs: [{ stat: "ATK", rolls: 2, relevant: false }, { stat: "CRIT Rate", rolls: 3, relevant: false }, { stat: "ATK%", rolls: 2, relevant: true }, { stat: "PEN", rolls: 2, relevant: false }] },
    { slot: 5, set: "Feathered Fate", grade: "B", pct: 64.9, main: { stat: "ATK%", value: "30%" },
      subs: [{ stat: "Anomaly Proficiency", rolls: 2, relevant: true }, { stat: "PEN", rolls: 2, relevant: false }, { stat: "HP", rolls: 2, relevant: false }, { stat: "ATK%", rolls: 2, relevant: true }] },
    { slot: 6, set: "Feathered Fate", grade: "B", pct: 61.6, main: { stat: "ATK%", value: "30%" },
      subs: [{ stat: "CRIT DMG", rolls: 1, relevant: false }, { stat: "CRIT Rate", rolls: 1, relevant: false }, { stat: "ATK", rolls: 2, relevant: false }, { stat: "Anomaly Proficiency", rolls: 4, relevant: true }] },
  ],
  skillSource: "IN-GAME · 09/27",
  skills: [
    { name: "Basic Attack", level: 12, max: 12 }, { name: "Dodge", level: 1, max: 12 }, { name: "Assist", level: 12, max: 12 },
    { name: "Special Attack", level: 12, max: 12 }, { name: "Chain Attack", level: 12, max: 12 },
  ],
  core: ["A", "B", "C", "D", "E", "F"],
  goals: [
    { stat: "ATK", value: 4078, target: 4000, full: 4300, min: 3200, max: 4500, targetLabel: "4,000 BREAKPOINT", fullLabel: "4,300 FULL",
      note: "Past 4,000, so her +1,600 squad ATK buff is maxed. 222 more to full marks." },
    { stat: "Anomaly Proficiency", value: 409, target: 370, full: 460, min: 300, max: 480, targetLabel: "370 TARGET", fullLabel: "460 FULL",
      note: "Feeds Refringe (0.02%/pt) and Luminize (0.2%/pt). 51 short of full." },
  ],
  engineBuffs: ["+20% Anomaly DMG on Refringe (30s)", "Squad DMG +30% on Refringe (30s)"],
  setBonus: { sets: [{ name: "Feathered Fate", pieces: 4 }, { name: "Astral Voice", pieces: 2 }], note: "4pc: +15% Attribute Anomaly DMG (Lumiflux equipper only)" },
  ratingLine: "Contains one weak disc (Scene 04, C). Strong ATK%.",
};
