/* P12 Label Studio: block-based 12 mm label designer + Web Serial printing. */
(function () {
  const { HEAD_DOTS, DOTS_PER_MM } = P12;
  const MARGIN = 6;              // unprintable-ish edge of the 12 mm tape, in dots
  const BAND = HEAD_DOTS - 2 * MARGIN;
  const GAP = 12;                // dots between blocks
  const FONTS = ["Inter", "Bebas Neue", "Space Grotesk", "Roboto Slab", "Pacifico", "Caveat", "Space Mono", "Permanent Marker"];
  const STORE = "p12-studio-v1";

  const $ = (s, el = document) => el.querySelector(s);
  const h = (tag, props = {}, ...kids) => {
    const el = Object.assign(document.createElement(tag), props);
    for (const k of kids) el.append(k);
    return el;
  };

  const defaultDesign = () => ({
    label: { lengthMode: "auto", length: 40, frame: "rounded", invert: false, pad: 2, threshold: 128 },
    blocks: [{ type: "icon", name: "heart", scale: 100, invert: false },
             { type: "text", text: "Hello P12", font: "Inter", bold: true, italic: false, size: 0 }],
  });
  // v2: orientation fixed after a real-P12 test print, so an older saved "mirror" is reset.
  // Vertical offset 6: measured with the calibration strip on a P12 Pro (tape sits ~6 dots low).
  const settings = { v: 3, copies: 1, density: 2, mirror: false, feed: P12.TAIL_FEED_MM, offset: 6 };

  let design = load() || defaultDesign();
  let selected = 1;
  const imgCache = new Map();
  let iconQuery = "";

  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s?.design?.blocks) { if (s.settings?.v === 3) Object.assign(settings, s.settings); else if (s.settings?.v === 2) Object.assign(settings, s.settings, { v: 3, offset: s.settings.offset || 6 }); else if (s.settings) Object.assign(settings, { copies: s.settings.copies ?? 1, density: s.settings.density ?? 2 }); return s.design; } } catch {}
    return null;
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ design, settings })); } catch {}
  }

  /* ---------- rendering ---------- */

  const fillVars = (t) => t.replace(/\{date\}/g, new Date().toLocaleDateString())
                            .replace(/\{time\}/g, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  function fontStr(b, size) { return `${b.italic ? "italic " : ""}${b.bold ? "700" : "400"} ${size}px "${b.font}"`; }

  function textLayout(ctx, b, maxH, maxW) {
    const lines = fillVars(b.text || " ").split("\n");
    let size = b.size ? b.size : Math.ceil(maxH * 1.5);
    for (; size > 6; size--) {
      ctx.font = fontStr(b, size);
      const m = lines.map((l) => ctx.measureText(l || " "));
      const asc = m.map((x) => x.actualBoundingBoxAscent), desc = m.map((x) => x.actualBoundingBoxDescent);
      const gap = Math.round(size * 0.18);
      const hgt = asc.reduce((a, v, i) => a + v + desc[i], 0) + gap * (lines.length - 1);
      const w = Math.max(...m.map((x) => x.actualBoundingBoxLeft + x.actualBoundingBoxRight));
      if (b.size || (hgt <= maxH && (!maxW || w <= maxW))) return { size, lines, m, asc, desc, gap, w: Math.ceil(w), hgt };
    }
    return textLayout(ctx, { ...b, size: 6 }, maxH, maxW);
  }

  function loadImage(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
    imgCache.set(src, p);
    return p;
  }

  function dither(canvas, threshold, mode) {
    const ctx = canvas.getContext("2d"), d = ctx.getImageData(0, 0, canvas.width, canvas.height), px = d.data;
    const W = canvas.width, g = new Float32Array(W * canvas.height);
    for (let i = 0; i < g.length; i++) {
      const a = px[i * 4 + 3] / 255;
      g[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) * a + 255 * (1 - a);
    }
    for (let i = 0; i < g.length; i++) {
      const v = g[i] < threshold ? 0 : 255;
      if (mode === "dither") {
        const e = g[i] - v, x = i % W;
        if (x + 1 < W) g[i + 1] += (e * 7) / 16;
        if (i + W < g.length) { if (x > 0) g[i + W - 1] += (e * 3) / 16; g[i + W] += (e * 5) / 16; if (x + 1 < W) g[i + W + 1] += e / 16; }
      }
      px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v; px[i * 4 + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
  }

  /** Turn each block into {w, h, draw(ctx, x, y)} given the vertical room. */
  async function measure(ctx, b, room, maxTextW) {
    if (b.type === "text") {
      const L = textLayout(ctx, b, room, maxTextW);
      return { w: L.w, draw: (c, x, top) => {
        c.font = fontStr(b, L.size); c.textBaseline = "alphabetic";
        let y = top + (room - L.hgt) / 2;
        L.lines.forEach((line, i) => {
          y += L.asc[i];
          const lw = L.m[i].actualBoundingBoxLeft + L.m[i].actualBoundingBoxRight;
          const lx = b.align === "left" ? x : b.align === "right" ? x + L.w - lw : x + (L.w - lw) / 2;
          c.fillText(line, lx + L.m[i].actualBoundingBoxLeft, y);
          y += L.desc[i] + L.gap;
        });
      } };
    }
    if (b.type === "spacer") return { w: Math.round((b.mm || 3) * DOTS_PER_MM), draw: () => {} };
    let src, w, hh, smooth = true;
    if (b.type === "icon") {
      src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(Graphics.iconSvg(b.name, b.invert !== !!design.label.invert));
      hh = Math.round(room * (b.scale || 100) / 100); w = hh;
    } else if (b.type === "image") {
      if (!b.src) return { w: 0, draw: () => {} };
      const im = await loadImage(b.src);
      hh = Math.round(room * (b.scale || 100) / 100); w = Math.round((im.width / im.height) * hh);
      const off = h("canvas", { width: w, height: hh }), oc = off.getContext("2d");
      oc.fillStyle = "#fff"; oc.fillRect(0, 0, w, hh);
      oc.filter = `brightness(${b.brightness || 100}%) contrast(${b.contrast || 100}%)`;
      oc.drawImage(im, 0, 0, w, hh); oc.filter = "none";
      dither(off, 128, b.mode || "dither");
      if (b.invert) { oc.globalCompositeOperation = "difference"; oc.fillStyle = "#fff"; oc.fillRect(0, 0, w, hh); }
      return { w, draw: (c, x, top) => { c.imageSmoothingEnabled = false; c.drawImage(off, x, top + (room - hh) / 2); } };
    } else if (b.type === "qr") {
      if (typeof qrcode === "undefined") return { w: 0, draw: () => {} };
      const q = qrcode(0, "M"); q.addData(b.data || " "); q.make();
      const n = q.getModuleCount(), cell = Math.max(1, Math.floor(room / n)); w = hh = n * cell; smooth = false;
      return { w, draw: (c, x, top) => {
        const y0 = top + Math.floor((room - hh) / 2);
        for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) c.fillRect(x + k * cell, y0 + r * cell, cell, cell);
      } };
    } else if (b.type === "barcode") {
      if (typeof JsBarcode === "undefined") return { w: 0, draw: () => {} };
      const bc = h("canvas");
      try {
        JsBarcode(bc, b.data || "0", { format: b.format || "CODE128", width: 2, height: b.text ? room - 22 : room, margin: 0,
          displayValue: !!b.text, fontSize: 18, textMargin: 2, font: "Inter", background: "#ffffff", lineColor: "#000000" });
      } catch { return { w: 0, draw: () => {} }; }
      const scale = Math.min(1, room / bc.height);
      w = Math.round(bc.width * scale); hh = Math.round(bc.height * scale);
      return { w, draw: (c, x, top) => { c.imageSmoothingEnabled = false; c.drawImage(bc, x, top + (room - hh) / 2, w, hh); } };
    }
    const im = await loadImage(src);
    return { w, draw: (c, x, top) => { c.imageSmoothingEnabled = smooth; c.drawImage(im, x, top + (room - hh) / 2, w, hh); } };
  }

  async function render(canvas) {
    const L = design.label;
    const ctx = canvas.getContext("2d");
    const vin = Graphics.frameVInset(L.frame);
    const room = BAND - 2 * vin;
    const pad = Math.round((L.pad ?? 2) * DOTS_PER_MM);
    // Horizontal inset from the frame is only known after drawing it, so estimate with a scratch canvas.
    const probe = h("canvas", { width: 400, height: HEAD_DOTS }).getContext("2d");
    const inset = Graphics.drawFrame(probe, L.frame, 400, HEAD_DOTS, MARGIN);
    const edge = pad + Math.ceil(inset);
    const fixedW = L.lengthMode === "fixed" ? Math.round(L.length * DOTS_PER_MM) : 0;

    // Measure non-text blocks first, so text can shrink to fit a fixed length.
    const items = new Array(design.blocks.length);
    let used = 0, texts = 0;
    for (let i = 0; i < design.blocks.length; i++) {
      const b = design.blocks[i];
      if (b.type === "text") { texts++; continue; }
      items[i] = await measure(ctx, b, room); used += items[i].w;
    }
    const gaps = GAP * Math.max(0, design.blocks.length - 1);
    const textW = fixedW && texts ? Math.max(20, (fixedW - 2 * edge - used - gaps) / texts) : 0;
    for (let i = 0; i < design.blocks.length; i++) {
      if (design.blocks[i].type === "text") { items[i] = await measure(ctx, design.blocks[i], room, textW); used += items[i].w; }
    }
    const contentW = used + gaps;
    const W = Math.max(fixedW || contentW + 2 * edge, 24);
    canvas.width = W; canvas.height = HEAD_DOTS;

    const ink = L.invert ? "#fff" : "#000", paper = L.invert ? "#000" : "#fff";
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, HEAD_DOTS);
    if (L.invert) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, MARGIN - 2); ctx.fillRect(0, HEAD_DOTS - MARGIN + 2, W, MARGIN); ctx.fillStyle = "#000"; ctx.fillRect(0, MARGIN - 2, W, BAND + 4); }
    ctx.fillStyle = ink; ctx.strokeStyle = ink;
    Graphics.drawFrame(ctx, L.frame, W, HEAD_DOTS, MARGIN);
    let x = fixedW ? Math.max(edge, (W - contentW) / 2) : edge;
    const top = MARGIN + vin;
    for (const it of items) { ctx.fillStyle = ink; it.draw(ctx, Math.round(x), top); x += it.w + GAP; }
    dither(canvas, L.threshold || 128, "threshold");
    return canvas;
  }

  /* ---------- printer (Web Serial over Bluetooth SPP) ---------- */

  let port = null, writer = null, reader = null;
  let nas = null;   // {target} when served by the NAS container with a printer configured
  const status = {};

  function setStatus(k, v) { status[k] = v; drawStatus(); }
  function drawStatus() {
    const el = $("#status");
    el.replaceChildren();
    const chip = (t, cls = "") => el.append(h("span", { className: "chip " + cls, textContent: t }));
    if (nas) chip(status.error ? "NAS: printer unreachable" : "NAS printer", status.error ? "warn" : "ok");
    else if (!port) return chip("Not connected", "muted");
    else chip("Connected", "ok");
    if (status.battery) chip("Battery: " + status.battery, status.battery === "low" || status.battery === "empty" || parseInt(status.battery) <= 15 ? "warn" : "");
    if (status.paper === false) chip("No tape", "warn");
    if (status.cover_open) chip("Cover open", "warn");
    if (status.charging) chip("Charging");
    if (status.firmware) chip("FW " + status.firmware, "muted");
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = (...a) => console.info("[P12]", ...a);
  const hex = (u8) => Array.from(u8.slice(0, 32), (b) => b.toString(16).padStart(2, "0")).join(" ") + (u8.length > 32 ? " …" : "");
  function write(bytes, ms = 10000) {
    let t;
    const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error("printer did not accept data within " + ms / 1000 + " s (off, asleep or connected elsewhere?)")), ms); });
    return Promise.race([writer.write(bytes), timeout]).finally(() => clearTimeout(t));
  }

  async function connect() {
    if (!("serial" in navigator)) {
      toast("This browser has no Web Serial. Use desktop Chrome or Edge, or the Python CLI. You can still download the .bin.");
      return;
    }
    try {
      const chosen = await navigator.serial.requestPort({ allowedBluetoothServiceClassIds: [P12.SPP_UUID] });
      const info = chosen.getInfo();
      log("port chosen", info);
      if (port) await disconnect();  // the read loop stops once `port` is cleared
      if (chosen.readable || chosen.writable) {
        // Left open by an earlier connection on this page (e.g. after a stuck print): reset it.
        log("port was still open, closing it first");
        await closePort(chosen);
      }
      port = chosen;
      await port.open({ baudRate: 115200, flowControl: "none" });
      log("port opened");
      // Like pyserial (which gets replies on macOS cu.* ports): raise DTR/RTS, then pace the queries.
      try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }); } catch (e) { log("setSignals", e); }
      writer = port.writable.getWriter();
      readLoop();
      await sleep(300);
      for (const q of [...P12.QUERIES.handshake, P12.QUERIES.battery, P12.QUERIES.firmware]) {
        await write(new Uint8Array(q));
        await sleep(250);
      }
      log("handshake sent, waiting for replies");
      $("#connect").textContent = "Disconnect";
      drawStatus();
    } catch (e) {
      log("connect failed", e);
      const p = port; port = null;
      if (p) await closePort(p);
      $("#connect").textContent = "Connect printer";
      toast("Connection failed: " + e.message + (/Mac/.test(navigator.platform) ? " Try the other entry for the printer (with or without “cu.”)." : "")); drawStatus();
    }
  }

  async function closePort(p) {
    // abort() drops pending writes, so a stuck print can't keep the port locked open.
    try { if (writer) await writer.abort(); } catch (e) { log("writer abort", e); }
    try { if (reader) await reader.cancel(); } catch (e) { log("reader cancel", e); }
    writer = reader = null;
    try { if (p.writable && !p.writable.locked) await p.writable.abort(); } catch {}
    try { if (p.readable && !p.readable.locked) await p.readable.cancel(); } catch {}
    if (!p.readable && !p.writable) return;  // never opened, or already closed
    try { await p.close(); log("port closed"); } catch (e) { log("port close", e); }
  }

  async function disconnect() {
    const p = port;
    port = null;
    if (p) await closePort(p);
    $("#connect").textContent = "Connect printer";
    drawStatus();
  }

  async function readLoop() {
    while (port && port.readable) {
      reader = port.readable.getReader();
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          log("printer replied", hex(value), P12.parseStatus(value));
          for (const [k, v] of P12.parseStatus(value)) {
            if (k === "print_done") toast("Printed ✓"); else setStatus(k, v);
          }
        }
      } catch (e) { log("read stopped", e); break; } finally { reader.releaseLock(); }
    }
  }

  /** Test pattern: a staircase of 12 numbered 8-dot bands (1 = top of the label, 12 = bottom)
   *  plus edge ticks, so a print shows exactly which head rows land on the tape. */
  function calibrationCanvas() {
    const step = 30, W = 12 * step + 40;
    const c = h("canvas", { width: W, height: HEAD_DOTS }), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, W, HEAD_DOTS);
    g.fillStyle = "#000";
    for (let i = 0; i < 12; i++) {
      g.fillRect(i * step, i * 8, step - 2, 8);
      g.fillStyle = "#fff"; g.font = "bold 8px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(String(i + 1), i * step + (step - 2) / 2, i * 8 + 4.5);
      g.fillStyle = "#000";
    }
    for (let y = 0; y < HEAD_DOTS; y += 8) g.fillRect(W - 36, y, y % 24 === 0 ? 14 : 8, 1);  // ruler ticks
    g.fillRect(W - 20, 0, 4, HEAD_DOTS / 2);  // top half bar
    g.fillRect(W - 10, HEAD_DOTS / 2, 4, HEAD_DOTS / 2);  // bottom half bar
    return c;
  }

  async function makeJob(canvas) {
    const c = canvas || await render(h("canvas"));
    const data = c.getContext("2d").getImageData(0, 0, c.width, c.height);
    return P12.buildJob(P12.grayFromImageData(data), c.width,
      { copies: canvas ? 1 : settings.copies, density: settings.density, mirror: settings.mirror, threshold: 128, feedMm: settings.feed, offset: settings.offset | 0 });
  }

  async function nasStatus() {
    $("#connect").disabled = true;
    try {
      const r = await fetch("api/status", { cache: "no-store" });
      const j = await r.json();
      for (const k of Object.keys(status)) delete status[k];
      if (!r.ok) status.error = j.error || r.statusText; else Object.assign(status, j);
      if (status.error) toast("Printer: " + status.error);
    } catch (e) { status.error = e.message; }
    $("#connect").disabled = false;
    drawStatus();
  }

  async function nasPrint(job) {
    const btn = $("#print"); btn.disabled = true; btn.textContent = "Printing…";
    try {
      const r = await fetch("api/print", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: job });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      delete status.error;
      for (const [k, v] of Object.entries(j.events || {})) if (k !== "print_done") status[k] = v;
      toast(`Sent ${settings.copies} label${settings.copies > 1 ? "s" : ""} via NAS`);
    } catch (e) { status.error = e.message; toast("Print failed: " + e.message); }
    btn.disabled = false; btn.textContent = "Print"; drawStatus();
  }

  async function print(canvas) {
    if (canvas instanceof Event) canvas = undefined;
    if (nas && !port) return nasPrint(await makeJob(canvas));
    if (!port) { log("print: not connected, connecting first"); await connect(); if (!port) return; }
    if (status.paper === false || status.cover_open) toast("Printer reports a problem (tape or cover). Sending anyway…");
    const job = await makeJob(canvas);
    const btn = $("#print"); btn.disabled = true;
    log("print: sending", job.length, "bytes", { copies: settings.copies, density: settings.density, mirror: settings.mirror, feedMm: settings.feed }, "start:", hex(job));
    try {
      for (let i = 0; i < job.length; i += 2048) {
        await write(job.subarray(i, i + 2048));
        btn.textContent = `Sending ${Math.round((Math.min(job.length, i + 2048) / job.length) * 100)}%`;
      }
      log("print: all bytes written");
      toast(`Sent ${settings.copies} label${settings.copies > 1 ? "s" : ""}`);
    } catch (e) { log("print failed", e); toast("Print failed: " + e.message); await disconnect(); }
    btn.disabled = false; btn.textContent = "Print";
  }

  /* ---------- UI ---------- */

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
  }

  let renderSeq = 0;
  async function refresh() {
    save();
    const seq = ++renderSeq;
    const c = await render(h("canvas"));
    if (seq !== renderSeq) return;
    const view = $("#preview");
    view.width = c.width; view.height = c.height;
    view.style.width = `${c.width * 2}px`;
    view.getContext("2d").drawImage(c, 0, 0);
    $("#dims").textContent = `${(c.width / DOTS_PER_MM).toFixed(1)} × 12 mm · ${c.width} × ${HEAD_DOTS} dots`;
  }

  function field(label, input) { return h("label", { className: "field" }, h("span", { textContent: label }), input); }
  function inp(type, value, on, extra = {}) {
    const el = h("input", { type, ...extra });
    if (type === "checkbox") { el.checked = !!value; el.onchange = () => { on(el.checked); refresh(); }; }
    else { el.value = value ?? ""; el.oninput = () => { on(type === "number" || type === "range" ? +el.value : el.value); refresh(); }; }
    return el;
  }
  function sel(options, value, on) {
    const el = h("select");
    for (const o of options) el.append(h("option", { value: o.value ?? o, textContent: o.label ?? o }));
    el.value = value; el.onchange = () => { on(el.value); refresh(); renderEditor(); };
    return el;
  }

  function renderLabelPanel() {
    const L = design.label, p = $("#label-panel");
    p.replaceChildren(
      field("Length", sel([{ value: "auto", label: "Fit content" }, { value: "fixed", label: "Fixed" }], L.lengthMode, (v) => { L.lengthMode = v; renderLabelPanel(); })),
      ...(L.lengthMode === "fixed" ? [field("mm", inp("number", L.length, (v) => (L.length = v), { min: 5, max: 500, step: 1 }))] : []),
      field("Side padding (mm)", inp("number", L.pad, (v) => (L.pad = v), { min: 0, max: 20, step: 0.5 })),
      field("White on black", inp("checkbox", L.invert, (v) => (L.invert = v))),
    );
    const frames = $("#frames"); frames.replaceChildren();
    for (const f of Graphics.FRAMES) {
      const b = h("button", { className: "swatch" + (L.frame === f ? " on" : ""), title: f, type: "button" });
      const c = h("canvas", { width: 120, height: HEAD_DOTS }), cx = c.getContext("2d");
      cx.fillStyle = "#fff"; cx.fillRect(0, 0, 120, HEAD_DOTS); cx.fillStyle = "#000";
      Graphics.drawFrame(cx, f, 120, HEAD_DOTS, MARGIN);
      if (f === "none") { cx.font = "600 22px Inter"; cx.textAlign = "center"; cx.fillText("none", 60, 56); }
      b.append(c); b.onclick = () => { L.frame = f; renderLabelPanel(); refresh(); };
      frames.append(b);
    }
  }

  const BLOCK_NAMES = { text: "Text", icon: "Icon", image: "Picture", qr: "QR code", barcode: "Barcode", spacer: "Space" };

  function renderBlocks() {
    const list = $("#blocks"); list.replaceChildren();
    design.blocks.forEach((b, i) => {
      const summary = b.type === "text" ? fillVars(b.text).replace(/\n/g, " / ") : b.type === "icon" ? b.name : b.type === "qr" || b.type === "barcode" ? b.data : b.type === "spacer" ? `${b.mm || 3} mm` : "image";
      const row = h("div", { className: "block" + (i === selected ? " on" : "") },
        h("button", { className: "block-main", type: "button", onclick: () => { selected = i; renderBlocks(); renderEditor(); } },
          h("b", { textContent: BLOCK_NAMES[b.type] }), h("span", { textContent: summary })),
        h("button", { className: "icon-btn", type: "button", title: "Move left", textContent: "↑", disabled: i === 0, onclick: () => move(i, -1) }),
        h("button", { className: "icon-btn", type: "button", title: "Move right", textContent: "↓", disabled: i === design.blocks.length - 1, onclick: () => move(i, 1) }),
        h("button", { className: "icon-btn", type: "button", title: "Remove", textContent: "✕", onclick: () => { design.blocks.splice(i, 1); selected = Math.min(selected, design.blocks.length - 1); renderBlocks(); renderEditor(); refresh(); } }));
      list.append(row);
    });
  }
  function move(i, d) {
    const [b] = design.blocks.splice(i, 1); design.blocks.splice(i + d, 0, b); selected = i + d;
    renderBlocks(); renderEditor(); refresh();
  }
  function add(b) { design.blocks.push(b); selected = design.blocks.length - 1; renderBlocks(); renderEditor(); refresh(); }

  function renderEditor() {
    const ed = $("#editor"), b = design.blocks[selected];
    ed.replaceChildren();
    if (!b) { ed.append(h("p", { className: "hint", textContent: "Add a block to start." })); return; }
    const up = () => { renderBlocks(); };
    if (b.type === "text") {
      const ta = h("textarea", { rows: 3, value: b.text });
      ta.oninput = () => { b.text = ta.value; up(); refresh(); };
      ed.append(field("Text ({date}, {time} work too)", ta),
        h("div", { className: "row" },
          field("Font", sel(FONTS, b.font, (v) => (b.font = v))),
          field("Size", sel([{ value: 0, label: "Auto" }, ...[16, 20, 24, 28, 32, 40, 48, 56, 64, 72].map((s) => ({ value: s, label: s + " px" }))], b.size || 0, (v) => (b.size = +v)))),
        h("div", { className: "row" },
          field("Bold", inp("checkbox", b.bold, (v) => (b.bold = v))),
          field("Italic", inp("checkbox", b.italic, (v) => (b.italic = v))),
          field("Align", sel(["center", "left", "right"], b.align || "center", (v) => (b.align = v)))));
      ta.focus();
    } else if (b.type === "icon") {
      const grid = h("div", { className: "icons" });
      const search = h("input", { type: "search", placeholder: `Search ${Object.keys(Graphics.ICONS).length} icons (food, tools, pet…)`, className: "icon-search", value: iconQuery });
      const filter = () => {
        const q = search.value.trim().toLowerCase();
        iconQuery = search.value;
        for (const btn of grid.children) {
          const hay = btn.title + " " + (Graphics.ICON_TAGS[btn.title] || "");
          btn.hidden = !!q && !q.split(/\s+/).every((w) => hay.includes(w));
        }
      };
      search.oninput = filter;
      for (const name of Object.keys(Graphics.ICONS)) {
        const btn = h("button", { type: "button", className: "icon-pick" + (b.name === name ? " on" : ""), title: name });
        btn.innerHTML = Graphics.iconSvg(name).replace('width="240" height="240"', 'width="28" height="28"');
        btn.onclick = () => { b.name = name; renderEditor(); up(); refresh(); };
        grid.append(btn);
      }
      filter();
      ed.append(search, grid, h("div", { className: "row" },
        field("Size %", inp("range", b.scale || 100, (v) => (b.scale = v), { min: 30, max: 100 })),
        field("Inverted", inp("checkbox", b.invert, (v) => (b.invert = v)))));
    } else if (b.type === "image") {
      const file = h("input", { type: "file", accept: "image/*" });
      file.onchange = () => {
        const f = file.files[0]; if (!f) return;
        const r = new FileReader(); r.onload = () => { b.src = r.result; refresh(); }; r.readAsDataURL(f);
      };
      ed.append(field("Picture or logo", file), h("div", { className: "row" },
        field("Style", sel([{ value: "dither", label: "Photo (dither)" }, { value: "threshold", label: "Logo (sharp)" }], b.mode || "dither", (v) => (b.mode = v))),
        field("Invert", inp("checkbox", b.invert, (v) => (b.invert = v)))),
        field("Size %", inp("range", b.scale || 100, (v) => (b.scale = v), { min: 30, max: 100 })),
        field("Brightness", inp("range", b.brightness || 100, (v) => (b.brightness = v), { min: 40, max: 200 })),
        field("Contrast", inp("range", b.contrast || 100, (v) => (b.contrast = v), { min: 40, max: 300 })));
    } else if (b.type === "qr") {
      const ta = h("textarea", { rows: 2, value: b.data });
      ta.oninput = () => { b.data = ta.value; up(); refresh(); };
      const wifi = h("button", { type: "button", className: "ghost", textContent: "Wi-Fi helper…" });
      wifi.onclick = () => {
        const ssid = prompt("Network name (SSID)"); if (ssid == null) return;
        const pw = prompt("Password (empty for open network)") ?? "";
        const esc = (s) => s.replace(/([\\;,:"])/g, "\\$1");
        b.data = `WIFI:T:${pw ? "WPA" : "nopass"};S:${esc(ssid)};P:${esc(pw)};;`; renderEditor(); up(); refresh();
      };
      ed.append(field("QR content (URL, text…)", ta), wifi,
        h("p", { className: "hint", textContent: "A 12 mm tape fits roughly 40 characters before the QR modules get too small to scan." }));
    } else if (b.type === "barcode") {
      ed.append(field("Value", inp("text", b.data, (v) => { b.data = v; up(); })),
        h("div", { className: "row" },
          field("Format", sel(["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14"], b.format || "CODE128", (v) => (b.format = v))),
          field("Show text", inp("checkbox", b.text, (v) => (b.text = v)))));
    } else if (b.type === "spacer") {
      ed.append(field("Width (mm)", inp("number", b.mm || 3, (v) => { b.mm = v; up(); }, { min: 1, max: 100, step: 0.5 })));
    }
  }

  function renderTemplates() {
    const t = $("#templates"); t.replaceChildren();
    for (const tpl of Graphics.TEMPLATES) {
      t.append(h("button", { type: "button", className: "tpl", textContent: tpl.name, onclick: () => {
        design = { label: { ...defaultDesign().label, ...tpl.label }, blocks: JSON.parse(JSON.stringify(tpl.blocks)) };
        selected = design.blocks.findIndex((b) => b.type === "text"); if (selected < 0) selected = 0;
        renderAll();
      } }));
    }
  }

  function renderSettings() {
    const s = $("#print-settings");
    s.replaceChildren(
      field("Copies", inp("number", settings.copies, (v) => (settings.copies = Math.max(1, Math.min(99, v | 0))), { min: 1, max: 99 })),
      field("Darkness", sel([{ value: 1, label: "Light" }, { value: 2, label: "Normal" }, { value: 4, label: "Dark" }], settings.density, (v) => (settings.density = +v))),
      field("Vertical offset (dots)", inp("number", settings.offset, (v) => (settings.offset = Math.max(-24, Math.min(24, v | 0))), { min: -24, max: 24, step: 1 })),
      field("Feed after label (mm)", inp("number", settings.feed, (v) => (settings.feed = Math.max(0, Math.min(30, +v || 0))), { min: 0, max: 30, step: 1 })),
      field("Mirror output", inp("checkbox", settings.mirror, (v) => (settings.mirror = v))));
  }

  function renderAll() { renderLabelPanel(); renderBlocks(); renderEditor(); renderSettings(); refresh(); }

  function download(name, blob) {
    const a = h("a", { href: URL.createObjectURL(blob), download: name }); a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function init() {
    for (const [type, mk] of Object.entries({
      text: () => ({ type: "text", text: "Text", font: "Inter", bold: true, italic: false, size: 0 }),
      icon: () => ({ type: "icon", name: "star", scale: 100, invert: false }),
      image: () => ({ type: "image", src: "", mode: "dither", scale: 100 }),
      qr: () => ({ type: "qr", data: "https://example.com" }),
      barcode: () => ({ type: "barcode", data: "12345678", format: "CODE128", text: true }),
      spacer: () => ({ type: "spacer", mm: 3 }),
    })) $("#add").append(h("button", { type: "button", className: "ghost", textContent: "+ " + BLOCK_NAMES[type], onclick: () => add(mk()) }));

    $("#connect").onclick = () => (nas && !port ? nasStatus() : port ? disconnect() : connect());
    fetch("api/info", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((info) => {
      if (!info?.printer) return;
      nas = info; $("#connect").textContent = "Check printer"; $("#no-serial").hidden = true; drawStatus();
      nasStatus();
    }).catch(() => {});
    $("#print").onclick = print;
    $("#save-png").onclick = async () => { const c = await render(h("canvas")); c.toBlob((b) => download("label.png", b)); };
    $("#save-bin").onclick = async () => download("label.bin", new Blob([await makeJob()]));
    $("#save-json").onclick = () => download("label.json", new Blob([JSON.stringify(design, null, 2)], { type: "application/json" }));
    $("#load-json").onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { const d = JSON.parse(t); if (d.blocks) { design = d; selected = 0; renderAll(); } } catch { toast("Not a label file"); } });
    };
    $("#calibrate").onclick = () => {
      toast("Printing calibration strip: steps 1 (top) to 12 (bottom). Count which steps you can see.");
      print(calibrationCanvas());
    };
    $("#test").onclick = () => {
      design = { label: { ...defaultDesign().label, frame: "box" }, blocks: [{ type: "icon", name: "arrow", scale: 100 }, { type: "text", text: "TEST Fg 123", font: "Inter", bold: true, size: 0 }] };
      selected = 1; renderAll();
      toast("Text should read normally. If it comes out mirrored, tick “Mirror output”; if the end is cut off, raise “Feed after label”.");
    };
    if (navigator.serial) navigator.serial.addEventListener("disconnect", (e) => { if (e.target === port) disconnect(); });
    if (!("serial" in navigator)) $("#no-serial").hidden = false;
    renderTemplates(); drawStatus();
    document.fonts.ready.then(renderAll);
    Promise.all(FONTS.map((f) => document.fonts.load(`700 40px "${f}"`).catch(() => {}))).then(refresh);
    renderAll();
  }

  init();
})();
