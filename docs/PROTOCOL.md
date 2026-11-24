# P12 label printer protocol

Reverse-engineered from the PrintMaster Android app (`com.project.aimotech.printmaster`).
Relevant decompiled classes: `printer.P12Printer`, `P1000Printer`, `QuinPrinter`,
`InsGet` / `InsSet` / `InsOther`, `lens.XNvUtil`, `bluetooth.classic.BluetoothService`,
`quyin.wrapper.utils.unit.PSeriesConverter`, `quyin.editor.d.PrintHelper`.

## Transport

* **Bluetooth Classic, SPP / RFCOMM**, not BLE.
  UUID `00001101-0000-1000-8000-00805F9B34FB` (the app also tries the secure UUID
  `fa87c0d0-afac-11de-8a39-0800200c9a66`).
* Pair the printer with the OS first. On Linux it is reachable as an RFCOMM socket on
  channel 1. On Windows and macOS the OS exposes the paired printer as a serial port
  (`COMx` or `/dev/cu.P12...`).
* The app writes each command buffer in one `write()` + `flush()`. It does not use
  chunking or flow control.

## Print head

| property | value |
|---|---|
| resolution | 203 dpi = **8 dots / mm** |
| head width | **96 dots** (12 mm), `PSeriesConverter.getMaxPrintDot()` |
| tape | 12 mm continuous tape; label length is free |
| image threshold | luminance < 128 → black (bit = 1) |

## Image pipeline (how the app builds the raster)

1. Render the label as **W × 96** px (W = length × 8). The content is centred on the
   96-dot axis; `PrintHelper` shifts it down by +4 dots for P12.
2. `matrix.postRotate(90)`, then `matrix.postScale(-1, 1)` (mirror) in `PrintAction`.
3. In `P12Printer.k1`: an optional user rotation, then **rotate 180°**.
4. `XNvUtil.img2Nv(bitmap)`: 1 bpp, MSB first, rows top → bottom.

The resulting raster is **96 px wide** (12 bytes per row) and **W rows tall**.
Steps 2 and 3 together amount to: `raster[row r][col c] = label[y = 95 - c][x = W - 1 - r]`.
That means the right end of the label is printed first. The decompiler left the mirror
step's control flow partly mangled, so both tools have a "mirror" switch in case the output
comes out flipped.

## Print job (P12)

```
1B 40                                  ESC @            init / clear buffer
for each copy:
  1D 76 30 00 wL wH hL hH <data>       GS v 0 0         raster bit image
                                         w = bytes per row (12), h = rows
```

Unlike the P1000, the P12 sends no `ESC J n` feed after the image.

## Commands sent on connect (P12)

`1F 11 38`, `1F 11 11`, `1F 11 12`, `1F 11 09`, `1F 11 13`

## Getters (`1F 11 xx`) and replies (`1A xx ...`)

Replies start with `1A` (sometimes `1B`). The parser is in `QuinPrinter$...o(byte[], int)`.

| query | meaning | reply |
|---|---|---|
| `1F 11 08` | battery | `1A 04 b`: `A1`=full, `A2`=medium, `A3`=low, `A4`=empty/charging |
| `1F 11 0E` | auto power-off | `1A 09 n` |
| `1F 11 11` | paper state | `1A 06 88` = **no paper**, any other value = paper OK |
| — | cover (pushed) | `1A 05 99` = **cover open**, `1A 05 98` = closed |
| — | charging (pushed) | `1A 03 A8` = not charging, `A9` = charging |
| `1F 11 07` | firmware version | `1A 07 a b c` → "a.b.c" |
| `1F 11 09` | serial / model | `1A 08` + 15 ASCII chars |
| — | print finished | `1A 0F 0C` |
| — | print cancelled | `1A 0B B8` |

## Setters

| command | meaning |
|---|---|
| `1F 11 02 n` | print density. The P12 UI uses 1 = light, 2 = normal, 4 = dark |
| `1B 4E 07 n` | auto power-off time |
