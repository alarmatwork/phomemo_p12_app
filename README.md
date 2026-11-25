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

> **First print:** the orientation was confirmed on a real P12, and each label is followed by 8 mm of
> blank tape so its end clears the tear edge. If your text comes out mirrored, tick **Mirror output**;
> if the end is still cut off, raise **Feed after label**.

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

## 2c. Docker on a NAS

The container serves the designer on port 8080. When `PRINTER` is set, **Print** goes through the NAS,
so any phone, tablet or browser on your network can print. If it isn't set, browsers fall back to Web Serial.

```bash
docker compose up -d --build        # then open http://nas-ip:8080
```

The NAS still has to reach the printer over **Bluetooth Classic**. Choose one route:

| route | `PRINTER=` | notes |
|---|---|---|
| **ESP32 bridge** (recommended, about €5) | `tcp://esp32-ip:9100` | Flash [bridges/esp32/p12_bridge.ino](bridges/esp32/p12_bridge.ino). Must be an **original ESP32**; S2/S3/C3 have no Classic BT. |
| **Raspberry Pi bridge** | `tcp://pi-ip:9100` | On the Pi: `bluetoothctl pair <MAC>`, then `python -m p12 -p <MAC> bridge` |
| **USB BT dongle in the NAS** | `AA:BB:CC:DD:EE:FF` | Only if the NAS kernel has `bluetooth`/`btusb`/`rfcomm` modules; stock Synology DSM 7 doesn't. Use the host-network service in `docker-compose.yml`. |

Home Assistant / ESPHome "Bluetooth proxies" do **not** work here: they are BLE-only, and the P12 uses Classic SPP.

API: `GET /api/info`, `GET /api/status`, and `POST /api/print` with raw job bytes
(`python -m p12 print ... --dump job.bin`, then `curl --data-binary @job.bin nas:8080/api/print`).

## Tests

```bash
.venv/bin/python -m pytest tests      # encoder, transform matches the app's pipeline, status parsing
node tests/p12js.test.js              # web encoder == Python encoder, byte for byte
```
