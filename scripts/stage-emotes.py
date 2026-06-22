# Stage ZZZ agent chat-emote stickers into the app's public assets.
#
#   py scripts/stage-emotes.py
#
# Source PNGs live OUTSIDE the repo (the design-ideas stash); this copies + converts
# them to lossless WebP (alpha preserved, crisp sticker outlines) under
# public/assets/emotes/<slug>.webp. Idempotent — re-run as new emotes are seeded.
# Slug = the source filename minus the "_emote.png" suffix (e.g. dialyn_emote.png -> dialyn).
import os
import glob
from PIL import Image

SRC = r"C:\Users\pined\Documents\Claude Space\Gacha Dashboards\zzz-design-ideas\agent emotes"
DST = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "emotes")
DST = os.path.abspath(DST)


def main():
    os.makedirs(DST, exist_ok=True)
    n = 0
    for path in sorted(glob.glob(os.path.join(SRC, "*_emote.png"))):
        slug = os.path.basename(path).replace("_emote.png", "")
        im = Image.open(path).convert("RGBA")
        out = os.path.join(DST, f"{slug}.webp")
        im.save(out, format="WEBP", lossless=True, quality=100, method=6)
        print(f"  {slug:12} {im.size[0]}x{im.size[1]} -> {os.path.relpath(out, DST)}")
        n += 1
    print(f"\n[ok] staged {n} emote(s) -> {DST}")


if __name__ == "__main__":
    main()
