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
import shutil
from PIL import Image

SRC = r"C:\Users\pined\Documents\Claude Space\Macbook Air Share\zzz-design-ideas"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENDGAME_DST = os.path.join(ROOT, "public", "assets", "endgame")
BOSS_DST = os.path.join(ROOT, "public", "assets", "bosses")
BOO_DST = os.path.join(ROOT, "public", "assets", "bangboo")
ENEMY_DST = os.path.join(ROOT, "public", "assets", "enemies")
UI_DST = os.path.join(ROOT, "public", "assets", "ui")

# Bangboo full-body sprites (the 4th team slot). Filenames are generic GarageRole ids -> friendly slug.
BANGBOO = {
    "BangbooGarageRole07.png": "sharkboo",
    "BangbooGarageRole43.png": "sprout",
    "BangbooGarageRole47.png": "ultrajet",
}

# Full-body enemy renders (transparent, ~484x668) for the marquee room cards, keyed by the
# ShiyuBoss slug they render. Already .webp in the stash -> straight copy (no recompress).
# NB: the wiki files Norano Slime under "Miasmic Doppelganger Komano Manato" — same beast,
# the game's assets flip-flop on the name (Andres-confirmed canon).
ENEMIES = {
    "Enemy_Miasmic_Doppelganger_Komano_Manato.webp": "miasmanoranoslime",
    "Enemy_Sacrifice_-_Covenant_Guardian.webp": "covenantguardian",
    "Enemy_Miasmic_-_Doppelganger_-_Isolde.webp": "miasmaisoldeslime",
}

# Season chrome: the in-game Shiyu Defense badge + the five season rank medals. The medal is OUR
# house award on a cycle (the game doesn't medal Shiyu rank) -> ShiyuCycle.medal picks one.
UI = {
    "ShiyuLogo.png": "shiyu-logo",
    "RankIcon02.png": "medal-silver",
    "RankIcon03.png": "medal-gold",
    "RankIcon04.png": "medal-diamond",
    "RankIcon05.png": "medal-master",
    "RankIcon06.png": "medal-legend",
}


def save_webp(im, path):
    im.save(path, format="WEBP", lossless=True, quality=100, method=6)


# Zhao has NO stash circle (buildless, never got endgame art cut) but appears in clear-history
# teams, so synthesize his 142px circle from the tall roster portrait. Face box hand-tuned
# (the measured portrait-frame center misses — he's posed off-axis, face lower-left).
# A real zhaoendgame.png landing in the stash takes precedence (globbed + staged after this).
ZHAO_FACE = (560, 470, 300)  # center x, center y, square side — in tall/zhao.webp pixels


def synth_zhao(tall_path, dst):
    from PIL import ImageDraw
    im = Image.open(tall_path).convert("RGBA")
    cx, cy, side = ZHAO_FACE
    c = im.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)).resize((142, 142), Image.LANCZOS)
    mask = Image.new("L", c.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, c.size[0] - 1, c.size[1] - 1), fill=255)
    c.putalpha(mask)
    save_webp(c, dst)


def main():
    os.makedirs(ENDGAME_DST, exist_ok=True)
    os.makedirs(BOSS_DST, exist_ok=True)

    n = 0
    staged = set()
    for path in sorted(glob.glob(os.path.join(SRC, "*endgame.png"))):
        slug = os.path.basename(path)[: -len("endgame.png")]
        im = Image.open(path).convert("RGBA")
        save_webp(im, os.path.join(ENDGAME_DST, f"{slug}.webp"))
        print(f"  endgame/{slug:14} {im.size[0]}x{im.size[1]}")
        staged.add(slug)
        n += 1
    tall_zhao = os.path.join(ROOT, "public", "assets", "tall", "zhao.webp")
    if "zhao" not in staged and os.path.exists(tall_zhao):
        synth_zhao(tall_zhao, os.path.join(ENDGAME_DST, "zhao.webp"))
        print("  endgame/zhao           142x142 (synthesized from tall portrait)")
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
    print(f"[ok] staged {g} bangboo(s) -> {BOO_DST}\n")

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
