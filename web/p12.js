/* P12 label printer protocol, shared by the web app (window.P12) and node tests.
 * See docs/PROTOCOL.md. */
(function (root) {
  const HEAD_DOTS = 96;
  const DOTS_PER_MM = 8;
  const SPP_UUID = "00001101-0000-1000-8000-00805f9b34fb";

  /** gray(x, y) -> 0..255 for a W x 96 landscape label. Returns the GS v 0 raster command.
   *  Transform = app's rotate 90 / mirror / rotate 180: raster[r][c] = label[95-c][W-1-r]. */
  function rasterCommand(gray, width, { mirror = false, threshold = 128 } = {}) {
    const rowBytes = HEAD_DOTS / 8;
    const out = new Uint8Array(8 + rowBytes * width);
    out.set([0x1d, 0x76, 0x30, 0x00, rowBytes, 0, width & 0xff, (width >> 8) & 0xff]);
    let i = 8;
    for (let r = 0; r < width; r++) {
      for (let b = 0; b < rowBytes; b++) {
        let v = 0;
        for (let bit = 0; bit < 8; bit++) {
          let c = b * 8 + bit;
          if (mirror) c = HEAD_DOTS - 1 - c;
          v = (v << 1) | (gray(width - 1 - r, HEAD_DOTS - 1 - c) < threshold ? 1 : 0);
        }
        out[i++] = v;
      }
    }
    return out;
  }

  function buildJob(gray, width, { copies = 1, density = 0, mirror = false, threshold = 128 } = {}) {
    const img = rasterCommand(gray, width, { mirror, threshold });
    const head = [];
    if (density) head.push(0x1f, 0x11, 0x02, density);
    head.push(0x1b, 0x40);
    const n = Math.max(1, copies | 0);
    const job = new Uint8Array(head.length + img.length * n);
    job.set(head, 0);
    for (let k = 0; k < n; k++) job.set(img, head.length + k * img.length);
    return job;
  }

  /** Build a gray() accessor from canvas ImageData (alpha composited onto white). */
  function grayFromImageData(data) {
    const { width, data: d } = data;
    return (x, y) => {
      const i = (y * width + x) * 4;
      const a = d[i + 3] / 255;
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      return l * a + 255 * (1 - a);
    };
  }

  const BATTERY = { 0xa1: "full", 0xa2: "medium", 0xa3: "low", 0xa4: "empty" };

  function parseStatus(bytes) {
    const ev = [];
    let i = 0;
    while (i < bytes.length) {
      if ((bytes[i] !== 0x1a && bytes[i] !== 0x1b) || i + 1 >= bytes.length) { i++; continue; }
      const cmd = bytes[i + 1], arg = bytes[i + 2];
      if (cmd === 0x04 && arg !== undefined) { ev.push(["battery", BATTERY[arg] || arg]); i += 3; }
      else if (cmd === 0x06 && arg !== undefined) { ev.push(["paper", arg !== 0x88]); i += 3; }
      else if (cmd === 0x05 && arg !== undefined) { ev.push(["cover_open", arg === 0x99]); i += 3; }
      else if (cmd === 0x03 && arg !== undefined) { ev.push(["charging", arg === 0xa9]); i += 3; }
      else if (cmd === 0x07 && i + 4 < bytes.length) { ev.push(["firmware", [...bytes.slice(i + 2, i + 5)].join(".")]); i += 5; }
      else if (cmd === 0x0f && arg === 0x0c) { ev.push(["print_done", true]); i += 3; }
      else if (cmd === 0x0b && arg === 0xb8) { ev.push(["print_cancelled", true]); i += 3; }
      else i += 2;
    }
    return ev;
  }

  const QUERIES = {
    handshake: [[0x1f, 0x11, 0x38], [0x1f, 0x11, 0x11], [0x1f, 0x11, 0x12], [0x1f, 0x11, 0x09], [0x1f, 0x11, 0x13]],
    battery: [0x1f, 0x11, 0x08],
    paper: [0x1f, 0x11, 0x11],
    firmware: [0x1f, 0x11, 0x07],
  };

  const api = { HEAD_DOTS, DOTS_PER_MM, SPP_UUID, rasterCommand, buildJob, grayFromImageData, parseStatus, QUERIES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.P12 = api;
})(typeof window !== "undefined" ? window : globalThis);
