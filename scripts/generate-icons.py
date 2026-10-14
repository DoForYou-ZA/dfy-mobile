#!/usr/bin/env python3
"""
Generates the DoForYou launcher icon artwork with the real "DFY." wordmark.

Usage (from the project root):
    pip install pillow
    python scripts/generate-icons.py path/to/SpecialElite-Regular.ttf

Download the font from https://fonts.google.com/specimen/Special+Elite

Writes into ./assets:
    icon.png           1024x1024, opaque cream background (iOS + general icon)
    adaptive-icon.png  1024x1024, transparent, logo kept inside the Android safe zone
    splash-blank.png   transparent (the native splash is plain cream; the animation
                       is drawn by AnimatedSplash)
    favicon.png        48x48
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

SIZE = 1024
CREAM = (255, 249, 242, 255)  # #FFF9F2
INK = (41, 35, 31, 255)       # #29231F
ORANGE = (255, 138, 0, 255)   # #FF8A00
TEXT = "DFY"


def draw_logo(img, font_path, width_ratio):
    """Draw 'DFY' + orange '.', centred, total width = width_ratio * canvas."""
    d = ImageDraw.Draw(img)
    probe = ImageFont.truetype(font_path, 200)
    probe_w = d.textlength(TEXT + ".", font=probe)
    size = max(10, int(200 * (SIZE * width_ratio) / probe_w))
    font = ImageFont.truetype(font_path, size)

    letters_w = d.textlength(TEXT, font=font)
    total_w = d.textlength(TEXT + ".", font=font)
    x0 = (SIZE - total_w) / 2

    # Centre vertically using the real glyph bounds (baseline anchor 'ls').
    left, top, right, bottom = d.textbbox((0, 0), TEXT + ".", font=font, anchor="ls")
    baseline = SIZE / 2 - (top + bottom) / 2

    d.text((x0, baseline), TEXT, font=font, fill=INK, anchor="ls")
    d.text((x0 + letters_w, baseline), ".", font=font, fill=ORANGE, anchor="ls")


def main():
    if len(sys.argv) != 2 or not os.path.isfile(sys.argv[1]):
        sys.exit(__doc__)
    font_path = sys.argv[1]
    os.makedirs("assets", exist_ok=True)

    # iOS / general icon: opaque, no alpha channel.
    icon = Image.new("RGBA", (SIZE, SIZE), CREAM)
    draw_logo(icon, font_path, 0.62)
    icon.convert("RGB").save("assets/icon.png")

    # Android adaptive foreground: only the centre ~66% is guaranteed visible
    # (circle masks), so the wordmark is kept to 56% of the canvas width.
    fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw_logo(fg, font_path, 0.56)
    fg.save("assets/adaptive-icon.png")

    Image.new("RGBA", (200, 200), (0, 0, 0, 0)).save("assets/splash-blank.png")
    icon.convert("RGB").resize((48, 48), Image.LANCZOS).save("assets/favicon.png")
    print("Wrote icon.png, adaptive-icon.png, splash-blank.png, favicon.png to ./assets")


if __name__ == "__main__":
    main()
