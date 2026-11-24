"""Command line: python -m p12 ..."""
from __future__ import annotations

import argparse
import sys

from PIL import Image, ImageOps

from . import protocol
from .render import compose


def main(argv=None):
    ap = argparse.ArgumentParser(prog="p12", description="Print on a P12 label printer")
    ap.add_argument("--printer", "-p", help="Bluetooth MAC (Linux RFCOMM) or serial port (COM5, /dev/cu.P12-...)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    pr = sub.add_parser("print", help="print a label")
    pr.add_argument("text", nargs="?", default="", help="label text, \\n for a new line")
    pr.add_argument("--image", help="picture or logo to put on the label")
    pr.add_argument("--label", help="print an already-designed PNG (W x 96, or scaled to 96 px tall)")
    pr.add_argument("--qr", help="QR code content")
    pr.add_argument("--length", type=float, help="label length in mm (default: fit content)")
    pr.add_argument("--frame", choices=["box", "rounded", "double", "dashed", "tag"])
    pr.add_argument("--invert", action="store_true", help="white on black")
    pr.add_argument("--font", help="path to a .ttf font")
    pr.add_argument("--copies", type=int, default=1)
    pr.add_argument("--density", choices=list(protocol.DENSITY), help="print darkness")
    pr.add_argument("--mirror", action="store_true", help="flip if your output comes out mirrored")
    pr.add_argument("--preview", help="save preview PNG here instead of / as well as printing")
    pr.add_argument("--dump", help="write raw printer bytes to this file")

    sub.add_parser("status", help="query battery, paper, firmware")

    a = ap.parse_args(argv)

    if a.cmd == "status":
        return status(a.printer)

    if a.label:
        img = Image.open(a.label).convert("L")
        if img.height != protocol.HEAD_DOTS:
            img = ImageOps.contain(img, (10_000, protocol.HEAD_DOTS))
            canvas = Image.new("L", (img.width, protocol.HEAD_DOTS), 255)
            canvas.paste(img, (0, (protocol.HEAD_DOTS - img.height) // 2))
            img = canvas
    else:
        img = compose(a.text.replace("\\n", "\n"), a.length, a.qr, a.image, a.frame, a.invert, a.font)

    if a.preview:
        img.save(a.preview)
        print(f"preview: {a.preview} ({img.width / protocol.DOTS_PER_MM:.0f} mm)")
    job = protocol.build_job(img, a.copies, protocol.DENSITY.get(a.density), a.mirror)
    if a.dump:
        open(a.dump, "wb").write(job)
        print(f"wrote {len(job)} bytes to {a.dump}")
    if a.printer:
        from .transport import Connection
        with Connection(a.printer) as c:
            c.write(job)
            for ev in protocol.parse_status(c.read(3.0)):
                print(*ev)
    elif not (a.preview or a.dump):
        print("no --printer given; nothing sent (use --preview or --dump to test)", file=sys.stderr)
        return 1
    return 0


def status(target: str | None):
    if not target:
        print("--printer is required", file=sys.stderr)
        return 1
    from .transport import Connection
    with Connection(target) as c:
        for q in (*protocol.CONNECT_HANDSHAKE, protocol.GET_BATTERY, protocol.GET_FIRMWARE):
            c.write(q)
            raw = c.read(0.6)
            for ev in protocol.parse_status(raw):
                print(f"{ev[0]:12} {ev[1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
