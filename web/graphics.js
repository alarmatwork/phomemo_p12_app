/* Original icon set, frames and starter templates for 12 mm labels.
 * Icons are 24x24 SVG drawn black-on-transparent so they threshold cleanly. */
(function (root) {
  const S = 'fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const F = 'fill="#000"';

  function starPoints(cx, cy, R, r, n = 5) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const rad = i % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(2) + "," + (cy + rad * Math.sin(a)).toFixed(2));
    }
    return pts.join(" ");
  }

  const ICONS = {
    heart: `<path ${F} d="M12 21 L3.6 12.6 A4.6 4.6 0 0 1 12 6.4 A4.6 4.6 0 0 1 20.4 12.6 Z"/>`,
    star: `<polygon ${F} points="${starPoints(12, 12.6, 10.5, 4.4)}"/>`,
    sparkle: `<path ${F} d="M12 2 C12.8 8 16 11.2 22 12 C16 12.8 12.8 16 12 22 C11.2 16 8 12.8 2 12 C8 11.2 11.2 8 12 2Z"/>`,
    home: `<path ${S} d="M3 11 L12 3.5 L21 11"/><path ${S} d="M5.5 9.5 V20.5 H18.5 V9.5"/><rect ${F} x="10" y="14" width="4" height="6.5"/>`,
    wifi: `<path ${S} d="M2.5 9 A13.5 13.5 0 0 1 21.5 9"/><path ${S} d="M6 12.8 A8.5 8.5 0 0 1 18 12.8"/><path ${S} d="M9.4 16.4 A3.6 3.6 0 0 1 14.6 16.4"/><circle ${F} cx="12" cy="20" r="1.7"/>`,
    phone: `<rect ${S} x="6.5" y="2" width="11" height="20" rx="2.2"/><circle ${F} cx="12" cy="18.3" r="1.3"/>`,
    mail: `<rect ${S} x="2.5" y="5" width="19" height="14" rx="1.5"/><path ${S} d="M3 6 L12 13 L21 6"/>`,
    plug: `<path ${S} d="M9 2.5 V7 M15 2.5 V7"/><path ${S} d="M6.5 7 H17.5 V11 A5.5 5.5 0 0 1 6.5 11 Z"/><path ${S} d="M12 16.5 V21.5"/>`,
    bolt: `<polygon ${F} points="13.5,1.5 4.5,13.5 11,13.5 9.5,22.5 19.5,9.5 12.8,9.5"/>`,
    snowflake: `<g ${S}><path d="M12 2 V22 M3.3 7 L20.7 17 M3.3 17 L20.7 7"/><path d="M9.5 3.8 L12 6 L14.5 3.8 M9.5 20.2 L12 18 L14.5 20.2"/></g>`,
    flame: `<path ${F} d="M12 22 C7 22 4.5 18.6 4.5 15 C4.5 10.5 8.5 8.6 9 4 C11.8 5.8 13 8.4 12.6 11 C14 10.4 15 9 15.2 7.4 C18 9.6 19.5 12.4 19.5 15 C19.5 18.6 17 22 12 22Z"/>`,
    leaf: `<path ${F} d="M4 20 C4 10 9.5 4 21 3.5 C20.5 15 14 20 6.5 20 Z"/><path fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" d="M5.5 18.5 C9 14 12.5 10.5 17 7"/>`,
    cup: `<path ${S} d="M4 8 H16.5 V15 A5 5 0 0 1 11.5 20 H9 A5 5 0 0 1 4 15 Z"/><path ${S} d="M16.5 10 H18 A2.5 2.5 0 0 1 18 15 H16.5"/><path ${S} d="M8 2.5 C7 4 9 4.5 8 6 M12 2.5 C11 4 13 4.5 12 6"/>`,
    warning: `<path ${F} d="M12 2.2 L22.8 21 H1.2 Z"/><rect fill="#fff" x="10.9" y="8.5" width="2.2" height="7" rx="1"/><circle fill="#fff" cx="12" cy="18" r="1.3"/>`,
    check: `<circle ${F} cx="12" cy="12" r="10.5"/><path fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M6.8 12.5 L10.4 16 L17.4 8.5"/>`,
    cross: `<circle ${F} cx="12" cy="12" r="10.5"/><path fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" d="M8 8 L16 16 M16 8 L8 16"/>`,
    arrow: `<path ${S} d="M3 12 H20 M13.5 5.5 L20 12 L13.5 18.5"/>`,
    note: `<path ${S} d="M9 18 V4.5 L20 2.5 V16"/><ellipse ${F} cx="6.5" cy="18" rx="3.2" ry="2.6"/><ellipse ${F} cx="17.5" cy="16" rx="3.2" ry="2.6"/>`,
    gift: `<rect ${S} x="3" y="9" width="18" height="12" rx="1"/><path ${S} d="M2.5 9 H21.5 M12 9 V21"/><path ${S} d="M12 8.5 C9.5 3 5 4.5 7.5 8.5 M12 8.5 C14.5 3 19 4.5 16.5 8.5"/>`,
    cake: `<rect ${S} x="3.5" y="11" width="17" height="10" rx="1.5"/><path ${S} d="M3.5 15 C6 16.5 8 13.5 12 15 C16 16.5 18 13.5 20.5 15"/><path ${S} d="M12 11 V7"/><path ${F} d="M12 2 C13.5 4 13.2 5.6 12 5.6 C10.8 5.6 10.5 4 12 2Z"/>`,
    paw: `<ellipse ${F} cx="12" cy="16.5" rx="5" ry="4.2"/><ellipse ${F} cx="5" cy="10.5" rx="2.1" ry="2.7"/><ellipse ${F} cx="9.2" cy="6" rx="2.1" ry="2.8"/><ellipse ${F} cx="14.8" cy="6" rx="2.1" ry="2.8"/><ellipse ${F} cx="19" cy="10.5" rx="2.1" ry="2.7"/>`,
    key: `<circle ${S} cx="7.5" cy="12" r="4.5"/><path ${S} d="M12 12 H22 M18 12 V15.5 M21 12 V14.5"/>`,
    bulb: `<path ${S} d="M8.5 16 C8.5 13.5 5.5 12 5.5 8.5 A6.5 6.5 0 0 1 18.5 8.5 C18.5 12 15.5 13.5 15.5 16 Z"/><path ${S} d="M9 19 H15 M10 22 H14"/>`,
    box: `<path ${S} d="M12 2.5 L21 7 V17 L12 21.5 L3 17 V7 Z"/><path ${S} d="M3 7 L12 11.5 L21 7 M12 11.5 V21.5"/>`,
    calendar: `<rect ${S} x="3" y="4.5" width="18" height="16.5" rx="1.5"/><path ${S} d="M3 9.5 H21 M8 2.5 V6.5 M16 2.5 V6.5"/><rect ${F} x="6.5" y="12.5" width="3" height="3"/><rect ${F} x="10.5" y="12.5" width="3" height="3"/><rect ${F} x="14.5" y="12.5" width="3" height="3"/>`,
    sun: `<circle ${F} cx="12" cy="12" r="4.6"/><g ${S}><path d="M12 1.5 V4 M12 20 V22.5 M1.5 12 H4 M20 12 H22.5 M4.6 4.6 L6.3 6.3 M17.7 17.7 L19.4 19.4 M4.6 19.4 L6.3 17.7 M17.7 6.3 L19.4 4.6"/></g>`,
    moon: `<path ${F} d="M20.5 15.5 A9.5 9.5 0 0 1 8.5 3.5 A9.5 9.5 0 1 0 20.5 15.5Z"/>`,
    scissors: `<circle ${S} cx="6" cy="6.5" r="3"/><circle ${S} cx="6" cy="17.5" r="3"/><path ${S} d="M8.5 8.2 L21 18 M8.5 15.8 L21 6"/>`,
    pin: `<path ${F} d="M12 22 C12 22 4.5 14 4.5 9.5 A7.5 7.5 0 0 1 19.5 9.5 C19.5 14 12 22 12 22Z"/><circle fill="#fff" cx="12" cy="9.5" r="2.8"/>`,
    lock: `<rect ${F} x="4" y="10.5" width="16" height="11" rx="2"/><path ${S} d="M7.5 10.5 V7.5 A4.5 4.5 0 0 1 16.5 7.5 V10.5"/><circle fill="#fff" cx="12" cy="16" r="1.8"/>`,
    tools: `<path ${S} d="M14.5 3 A5 5 0 0 0 9.8 9.8 L3 16.6 A2 2 0 0 0 7.4 21 L14.2 14.2 A5 5 0 0 0 21 9.5 L17.8 12.6 L14 11.2 L12.6 7.4 Z"/>`,
    drop: `<path ${F} d="M12 2 C12 2 5 10 5 14.5 A7 7 0 0 0 19 14.5 C19 10 12 2 12 2Z"/>`,
    smile: `<circle ${S} cx="12" cy="12" r="9.8"/><circle ${F} cx="8.6" cy="9.5" r="1.4"/><circle ${F} cx="15.4" cy="9.5" r="1.4"/><path ${S} d="M7.8 14 A4.8 4.8 0 0 0 16.2 14"/>`,
    crown: `<path ${F} d="M2.5 7 L7.5 12 L12 4.5 L16.5 12 L21.5 7 L19.5 19 H4.5 Z"/>`,
    flower: `<g ${F}><circle cx="12" cy="6" r="3.6"/><circle cx="17.7" cy="10.2" r="3.6"/><circle cx="15.5" cy="17" r="3.6"/><circle cx="8.5" cy="17" r="3.6"/><circle cx="6.3" cy="10.2" r="3.6"/></g><circle fill="#fff" cx="12" cy="12" r="2.6"/>`,
    recycle: `<g ${S}><path d="M7.5 9.5 L10.5 4.5 Q12 2.5 13.5 4.5 L15.5 8"/><path d="M17.5 11.5 L20.5 16.5 Q21.5 19 19 19 H15"/><path d="M11 19 H5 Q2.5 19 3.5 16.5 L5 14"/></g><g ${F}><polygon points="14,8.5 17.8,9.4 18.5,5.6"/><polygon points="15.5,16.2 13,19 15.5,21.8"/><polygon points="3,13.8 6.6,12.4 7.6,16"/></g>`,
  };

  function iconSvg(name, invert = false) {
    let body = ICONS[name] || ICONS.star;
    if (invert) body = body.replace(/#000/g, "#TMP").replace(/#fff/g, "#000").replace(/#TMP/g, "#fff");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="240" height="240">${body}</svg>`;
  }

  const FRAMES = ["none", "box", "rounded", "double", "dashed", "dotted", "tag", "ribbon", "brackets", "stars", "scallop", "pill"];

  /** Draw frame on ctx for a W x H label; m = top/bottom margin. Returns horizontal inset for content. */
  function drawFrame(ctx, style, W, H, m) {
    const top = m - 2, bot = H - m + 2, ink = ctx.fillStyle;
    ctx.lineWidth = 3;
    ctx.strokeStyle = ink;
    const rect = (x, y, w, h) => ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    switch (style) {
      case "box": rect(1, top, W - 2, bot - top); return 10;
      case "rounded": ctx.beginPath(); ctx.roundRect(2.5, top + 1.5, W - 5, bot - top - 3, 18); ctx.stroke(); return 14;
      case "pill": ctx.beginPath(); ctx.roundRect(2.5, top + 1.5, W - 5, bot - top - 3, (bot - top) / 2); ctx.stroke(); return (bot - top) / 3;
      case "double":
        ctx.lineWidth = 2; ctx.strokeRect(2, top + 1, W - 4, bot - top - 2);
        ctx.lineWidth = 1; ctx.strokeRect(6.5, top + 5.5, W - 13, bot - top - 11); return 12;
      case "dashed": ctx.setLineDash([9, 6]); rect(1, top, W - 2, bot - top); ctx.setLineDash([]); return 10;
      case "dotted":
        for (let x = 5; x < W - 3; x += 9) { dot(ctx, x, top + 2.5, 2.4); dot(ctx, x, bot - 2.5, 2.4); }
        for (let y = top + 11; y < bot - 6; y += 9) { dot(ctx, 4, y, 2.4); dot(ctx, W - 4, y, 2.4); }
        return 12;
      case "tag": {
        const h = bot - top, mid = (top + bot) / 2, tip = h * 0.32;
        ctx.beginPath(); ctx.moveTo(2, mid); ctx.lineTo(tip, top + 1.5); ctx.lineTo(W - 2.5, top + 1.5);
        ctx.lineTo(W - 2.5, bot - 1.5); ctx.lineTo(tip, bot - 1.5); ctx.closePath(); ctx.stroke();
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tip * 0.62, mid, 4, 0, Math.PI * 2); ctx.stroke();
        return tip + 6;
      }
      case "ribbon": {
        const n = 12, mid = (top + bot) / 2;
        ctx.fillRect(0, top, W, 3); ctx.fillRect(0, bot - 3, W, 3);
        ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(n, mid); ctx.lineTo(0, bot); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W, top); ctx.lineTo(W - n, mid); ctx.lineTo(W, bot); ctx.stroke();
        return n + 6;
      }
      case "brackets": {
        const l = 14; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(l, top + 2); ctx.lineTo(2, top + 2); ctx.lineTo(2, bot - 2); ctx.lineTo(l, bot - 2);
        ctx.moveTo(W - l, top + 2); ctx.lineTo(W - 2, top + 2); ctx.lineTo(W - 2, bot - 2); ctx.lineTo(W - l, bot - 2);
        ctx.stroke(); return 10;
      }
      case "stars": {
        const step = 16;
        for (let x = 8; x < W - 4; x += step) { star(ctx, x, top + 4, 4.5); star(ctx, x + step / 2, bot - 4, 4.5); }
        return 8;
      }
      case "scallop": {
        const r = 4; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < W; x += r * 2) { ctx.moveTo(x, top); ctx.arc(x + r, top, r, Math.PI, 0, true); }
        ctx.stroke(); ctx.beginPath();
        for (let x = 0; x < W; x += r * 2) { ctx.moveTo(x, bot); ctx.arc(x + r, bot, r, Math.PI, 0, false); }
        ctx.stroke(); return 8;
      }
    }
    return 0;
  }

  /** How much vertical room a frame takes inside the 84-dot band (per side). */
  function frameVInset(style) {
    return { none: 0, stars: 9, scallop: 6, dotted: 6, double: 7 }[style] ?? (style === "none" ? 0 : 5);
  }

  function dot(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function star(ctx, cx, cy, R) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.42 : R;
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
  }

  // Starter templates. {date} in text is replaced with today's date at print time.
  const T = (text, extra = {}) => ({ type: "text", text, font: "Inter", bold: true, italic: false, size: 0, ...extra });
  const I = (name, extra = {}) => ({ type: "icon", name, scale: 100, invert: false, ...extra });
  const TEMPLATES = [
    { name: "Pantry jar", label: { frame: "rounded" }, blocks: [I("leaf"), T("Basil")] },
    { name: "Spice", label: { frame: "pill" }, blocks: [T("SMOKED\nPAPRIKA", { font: "Bebas Neue" })] },
    { name: "Freezer", label: { frame: "dashed" }, blocks: [I("snowflake"), T("Soup\n{date}")] },
    { name: "Cable", label: { frame: "tag" }, blocks: [I("plug", { scale: 80 }), T("Router")] },
    { name: "Wi-Fi", label: { frame: "box" }, blocks: [{ type: "qr", data: "WIFI:T:WPA;S:MyNetwork;P:password;;" }, T("Guest Wi-Fi\nMyNetwork", { bold: false })] },
    { name: "Name tag", label: { frame: "stars" }, blocks: [T("Emma", { font: "Pacifico", bold: false })] },
    { name: "Fragile", label: { frame: "none", invert: true }, blocks: [I("warning"), T("FRAGILE", { font: "Bebas Neue" }), I("warning")] },
    { name: "Price", label: { frame: "tag" }, blocks: [T("€4.99", { font: "Space Grotesk" })] },
    { name: "Address", label: { frame: "none" }, blocks: [I("home", { scale: 70 }), T("Jane Doe\nMain St 1, Tallinn", { bold: false })] },
    { name: "Party", label: { frame: "scallop" }, blocks: [I("gift"), T("Happy Birthday!", { font: "Caveat" }), I("cake")] },
    { name: "Pet", label: { frame: "rounded" }, blocks: [I("paw"), T("Milo\n+372 5555 5555", { bold: false })] },
    { name: "Asset", label: { frame: "brackets" }, blocks: [{ type: "barcode", data: "INV-00042", format: "CODE128", text: true }] },
    { name: "Keys", label: { frame: "ribbon" }, blocks: [I("key"), T("Garage")] },
    { name: "Garden", label: { frame: "double" }, blocks: [I("flower"), T("Tomato\nSown {date}", { font: "Caveat", bold: true })] },
  ];

  root.Graphics = { ICONS, iconSvg, FRAMES, drawFrame, frameVInset, TEMPLATES };
})(window);
