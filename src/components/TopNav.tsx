import Link from "next/link";
import { profileFromPath, profileHref } from "@/lib/profile";
import { hasPullPriority } from "@/lib/pull-priority";
import { hasSetlists } from "@/lib/setlists";
import { hasShiyu } from "@/lib/shiyu";
import { hasAssault } from "@/lib/assault";

// Shared dashboard header (wordmark + tab nav), used by every top-level view so the chrome is
// identical across the roster home and the per-profile sub-tabs. Pure/server-safe — `active`
// highlights the current tab, `base` keeps links in-profile. Teams/Shiyu render for profiles with
// that data (A.); Pulls renders for profiles with a pull-priority list (Cosmea).
type Tab = "agents" | "levels" | "teams" | "shiyu" | "assault" | "pulls";

export function TopNav({ base = "", active = "agents" }: { base?: string; active?: Tab }) {
  const { key } = profileFromPath(base || "/");
  const showTeams = hasSetlists(key);
  const showShiyu = hasShiyu(key);
  const showAssault = hasAssault(key);
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
        {showTeams ? (
          <Link className={cls("teams")} href={profileHref(base, "/teams/")}>
            Teams
          </Link>
        ) : (
          <a href="#">Teams</a>
        )}
        {showShiyu && (
          <Link className={cls("shiyu")} href={profileHref(base, "/shiyu/")}>
            Shiyu
          </Link>
        )}
        {showAssault && (
          <Link className={cls("assault")} href={profileHref(base, "/assault/")}>
            Assault
          </Link>
        )}
        {showPulls && (
          <Link className={cls("pulls")} href={profileHref(base, "/pulls/")}>
            Pulls
          </Link>
        )}
      </nav>
    </header>
  );
}
