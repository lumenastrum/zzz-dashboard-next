import Link from "next/link";
import { profileFromPath, profileHref } from "@/lib/profile";
import { hasPullPriority } from "@/lib/pull-priority";

// Shared dashboard header (wordmark + tab nav), used by every top-level view so the chrome is
// identical across the roster home and the per-profile sub-tabs. Pure/server-safe — `active`
// highlights the current tab, `base` keeps links in-profile. The Pulls tab only renders for
// profiles that actually have a pull-priority list (Courtney) — it's her-exclusive.
type Tab = "agents" | "levels" | "teams" | "pulls";

export function TopNav({ base = "", active = "agents" }: { base?: string; active?: Tab }) {
  const { key } = profileFromPath(base || "/");
  const showPulls = hasPullPriority(key);
  const cls = (t: Tab) => (t === active ? "on" : undefined);

  return (
    <header className="face">
      <div className="brand">
        <span className="led" />
        <div>
          <h1>
            Zenless <b>{"//"}</b> Soundsystem
          </h1>
          <div className="sub">New Eridu · Hi-Fi Proxy Deck</div>
        </div>
      </div>
      <nav className="tnav">
        <Link className={cls("agents")} href={profileHref(base, "/")}>
          Agents
        </Link>
        <a href="#">Levels</a>
        <a href="#">Teams</a>
        {showPulls && (
          <Link className={cls("pulls")} href={profileHref(base, "/pulls/")}>
            Pulls
          </Link>
        )}
      </nav>
    </header>
  );
}
