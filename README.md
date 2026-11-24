<img src="assets/icon.svg" width="64" height="64" alt="">

# LabelPrinter: P12 label studio

An independent app for the **P12 12 mm Bluetooth label printer**. It talks to the printer directly, using
the protocol reverse-engineered from the PrintMaster Android app (see [docs/PROTOCOL.md](docs/PROTOCOL.md)).

The icons, frames and templates are original designs made for this project. Nothing was copied from
PrintMaster's template library.

## 1. Pair the printer

Turn the P12 on and pair it in your OS Bluetooth settings. It uses **Bluetooth Classic (SPP)**, not BLE.

## 2a. Web designer (`web/`)

Open `web/index.html` in **desktop Chrome or Edge**. You can open it straight from disk, or serve it with
`python3 -m http.server -d web` and go to http://localhost:8000.

* Build a label left to right from blocks: text (8 fonts, auto-fit), 36 icons, pictures (dithered photos or
  sharp logos), QR codes (with a Wi-Fi helper), barcodes and spacers.
* Frames: box, rounded, pill, double, dashed, dotted, tag, ribbon, brackets, stars and scallop. White-on-black is also available.
* 14 starter templates. `{date}` and `{time}` in text are filled in when you print.
* **Connect printer** opens Chrome's port picker; choose the paired P12. The status bar shows battery,
  tape, cover and firmware.
* Without Web Serial (Safari, Firefox, some phones), use **Download .bin** or **Save PNG** and print them
  with the CLI.

> **First print:** press **Orientation test** and print it. If the arrow or text comes out mirrored, tick
> **Mirror output**. The app's decompiled code was ambiguous about one flip.

## 2b. Python CLI (`p12/`)

```bash
python3 -m venv .venv && .venv/bin/pip install pillow pyserial qrcode
# Linux: use the MAC address (RFCOMM). Windows: COM5. macOS: /dev/cu.P12-xxxx
.venv/bin/python -m p12 -p AA:BB:CC:DD:EE:FF status
.venv/bin/python -m p12 -p AA:BB:CC:DD:EE:FF print "Spices\nCumin" --frame rounded
.venv/bin/python -m p12 -p COM5 print "Guest Wi-Fi" --qr "WIFI:T:WPA;S:home;P:secret;;" --frame tag
.venv/bin/python -m p12 -p COM5 print --label label.png --copies 3 --density dark
.venv/bin/python -m p12 print "Test" --preview out.png --dump out.bin   # no printer needed
```

## Tests

```bash
.venv/bin/python -m pytest tests      # encoder, transform matches the app's pipeline, status parsing
node tests/p12js.test.js              # web encoder == Python encoder, byte for byte
```
