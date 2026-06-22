"use client";

// Client hook — the live profile for the current route, derived from the URL. Split out of
// profile.ts so that module stays server-safe (usePathname is client-only and would otherwise
// taint every server component that imports the pure helpers). Only call in client components.
import { usePathname } from "next/navigation";
import { profileFromPath, type ProfileInfo } from "./profile";

export function useProfile(): ProfileInfo {
  return profileFromPath(usePathname());
}
