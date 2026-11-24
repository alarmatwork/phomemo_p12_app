"""Compose W x 96 label images: text, QR codes, pictures, frames."""
from __future__ import annotations

import os

from PIL import Image, ImageDraw, ImageFont, ImageOps

from .protocol import DOTS_PER_MM, HEAD_DOTS

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]

# Printable band. The tape is 12 mm, but the outer ~1 mm on each edge prints unreliably.
MARGIN = 6


def _font(size: int, path: str | None = None):
    for p in ([path] if path else []) + FONT_CANDIDATES:
        if p and os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default(size)


def fit_text(text: str, max_h: int, max_w: int | None = None, font_path: str | None = None):
    lines = text.split("\n")
    size = max_h // len(lines)
    while size > 6:
        f = _font(size, font_path)
        boxes = [f.getbbox(line or " ") for line in lines]
        h = sum(b[3] - b[1] for b in boxes) + (len(lines) - 1) * 2
        w = max(b[2] - b[0] for b in boxes)
        if h <= max_h and (max_w is None or w <= max_w):
            return f, lines
        size -= 1
    return _font(6, font_path), lines


def draw_text(img: Image.Image, text: str, box: tuple[int, int, int, int], font_path=None, align="center"):
    x0, y0, x1, y1 = box
    f, lines = fit_text(text, y1 - y0, x1 - x0 if align != "auto" else None, font_path)
    d = ImageDraw.Draw(img)
    boxes = [f.getbbox(line or " ") for line in lines]
    total = sum(b[3] - b[1] for b in boxes) + (len(lines) - 1) * 2
    y = y0 + (y1 - y0 - total) // 2
    for line, b in zip(lines, boxes):
        w = b[2] - b[0]
        x = x0 + ((x1 - x0 - w) // 2 if align in ("center", "auto") else 0)
        d.text((x - b[0], y - b[1]), line, fill=0, font=f)
        y += b[3] - b[1] + 2


def qr_image(data: str, size: int) -> Image.Image:
    import qrcode
    q = qrcode.QRCode(border=0, box_size=1, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(data)
    q.make(fit=True)
    m = q.make_image(fill_color="black", back_color="white").convert("L")
    scale = max(1, size // m.width)
    return m.resize((m.width * scale, m.width * scale), Image.Resampling.NEAREST)


def picture(path: str, size: int, dither: bool = True) -> Image.Image:
    im = Image.open(path)
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGBA", im.size, "white")
        im = Image.alpha_composite(bg, im.convert("RGBA"))
    im = ImageOps.contain(im.convert("L"), (size * 4, size))
    im = ImageOps.autocontrast(im)
    return im.convert("1", dither=Image.Dither.FLOYDSTEINBERG if dither else Image.Dither.NONE).convert("L")


def frame(img: Image.Image, style: str) -> None:
    d = ImageDraw.Draw(img)
    w, h = img.size
    m = MARGIN
    if style == "box":
        d.rectangle([2, m - 2, w - 3, h - m + 1], outline=0, width=3)
    elif style == "rounded":
        d.rounded_rectangle([2, m - 2, w - 3, h - m + 1], radius=18, outline=0, width=3)
    elif style == "double":
        d.rectangle([2, m - 2, w - 3, h - m + 1], outline=0, width=2)
        d.rectangle([7, m + 3, w - 8, h - m - 4], outline=0, width=1)
    elif style == "dashed":
        for x in range(2, w - 2, 12):
            d.line([x, m - 2, min(x + 6, w - 3), m - 2], fill=0, width=3)
            d.line([x, h - m + 1, min(x + 6, w - 3), h - m + 1], fill=0, width=3)
        d.line([2, m - 2, 2, h - m + 1], fill=0, width=3)
        d.line([w - 3, m - 2, w - 3, h - m + 1], fill=0, width=3)
    elif style == "tag":
        d.polygon([(0, h // 2), (22, m - 2), (w - 3, m - 2), (w - 3, h - m + 1), (22, h - m + 1)], outline=0, width=3)
        d.ellipse([12, h // 2 - 5, 22, h // 2 + 5], outline=0, width=2)


def compose(text: str = "", length_mm: float | None = None, qr: str | None = None,
            image: str | None = None, frame_style: str | None = None, invert: bool = False,
            font_path: str | None = None, pad_mm: float = 2.0) -> Image.Image:
    """Build a label. If length_mm is None the label is as long as the content needs."""
    band = HEAD_DOTS - 2 * MARGIN
    pad = int(pad_mm * DOTS_PER_MM)
    parts: list[Image.Image] = []
    if image:
        parts.append(picture(image, band))
    if qr:
        parts.append(qr_image(qr, band))
    text_w = 0
    if text:
        f, lines = fit_text(text, band - (8 if frame_style else 0), None, font_path)
        text_w = max(f.getbbox(line or " ")[2] - f.getbbox(line or " ")[0] for line in lines) + 4
    content_w = sum(p.width for p in parts) + text_w + pad * max(0, len(parts) + bool(text) - 1)
    edge = pad + (14 if frame_style == "tag" else 6 if frame_style else 0)
    width = int(length_mm * DOTS_PER_MM) if length_mm else content_w + 2 * edge
    img = Image.new("L", (max(width, 16), HEAD_DOTS), 255)
    x = edge if length_mm is None else max(edge, (width - content_w) // 2)
    for p in parts:
        img.paste(p, (x, (HEAD_DOTS - p.height) // 2))
        x += p.width + pad
    if text:
        draw_text(img, text, (x, MARGIN + (4 if frame_style else 0), width - edge, HEAD_DOTS - MARGIN - (4 if frame_style else 0)),
                  font_path, align="auto")
    if frame_style:
        frame(img, frame_style)
    if invert:
        img = ImageOps.invert(img)
    return img
