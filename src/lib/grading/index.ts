// Single import surface for the grading engine + its config.
//   import { gradeBuild, computeStats, GRADING_CONFIG } from "@/lib/grading";
import cfgJson from "./grading-config.json";
import type { GradingConfig } from "@/lib/types";

export * from "./grading";
export const GRADING_CONFIG = cfgJson as unknown as GradingConfig;
