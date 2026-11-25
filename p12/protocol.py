"""P12 wire protocol: raster encoding and command bytes. See docs/PROTOCOL.md."""
from __future__ import annotations

from PIL import Image

DOTS_PER_MM = 8
HEAD_DOTS = 96  # 12 mm print head
BYTES_PER_ROW = HEAD_DOTS // 8

INIT = bytes([0x1B, 0x40])
RASTER = bytes([0x1D, 0x76, 0x30, 0x00])

GET_BATTERY = bytes([0x1F, 0x11, 0x08])
GET_PAPER = bytes([0x1F, 0x11, 0x11])
GET_FIRMWARE = bytes([0x1F, 0x11, 0x07])
GET_SERIAL = bytes([0x1F, 0x11, 0x09])
GET_AUTO_OFF = bytes([0x1F, 0x11, 0x0E])
CONNECT_HANDSHAKE = [
    bytes([0x1F, 0x11, 0x38]),
    GET_PAPER,
    bytes([0x1F, 0x11, 0x12]),
    GET_SERIAL,
    bytes([0x1F, 0x11, 0x13]),
]

DENSITY = {"light": 1, "normal": 2, "dark": 4}

# The last ~8 mm printed are still between the head and the tear edge when printing stops,
# so blank tape is fed after each label (measured on a real P12).
TAIL_FEED_MM = 8


def set_density(level: int) -> bytes:
    if not 1 <= level <= 15:
        raise ValueError("density must be 1..15")
    return bytes([0x1F, 0x11, 0x02, level])


def label_to_raster(label: Image.Image, mirror: bool = False, offset: int = 0) -> Image.Image:
    """Convert a W x 96 label image (landscape, as you read it) into the 96-px-wide
    raster the head prints. The right end of the label is printed first.
    raster[r][c] = label[c][W-1-r], verified on a real P12. (The literal decompiled app
    steps give a transpose about the anti-diagonal, which prints mirrored on hardware.)
    mirror=True flips across the tape, for printers that behave differently."""
    img = label.convert("L")
    if img.height != HEAD_DOTS:
        raise ValueError(f"label must be {HEAD_DOTS} px tall, got {img.height}")
    if offset:  # > 0 moves content down the label (calibrates where the tape sits under the head)
        shifted = Image.new("L", img.size, 255)
        shifted.paste(img, (0, offset))
        img = shifted
    raster = img.transpose(Image.Transpose.ROTATE_90)
    if mirror:
        raster = raster.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return raster


def pack_bits(raster: Image.Image, threshold: int = 128) -> bytes:
    """1 bpp, MSB first; dark pixel (< threshold) = 1."""
    img = raster.convert("L")
    w, h = img.size
    row_bytes = w // 8
    px = img.load()
    out = bytearray(row_bytes * h)
    i = 0
    for y in range(h):
        for bx in range(row_bytes):
            b = 0
            for bit in range(8):
                b <<= 1
                if px[bx * 8 + bit, y] < threshold:
                    b |= 1
            out[i] = b
            i += 1
    return bytes(out)


def raster_command(raster: Image.Image, threshold: int = 128) -> bytes:
    w, h = raster.size
    wb = w // 8
    return RASTER + bytes([wb & 0xFF, wb >> 8, h & 0xFF, h >> 8]) + pack_bits(raster, threshold)


def build_job(label: Image.Image, copies: int = 1, density: int | None = None,
              mirror: bool = False, threshold: int = 128,
              feed_mm: float = TAIL_FEED_MM, offset: int = 0) -> bytes:
    """Full byte stream for printing `label` (W x 96, landscape) `copies` times,
    each followed by `feed_mm` of blank tape so the label clears the tear edge."""
    job = bytearray()
    if density:
        job += set_density(density)
    job += INIT
    raster = label_to_raster(label, mirror, offset)
    feed = max(0, round(feed_mm * DOTS_PER_MM))
    if feed:
        padded = Image.new("L", (raster.width, raster.height + feed), 255)
        padded.paste(raster, (0, 0))
        raster = padded
    img = raster_command(raster, threshold)
    for _ in range(max(1, copies)):
        job += img
    return bytes(job)


def parse_status(data: bytes) -> list[tuple[str, object]]:
    """Decode 0x1A-prefixed status replies into (name, value) events."""
    events: list[tuple[str, object]] = []
    i = 0
    while i < len(data):
        if data[i] not in (0x1A, 0x1B) or i + 1 >= len(data):
            i += 1
            continue
        cmd = data[i + 1]
        arg = data[i + 2] if i + 2 < len(data) else None
        if cmd == 0x04 and arg is not None:
            # P12 sends a level code, P12 Pro a percentage.
            levels = {0xA1: "full", 0xA2: "medium", 0xA3: "low", 0xA4: "empty"}
            events.append(("battery", levels.get(arg, f"{arg}%" if arg <= 100 else hex(arg))))
            i += 3
        elif cmd == 0x06 and arg is not None:
            events.append(("paper", arg != 0x88))
            i += 3
        elif cmd == 0x05 and arg is not None:
            events.append(("cover_open", arg == 0x99))
            i += 3
        elif cmd == 0x03 and arg is not None:
            events.append(("charging", arg == 0xA9))
            i += 3
        elif cmd == 0x07 and i + 4 < len(data):
            events.append(("firmware", ".".join(str(b) for b in data[i + 2:i + 5])))
            i += 5
        elif cmd == 0x08 and i + 16 < len(data):
            events.append(("serial", data[i + 2:i + 17].decode("ascii", "replace").strip("8\x00 ")))
            i += 17
        elif cmd == 0x09 and arg is not None:
            events.append(("auto_off", arg))
            i += 3
        elif cmd == 0x0F and arg == 0x0C:
            events.append(("print_done", True))
            i += 3
        elif cmd == 0x0B and arg == 0xB8:
            events.append(("print_cancelled", True))
            i += 3
        else:
            i += 2
    return events
