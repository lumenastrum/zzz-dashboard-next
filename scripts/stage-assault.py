# Stage Deadly Assault assets: mode chrome + full-body boss renders for the /assault tab.
#
#   python scripts/stage-assault.py     (or: py scripts/stage-assault.py on Windows)
#
# Sources live OUTSIDE the repo (the Macbook Air Share design stash). Idempotent, same
# conventions as stage-shiyu.py: PNGs -> lossless WebP, stash .webp renders -> straight copy.
# NB: the two career-medal badges (ui/da-medal-*.webp) are NOT staged here — they were
# hand-cropped from Andres's 2026-06 result screenshot (no clean asset in the stash yet);
# a real IconMedal_*.png landing in the stash should take over this job.
import os
import glob
import shutil
from PIL import Image

SRC = r"C:\Users\pined\Documents\Claude Space\Macbook Air Share\zzz-design-ideas"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENEMY_DST = os.path.join(ROOT, "public", "assets", "enemies")
UI_DST = os.path.join(ROOT, "public", "assets", "ui")

# Full-body enemy renders (transparent, 484x668 — same spec as the Shiyu set) for the room
# posters, keyed by the AssaultBoss slug they render. Already .webp -> straight copy.
ENEMIES = {
    "Enemy_Girtablullu.webp": "girtablullu",
    "Enemy_Notorious_-_Marionette.webp": "notoriousmarionette",
    "Enemy_Ye_Shiyuan_the_Thrall.webp": "yeshiyuanthethrall",
}

# Mode chrome: the in-game Deadly Assault wordmark (black-on-transparent, ghosted via invert
# like the Shiyu badge) + the challenge-goal pip (each room grants up to 3).
UI = {
    "IconDeadly.png": "da-logo",
    "IconChallengeGoal.png": "da-pip",
}


def save_webp(im, path):
    im.save(path, format="WEBP", lossless=True, quality=100, method=6)


def main():
    os.makedirs(ENEMY_DST, exist_ok=True)
    e = 0
    for fn, slug in ENEMIES.items():
        path = os.path.join(SRC, fn)
        if not os.path.exists(path):
            print(f"  [skip] missing {fn}")
            continue
        shutil.copyfile(path, os.path.join(ENEMY_DST, f"{slug}.webp"))
        print(f"  enemies/{slug:20} <- {fn}")
        e += 1
    print(f"[ok] staged {e} enemy render(s) -> {ENEMY_DST}\n")

    os.makedirs(UI_DST, exist_ok=True)
    u = 0
    for fn, name in UI.items():
        path = os.path.join(SRC, fn)
        if not os.path.exists(path):
            print(f"  [skip] missing {fn}")
            continue
        im = Image.open(path).convert("RGBA")
        save_webp(im, os.path.join(UI_DST, f"{name}.webp"))
        print(f"  ui/{name:16} {im.size[0]}x{im.size[1]}")
        u += 1
    print(f"[ok] staged {u} ui asset(s) -> {UI_DST}")


if __name__ == "__main__":
    main()
