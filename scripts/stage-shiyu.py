# Stage Shiyu Defense assets: circular per-agent "endgame" portraits + boss monster icons.
#
#   python scripts/stage-shiyu.py     (or: py scripts/stage-shiyu.py on Windows)
#
# Sources live OUTSIDE the repo (the Macbook Air Share design stash). Endgame portraits are the
# small circular agent crops shown on a Shiyu team; boss icons are the IconMonster_* splash crops.
# Converts to lossless WebP under public/assets/{endgame,bosses}/<slug>.webp. Idempotent.
#   - endgame slug = filename minus "endgame.png" (e.g. miyabiendgame.png -> miyabi), matches roster.
#   - boss slug    = "IconMonster_X.png" -> lowercase X (e.g. MiasmaNoranoSlime -> miasmanoranoslime).
import os
import glob
from PIL import Image

SRC = r"C:\Users\pined\Documents\Claude Space\Macbook Air Share\zzz-design-ideas"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENDGAME_DST = os.path.join(ROOT, "public", "assets", "endgame")
BOSS_DST = os.path.join(ROOT, "public", "assets", "bosses")
BOO_DST = os.path.join(ROOT, "public", "assets", "bangboo")

# Bangboo full-body sprites (the 4th team slot). Filenames are generic GarageRole ids -> friendly slug.
BANGBOO = {
    "BangbooGarageRole07.png": "sharkboo",
    "BangbooGarageRole43.png": "sprout",
    "BangbooGarageRole47.png": "ultrajet",
}


def save_webp(im, path):
    im.save(path, format="WEBP", lossless=True, quality=100, method=6)


def main():
    os.makedirs(ENDGAME_DST, exist_ok=True)
    os.makedirs(BOSS_DST, exist_ok=True)

    n = 0
    for path in sorted(glob.glob(os.path.join(SRC, "*endgame.png"))):
        slug = os.path.basename(path)[: -len("endgame.png")]
        im = Image.open(path).convert("RGBA")
        save_webp(im, os.path.join(ENDGAME_DST, f"{slug}.webp"))
        print(f"  endgame/{slug:14} {im.size[0]}x{im.size[1]}")
        n += 1
    print(f"[ok] staged {n} endgame portrait(s) -> {ENDGAME_DST}\n")

    b = 0
    for path in sorted(glob.glob(os.path.join(SRC, "IconMonster_*.png"))):
        slug = os.path.basename(path)[len("IconMonster_"):-len(".png")].lower()
        im = Image.open(path).convert("RGBA")
        save_webp(im, os.path.join(BOSS_DST, f"{slug}.webp"))
        print(f"  bosses/{slug:20} {im.size[0]}x{im.size[1]}")
        b += 1
    print(f"[ok] staged {b} boss icon(s) -> {BOSS_DST}\n")

    os.makedirs(BOO_DST, exist_ok=True)
    g = 0
    for fn, slug in BANGBOO.items():
        path = os.path.join(SRC, fn)
        if not os.path.exists(path):
            print(f"  [skip] missing {fn}")
            continue
        im = Image.open(path).convert("RGBA")
        save_webp(im, os.path.join(BOO_DST, f"{slug}.webp"))
        print(f"  bangboo/{slug:14} {im.size[0]}x{im.size[1]}")
        g += 1
    print(f"[ok] staged {g} bangboo(s) -> {BOO_DST}")


if __name__ == "__main__":
    main()
