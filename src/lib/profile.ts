// Which roster/Supabase profile the current route is showing. Profile is a RUNTIME concern
// (which Supabase row the client fetches), derived from the URL — so a single static build
// serves both Andres (root) and his wife (/wife) off one Supabase project. No env, no rebuild.
//
// This module is PURE / server-safe (no React hooks) so server components — e.g. TopNav — can
// import it. The client-only `useProfile` hook lives in ./use-profile to avoid tainting this.
import { PROFILE_KEY, PROFILE_WIFE } from "./supabase";

export interface ProfileInfo {
  key: string; // dashboard_profiles.profile row key
  base: string; // app-path prefix for internal links ("" for the default view, "/wife" for wife)
  isWife: boolean;
}

// Map a Next app pathname (usePathname already strips basePath) to a profile. Everything under
// /wife is the wife profile; everything else is the default (Andres) view at the clean root.
export function profileFromPath(pathname: string | null | undefined): ProfileInfo {
  const isWife = !!pathname && (pathname === "/wife" || pathname.startsWith("/wife/"));
  return isWife
    ? { key: PROFILE_WIFE, base: "/wife", isWife: true }
    : { key: PROFILE_KEY, base: "", isWife: false };
}

// Prefix an app-internal path with the active profile's base. next/link applies basePath on
// top of this, so pass plain app paths here ("/", "/r/alice/"). Pure — safe in server code.
export function profileHref(base: string, path: string): string {
  if (!base) return path;
  if (path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
