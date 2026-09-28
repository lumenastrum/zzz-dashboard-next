// Every agent's BuildDetail: generated from the dashboard's sources (scripts/build-details.ts →
// generated.json), with hand-built fixtures winning where they carry fresher in-game truth.
import type { BuildDetail } from "../../types";
import generated from "./generated.json";
import { remielledan } from "./remielledan";

export const BUILD_DETAILS: Record<string, BuildDetail> = {
  ...(generated.details as unknown as Record<string, BuildDetail>),
  remielledan,
};
