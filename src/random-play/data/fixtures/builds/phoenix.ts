// Phoenix — pulled day one 2026-10-20 (M0, signature R1). The generated detail carries discs, sheet and
// goals from the blob; skills/core are missing there because they come from the June Enka showcase, which
// predates her. Those two fields come from the in-game skills screen, 2026-10-20 (every skill really is Lv 1).
import type { BuildDetail } from "../../types";
import generated from "./generated.json";

export const phoenix: BuildDetail = {
  ...((generated.details as unknown as Record<string, BuildDetail>).phoenix),
  skillSource: "IN-GAME · 10/20",
  skills: [
    { name: "Basic Attack", level: 1, max: 12 }, { name: "Dodge", level: 1, max: 12 }, { name: "Assist", level: 1, max: 12 },
    { name: "Special Attack", level: 1, max: 12 }, { name: "Chain Attack", level: 1, max: 12 },
  ],
  core: ["A", "B", "C", "D", "E", "F"],
};
