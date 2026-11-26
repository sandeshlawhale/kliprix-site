"""Builds the link-preview image and the app icons in site/public.

    python scripts/make-share-image.py      (from the site folder; needs Pillow)

Outputs:
  public/og.jpg               1200x630, shown by WhatsApp, LinkedIn, X, Slack, Discord, ...
  public/apple-touch-icon.png 180x180, iPhone home screen
  public/icon-192.png, public/icon-512.png  for the web manifest

Run it again after replacing the clips in public/media, so the preview shows the new ones.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

SITE = Path(__file__).resolve().parent.parent
PUBLIC = SITE / "public"
FONT = SITE / "scripts" / "assets" / "Montserrat-ExtraBold.ttf"

BG = (8, 8, 11)
BRAND = (255, 210, 63)
BRAND_2 = (255, 138, 61)
VIOLET = (139, 123, 255)
TEXT = (244, 244, 246)
MUTED = (154, 154, 166)
W, H = 1200, 630


def glow(size: tuple[int, int], center: tuple[int, int], radius: int, color, alpha: int):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = center
    d.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.55))


def logo_mark(size: int) -> Image.Image:
    """The K mark from icons.tsx: a yellow-orange rounded square with a dark K."""
    s = 4  # draw large, then shrink for smooth edges
    big = size * s
    grad = Image.new("RGB", (big, big))
    gd = ImageDraw.Draw(grad)
    for i in range(big * 2):
        t = i / (big * 2)
        c = tuple(int(BRAND[k] + (BRAND_2[k] - BRAND[k]) * t) for k in range(3))
        gd.line([(i, 0), (0, i)], fill=c, width=2)
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, big - 1, big - 1), radius=big * 9 // 32, fill=255)
    mark = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    mark.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(mark)
    u = big / 32
    w = round(3.6 * u)
    d.line([(11 * u, 8.5 * u), (11 * u, 23.5 * u)], fill=(17, 17, 17), width=w)
    d.line([(21.5 * u, 8.5 * u), (13.6 * u, 16 * u), (21.5 * u, 23.5 * u)], fill=(17, 17, 17), width=w, joint="curve")
    for p in [(11 * u, 8.5 * u), (11 * u, 23.5 * u), (21.5 * u, 8.5 * u), (21.5 * u, 23.5 * u)]:
        r = w / 2
        d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=(17, 17, 17))
    return mark.resize((size, size), Image.LANCZOS)


def phone(path: Path, width: int) -> Image.Image:
    """A 9:16 clip thumbnail with rounded corners and a thin light border."""
    height = width * 16 // 9
    img = Image.open(path).convert("RGB")
    scale = max(width / img.width, height / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left, top = (img.width - width) // 2, (img.height - height) // 2
    img = img.crop((left, top, left + width, top + height))
    radius = width // 11
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width - 1, height - 1), radius=radius, fill=255)
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    ImageDraw.Draw(out).rounded_rectangle(
        (0, 0, width - 1, height - 1), radius=radius, outline=(255, 255, 255, 60), width=2
    )
    return out


def place(canvas: Image.Image, card: Image.Image, center: tuple[int, int], angle: float, opacity=1.0):
    rotated = card.rotate(angle, resample=Image.BICUBIC, expand=True)
    shadow = Image.new("RGBA", rotated.size, (0, 0, 0, 0))
    shadow.putalpha(rotated.getchannel("A").point(lambda a: int(a * 0.75)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    x = center[0] - rotated.width // 2
    y = center[1] - rotated.height // 2
    canvas.alpha_composite(shadow, (x, y + 24))
    if opacity < 1:
        rotated.putalpha(rotated.getchannel("A").point(lambda a: int(a * opacity)))
    canvas.alpha_composite(rotated, (x, y))


def gradient_text(canvas: Image.Image, xy, text: str, font, c1, c2):
    d = ImageDraw.Draw(canvas)
    box = d.textbbox(xy, text, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    grad = Image.new("RGBA", (w, h))
    gd = ImageDraw.Draw(grad)
    for i in range(w):
        t = i / max(1, w - 1)
        gd.line([(i, 0), (i, h)], fill=(*(int(c1[k] + (c2[k] - c1[k]) * t) for k in range(3)), 255))
    mask = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(mask).text(xy, text, font=font, fill=255)
    mask = mask.crop(box)
    canvas.paste(grad, box[:2], mask)


def share_image():
    canvas = Image.new("RGBA", (W, H), (*BG, 255))
    for center, radius, color, alpha in [
        ((330, 120), 330, BRAND, 46),
        ((900, 470), 300, VIOLET, 40),
        ((1120, 160), 240, BRAND_2, 34),
    ]:
        canvas = Image.alpha_composite(canvas, glow((W, H), center, radius, color, alpha))

    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, 64):
        gd.line([(x, 0), (x, H)], fill=(255, 255, 255, 14))
    for y in range(0, H, 64):
        gd.line([(0, y), (W, y)], fill=(255, 255, 255, 14))
    fade = Image.new("L", (W, H), 0)
    ImageDraw.Draw(fade).ellipse((-300, -360, 1100, 760), fill=255)
    fade = fade.filter(ImageFilter.GaussianBlur(160))
    grid.putalpha(ImageChops.multiply(grid.getchannel("A"), fade))
    canvas = Image.alpha_composite(canvas, grid)

    # Clip fan on the right, like the hero.
    media = PUBLIC / "media"
    place(canvas, phone(media / "clip-3.jpg", 190), (835, 375), 9, 0.9)
    place(canvas, phone(media / "clip-4.jpg", 190), (1105, 385), -9, 0.9)
    place(canvas, phone(media / "clip-1.jpg", 236), (970, 330), 0)

    d = ImageDraw.Draw(canvas)
    small = ImageFont.truetype(str(FONT), 26)
    brand = ImageFont.truetype(str(FONT), 34)
    head = ImageFont.truetype(str(FONT), 58)

    canvas.alpha_composite(logo_mark(56), (72, 64))
    d.text((142, 70), "Kliprix", font=brand, fill=TEXT)

    y = 190
    d.text((72, y), "One long video in.", font=head, fill=TEXT)
    gradient_text(canvas, (72, y + 74), "Scroll-stopping", head, BRAND, BRAND_2)
    d.text((72, y + 148), "shorts out.", font=head, fill=TEXT)

    d.text((72, 452), "Captions, titles and hashtags,", font=small, fill=MUTED)
    d.text((72, 488), "made on your own PC.", font=small, fill=MUTED)

    pill = "FREE  ·  OPEN SOURCE  ·  NO ACCOUNT"
    pf = ImageFont.truetype(str(FONT), 18)
    pw = d.textlength(pill, font=pf)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))  # translucent shapes must be blended
    ImageDraw.Draw(overlay).rounded_rectangle(
        (72, 548, 72 + pw + 36, 586), radius=19, fill=(255, 210, 63, 30), outline=(255, 210, 63, 110), width=2
    )
    canvas.alpha_composite(overlay)
    ImageDraw.Draw(canvas).text((90, 556), pill, font=pf, fill=BRAND)

    canvas.convert("RGB").save(PUBLIC / "og.jpg", quality=84, optimize=True, progressive=True)


def icons():
    for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
        bg = Image.new("RGBA", (size, size), (*BG, 255))
        pad = size // 8
        bg.alpha_composite(logo_mark(size - 2 * pad), (pad, pad))
        bg.convert("RGB").save(PUBLIC / name, optimize=True)


if __name__ == "__main__":
    share_image()
    icons()
    for f in ["og.jpg", "apple-touch-icon.png", "icon-192.png", "icon-512.png"]:
        print(f, (PUBLIC / f).stat().st_size // 1024, "KB")
