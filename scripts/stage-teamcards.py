# Stage the diagonal team-shell agent cards into the app's public assets.
#
#   python scripts/stage-teamcards.py     (or: py scripts/stage-teamcards.py on Windows)
#
# Source PNGs live OUTSIDE the repo (the Macbook Air Share design stash): glossy diagonal
# face crops with transparent backgrounds, one per agent, named "<agent>team.png". This copies
# + converts them to lossless WebP under public/assets/teamcards/<slug>.webp, and NORMALIZES
# every card onto a uniform 256x250 transparent canvas (centered) so the Teams "Setlist" cards
# render at identical sizes regardless of each source crop's width. Idempotent — re-run as new
# shells are added. Slug = the ROSTER slug (so it matches /assets/tall + /r/<slug>), which is why
# two filenames are remapped: yeshenguang->yeshunguang (source typo), astrayao->astra (roster slug).
import os
from PIL import Image

SRC = r"C:\Users\pined\Documents\Claude Space\Macbook Air Share\zzz-design-ideas"
DST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "teamcards"))

# source filename -> roster slug (some filenames are remapped: source typos / roster-slug differences)
CARDS = {
    "miyabiteam.png": "miyabi",
    "nangongyuteam.png": "nangongyu",
    "astrayaoteam.png": "astra",            # roster slug is "astra", not "astrayao"
    "yeshenguangteam.png": "yeshunguang",   # source filename typo -> canonical slug
    "dialynteam.png": "dialyn",
    "sunnateam.png": "sunna",
    "yixuanteam.png": "yixuan",
    "jufufuteam.png": "jufufu",
    "luciateam.png": "lucia",
    "evelynteam.png": "evelyn",
    "aliceteam.png": "alice",
    "vivianteam.png": "vivian",
    "yuzuhateam.png": "yuzuha",
    "janedoeteam.png": "janedoe",
    "ariateam.png": "aria",
    "yidhariteam.png": "yidhari",
    "seedteam.png": "seed",
    "cissiateam.png": "cissia",
    "triggerteam.png": "trigger",
    "soldier0anbyteam.png": "soldier0anby",
    "ligherteam.png": "lighter",            # source filename typo -> canonical slug
    "velinateam.png": "velina",
    "burniceteam.png": "burnice",           # cut later than the rest (2026-07, for the Shiyu marquee)
}

CW, CH = 256, 250  # uniform card canvas (all sources are 250 tall, <=255 wide)

# Mode-switch toggle buttons for the Recent Benchmarks sidebar (the in-game pill switch: knob
# left = Shiyu, knob right = Deadly Assault). Copied as-is into public/assets/ui/.
UIDST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "ui"))
SWITCHES = {
    "EasySwitchBtn.png": "switch-shiyu",  # knob left
    "HardSwitchBtn.png": "switch-da",      # knob right
}


def main():
    os.makedirs(DST, exist_ok=True)
    n = 0
    for fn, slug in CARDS.items():
        path = os.path.join(SRC, fn)
        if not os.path.exists(path):
            print(f"  [skip] missing {fn}")
            continue
        im = Image.open(path).convert("RGBA")
        w, h = im.size
        canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        x = (CW - w) // 2
        y = (CH - h) // 2
        canvas.paste(im, (x, y), im)
        out = os.path.join(DST, f"{slug}.webp")
        canvas.save(out, format="WEBP", lossless=True, quality=100, method=6)
        print(f"  {slug:14} {w}x{h} -> {CW}x{CH}  ({os.path.basename(out)})")
        n += 1
    print(f"\n[ok] staged {n} team card(s) -> {DST}")

    os.makedirs(UIDST, exist_ok=True)
    for fn, slug in SWITCHES.items():
        path = os.path.join(SRC, fn)
        if not os.path.exists(path):
            print(f"  [skip] missing {fn}")
            continue
        im = Image.open(path).convert("RGBA")
        im.save(os.path.join(UIDST, f"{slug}.webp"), format="WEBP", lossless=True, quality=100, method=6)
        print(f"  ui/{slug:12} {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    main()
