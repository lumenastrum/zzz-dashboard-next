// Mirrors `basePath` in next.config.ts. Plain <img> src + fetch() don't get
// Next's auto-prefixing, so any path landing there must be prefixed manually.
export const BASE_PATH = process.env.NODE_ENV === "production" ? "/zzz-dashboard-next" : "";

export function withBase(path: string): string {
  if (!path) return BASE_PATH;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
