# P12 Wi-Fi bridge (ESP32)

Holds one Bluetooth connection to the P12 / P12 Pro open and exposes it on TCP port 9100, so the
NAS container can print with `PRINTER=tcp://<bridge-ip>:9100`.

Needs an **original ESP32** (WROOM / WROVER / PICO, such as the M5Stack ATOM Lite). ESP32-S2/S3/C3/C6
and ESP8266 have no Bluetooth Classic.

## Build and flash (macOS / Linux)

```bash
python3 -m venv ~/.pio-venv && ~/.pio-venv/bin/pip install platformio
cd bridges/esp32
~/.pio-venv/bin/pio run -e atom-lite -t upload     # other ESP32 boards: -e esp32dev
~/.pio-venv/bin/pio device monitor                 # logs at 115200, Ctrl+C to quit
```

If upload can't find the port, pass it: `-t upload --upload-port /dev/cu.usbserial-XXXX`
(`ls /dev/cu.*` before and after plugging the board in).

## First start

1. The LED turns white and the board opens a Wi-Fi network **P12-bridge-setup**. Join it from a phone;
   the setup page opens (or browse to http://192.168.4.1).
2. Choose your Wi-Fi, enter the password. The printer address is pre-filled with `20:4F:9F:39:BD:04`.
3. The board joins your Wi-Fi as `p12-bridge` and connects to the printer. The serial log shows its IP.
   Give it a fixed IP in your router, then set `PRINTER: "tcp://<that-ip>:9100"` on the NAS.

On the Mac, **Forget** the printer in Bluetooth settings: it accepts one connection at a time.

| LED | meaning |
|---|---|
| blue | joining Wi-Fi |
| white | setup page open |
| yellow | connecting to printer |
| green | ready |
| purple | data flowing |
| red | printer not reachable, retrying every 10 s |

Short button press: drop and reconnect the printer. Hold the button while plugging in: forget Wi-Fi
and open the setup page again.
