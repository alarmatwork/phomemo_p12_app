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

  // White detail strokes on black shapes (swapped automatically when inverted).
  const Wt = 'fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const thick = (w) => `fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

  Object.assign(ICONS, {
    // food & kitchen
    apple: `<path ${F} d="M12 7.5 C9 5.5 4.5 6.5 4.5 12 C4.5 17 8 21.5 10.5 21.5 C11.3 21.5 11.6 21 12 21 C12.4 21 12.7 21.5 13.5 21.5 C16 21.5 19.5 17 19.5 12 C19.5 6.5 15 5.5 12 7.5Z"/><path ${S} d="M12 7 C12 5 13 3.5 14.5 2.5"/>`,
    carrot: `<path ${F} d="M3 21 L9 8.5 C10.5 5.8 14.5 6 16 7.5 C17.6 9 17.8 13 15.5 15 Z"/><path ${S} d="M15.8 7.8 L19.5 4 M16.8 9 L21.5 8 M14.8 6.8 L15.2 2.5"/><path ${Wt} d="M7.6 13.6 L9.6 14.8 M10 9.8 L12.2 11"/>`,
    fish: `<path ${F} d="M2.5 12 C5.5 6.5 12 6 17 12 C12 18 5.5 17.5 2.5 12Z"/><path ${F} d="M16 12 L22 7 V17 Z"/><circle fill="#fff" cx="7" cy="11" r="1.3"/>`,
    drumstick: `<path ${F} d="M14 3 A7 7 0 0 1 20.5 13 C19 16 15.5 15.5 13.5 14.5 L10 18 A2.4 2.4 0 1 1 6.6 20.8 A2.4 2.4 0 1 1 4 17.4 L7.5 13.8 C6.5 11.5 6 8 9 5 C10.5 3.6 12.3 3 14 3Z"/>`,
    egg: `<path ${F} d="M12 2.5 C16 2.5 19 9.5 19 14.5 A7 7 0 0 1 5 14.5 C5 9.5 8 2.5 12 2.5Z"/>`,
    bread: `<path ${S} d="M4.5 10 C2 10 2 5 7 5 H17 C22 5 22 10 19.5 10 V20 H4.5 Z"/><path ${S} d="M9 10 V14 M14 10 V14"/>`,
    cheese: `<path ${F} d="M2.5 11 L16.5 4.5 L21.5 11 V19.5 H2.5 Z"/><circle fill="#fff" cx="7" cy="14.8" r="1.7"/><circle fill="#fff" cx="12.8" cy="16.2" r="1.2"/><circle fill="#fff" cx="16.6" cy="13.2" r="1.4"/>`,
    milk: `<path ${S} d="M9 2.5 H15 M9.5 2.5 V6 L7 9.5 V21.5 H17 V9.5 L14.5 6 V2.5"/><path ${F} d="M7 13 H17 V21.5 H7Z"/>`,
    jar: `<rect ${F} x="6" y="2.5" width="12" height="4" rx="1"/><path ${S} d="M7 8.5 H17 C18.5 8.5 19 9.5 19 11 V19.5 A2 2 0 0 1 17 21.5 H7 A2 2 0 0 1 5 19.5 V11 C5 9.5 5.5 8.5 7 8.5Z"/><path ${S} d="M9 15 H15"/>`,
    cutlery: `<path ${S} d="M5 2.5 V8 A3 3 0 0 0 11 8 V2.5 M8 2.5 V21.5"/><path ${S} d="M18 21.5 V2.5 C20.5 4.5 21 9.5 20.5 13 H18"/>`,
    wine: `<path ${S} d="M7 2.5 H17 L16.6 8 A4.6 4.6 0 0 1 7.4 8 Z"/><path ${F} d="M7.2 6 H16.8 L16.6 8 A4.6 4.6 0 0 1 7.4 8Z"/><path ${S} d="M12 12.8 V20.5 M8 21 H16"/>`,
    chili: `<path ${F} d="M5 20.5 C11 20.5 18 15 18.5 8 C18.6 6.5 16.2 6 15.3 7.3 C13 12 9 15.5 4.5 17 C3 17.5 3.2 20.5 5 20.5Z"/><path ${S} d="M17 7 C17 5 18 3.5 20 3"/>`,
    icecream: `<path ${F} d="M6.8 11 L12 22 L17.2 11Z"/><circle ${F} cx="12" cy="7.5" r="5"/><path ${Wt} d="M6.5 11.2 H17.5"/>`,
    pizza: `<path ${F} d="M12 22 L3 5.5 C8.5 2 15.5 2 21 5.5Z"/><path ${Wt} d="M4.6 8.3 C9.5 5.6 14.5 5.6 19.4 8.3"/><circle fill="#fff" cx="12" cy="11" r="1.6"/><circle fill="#fff" cx="9" cy="14" r="1.2"/><circle fill="#fff" cx="14" cy="15.5" r="1.2"/>`,
    // electronics & office
    battery: `<rect ${S} x="2.5" y="7" width="17" height="10" rx="1.8"/><rect ${F} x="20.4" y="10" width="2.2" height="4" rx=".6"/><rect ${F} x="5" y="9.5" width="8.5" height="5"/>`,
    usb: `<path ${S} d="M12 4 V19"/><circle ${F} cx="12" cy="19.5" r="2.5"/><path ${S} d="M12 13.5 L7 10 V7.5 M12 16 L17 12.5 V10"/><polygon ${F} points="12,1.2 9.6,5 14.4,5"/><circle ${F} cx="7" cy="6.3" r="1.7"/><rect ${F} x="15.3" y="7.3" width="3.4" height="3.4"/>`,
    laptop: `<rect ${S} x="4.5" y="4" width="15" height="11" rx="1.2"/><path ${F} d="M1.8 17.5 H22.2 L20.5 20.5 H3.5Z"/>`,
    monitor: `<rect ${S} x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path ${S} d="M8.5 21 H15.5 M12 16.5 V21"/>`,
    printer: `<rect ${S} x="6.5" y="2.5" width="11" height="5"/><rect ${F} x="2.5" y="7.5" width="19" height="9.5" rx="1.5"/><rect fill="#fff" stroke="#000" stroke-width="2.2" stroke-linejoin="round" x="6.5" y="13" width="11" height="8.5"/><path ${S} d="M9 17.2 H15"/>`,
    camera: `<path ${F} d="M3 7.5 H7.5 L9.3 4.5 H14.7 L16.5 7.5 H21 A1.5 1.5 0 0 1 22.5 9 V18.5 A1.5 1.5 0 0 1 21 20 H3 A1.5 1.5 0 0 1 1.5 18.5 V9 A1.5 1.5 0 0 1 3 7.5Z"/><circle fill="#fff" cx="12" cy="13.5" r="4.4"/><circle ${F} cx="12" cy="13.5" r="2.4"/>`,
    headphones: `<path ${S} d="M3.5 16 V12 A8.5 8.5 0 0 1 20.5 12 V16"/><rect ${F} x="2.5" y="13.5" width="5" height="8" rx="1.5"/><rect ${F} x="16.5" y="13.5" width="5" height="8" rx="1.5"/>`,
    gamepad: `<path ${F} d="M7 6.5 H17 A5 5 0 0 1 21.9 12.3 L21 17.5 A2.6 2.6 0 0 1 16.5 18.8 L14.6 16 H9.4 L7.5 18.8 A2.6 2.6 0 0 1 3 17.5 L2.1 12.3 A5 5 0 0 1 7 6.5Z"/><path ${Wt} d="M5.5 11.5 H9.5 M7.5 9.5 V13.5"/><circle fill="#fff" cx="15.6" cy="10.4" r="1.2"/><circle fill="#fff" cx="17.8" cy="12.8" r="1.2"/>`,
    bluetooth: `<path ${S} d="M6.5 7.5 L17 16.5 L12 21 V3 L17 7.5 L6.5 16.5"/>`,
    book: `<path ${S} d="M2.5 4.5 H8.5 A3.5 3.5 0 0 1 12 8 V20.5 A2.5 2.5 0 0 0 9.5 18 H2.5Z"/><path ${S} d="M21.5 4.5 H15.5 A3.5 3.5 0 0 0 12 8 V20.5 A2.5 2.5 0 0 1 14.5 18 H21.5Z"/>`,
    pencil: `<path ${F} d="M15.5 3.5 L20.5 8.5 L8.5 20.5 L3 21 L3.5 15.5Z"/><path ${Wt} d="M13.3 5.7 L18.3 10.7"/>`,
    paperclip: `<path ${S} d="M16.5 8.5 V16 A4.5 4.5 0 0 1 7.5 16 V6.5 A3 3 0 0 1 13.5 6.5 V15.5 A1.5 1.5 0 0 1 10.5 15.5 V9"/>`,
    folder: `<path ${F} d="M2.5 6 A1.5 1.5 0 0 1 4 4.5 H9.5 L11.5 7 H20 A1.5 1.5 0 0 1 21.5 8.5 V18.5 A1.5 1.5 0 0 1 20 20 H4 A1.5 1.5 0 0 1 2.5 18.5Z"/>`,
    document: `<path ${S} d="M6 2.5 H14 L19 7.5 V21.5 H6Z"/><path ${S} d="M14 2.5 V7.5 H19 M9 12 H16 M9 15.5 H16 M9 19 H13"/>`,
    clock: `<circle ${S} cx="12" cy="12" r="9.8"/><path ${S} d="M12 6.5 V12 L15.5 14.5"/>`,
    bell: `<path ${F} d="M12 2.5 A1.5 1.5 0 0 1 13.5 4 A6 6 0 0 1 18 10 V15 L20.5 18 H3.5 L6 15 V10 A6 6 0 0 1 10.5 4 A1.5 1.5 0 0 1 12 2.5Z"/><path ${F} d="M9.5 19.3 A2.5 2.5 0 0 0 14.5 19.3Z"/>`,
    // home & shopping
    trash: `<path ${S} d="M3.5 6 H20.5 M9 6 V3.5 H15 V6"/><path ${S} d="M5.5 6 L6.7 21 H17.3 L18.5 6"/><path ${S} d="M10 10 V17 M14 10 V17"/>`,
    tag: `<path ${F} d="M2.5 12.5 V4 A1.5 1.5 0 0 1 4 2.5 H12.5 L21.5 11.5 L11.5 21.5Z"/><circle fill="#fff" cx="7.5" cy="7.5" r="1.9"/>`,
    cart: `<path ${S} d="M2 3 H5 L7.5 15.5 H18.5 L21 7 H6"/><circle ${F} cx="9" cy="19.5" r="1.9"/><circle ${F} cx="17" cy="19.5" r="1.9"/>`,
    bag: `<path ${F} d="M4.5 8 H19.5 L20.5 21.5 H3.5Z"/><path ${S} d="M8.5 10 V6.5 A3.5 3.5 0 0 1 15.5 6.5 V10"/>`,
    euro: `<path ${thick(2.6)} d="M18.5 6 A7.5 7.5 0 1 0 18.5 18"/><path ${S} d="M3.5 10 H13 M3.5 14 H13"/>`,
    shirt: `<path ${F} d="M8.5 3 L3 6 L1.8 11 L5.5 12 V21 H18.5 V12 L22.2 11 L21 6 L15.5 3 C15 5 13.5 6 12 6 C10.5 6 9 5 8.5 3Z"/>`,
    washer: `<rect ${S} x="4" y="2.5" width="16" height="19" rx="2"/><path ${S} d="M4 7 H20"/><circle ${S} cx="12" cy="14.2" r="4.2"/><circle ${F} cx="7" cy="4.8" r="1"/>`,
    bed: `<path ${S} d="M2.5 5 V20 M2.5 16 H21.5 V20 M21.5 16 V12.5 A2 2 0 0 0 19.5 10.5 H10.5 V16"/><circle ${F} cx="6.5" cy="12.5" r="2.3"/>`,
    // tools
    hammer: `<g ${F} transform="rotate(-45 12 12)"><rect x="6" y="2" width="12" height="5.5" rx="1.2"/><rect x="10.7" y="6.5" width="2.6" height="16" rx="1.3"/></g>`,
    screwdriver: `<g ${F} transform="rotate(45 12 12)"><rect x="9.4" y="1.5" width="5.2" height="9" rx="1.8"/><rect x="11.1" y="10" width="1.8" height="10"/><path d="M11.1 20 H12.9 L12.5 22.5 H11.5Z"/></g>`,
    ruler: `<g transform="rotate(-45 12 12)"><rect ${S} x="1.5" y="8" width="21" height="8" rx="1"/><path ${S} d="M6 8 V11.5 M10 8 V12.5 M14 8 V11.5 M18 8 V12.5"/></g>`,
    magnet: `<path ${thick(4.6)} d="M6.8 3 V12 A5.2 5.2 0 0 0 17.2 12 V3"/><path fill="none" stroke="#fff" stroke-width="1.6" d="M4 7 H9.6 M14.4 7 H20"/>`,
    gear: `<g ${F}>${[0, 45, 90, 135].map((a) => `<rect x="10" y="1.5" width="4" height="21" rx="1" transform="rotate(${a} 12 12)"/>`).join("")}<circle cx="12" cy="12" r="7.6"/></g><circle fill="#fff" cx="12" cy="12" r="3"/>`,
    // garden & nature
    tree: `<path ${F} d="M12 2 L19 11 H15.5 L20.5 17 H3.5 L8.5 11 H5Z"/><rect ${F} x="10.8" y="16" width="2.4" height="6"/>`,
    sprout: `<path ${S} d="M12 22 V11"/><path ${F} d="M12 12.5 C12 7.5 9 5 3.5 5 C3.5 10 6.5 12.5 12 12.5Z"/><path ${F} d="M12 10 C12 6 14.5 3 20.5 3 C20.5 7.5 17.5 10 12 10Z"/>`,
    cactus: `<rect ${F} x="9.5" y="2.5" width="5" height="17" rx="2.5"/><path ${thick(2.8)} d="M9.5 13 H7.2 A2 2 0 0 1 5.2 11 V7.5 M14.5 11 H16.8 A2 2 0 0 0 18.8 9 V6"/><path ${F} d="M5 18.5 H19 L17.3 22.5 H6.7Z"/>`,
    mushroom: `<path ${F} d="M2.5 12 A9.5 8.5 0 0 1 21.5 12Z"/><path ${F} d="M9 13.2 H15 L15.8 20 A1.8 1.8 0 0 1 14 22 H10 A1.8 1.8 0 0 1 8.2 20Z"/><circle fill="#fff" cx="8" cy="8.5" r="1.5"/><circle fill="#fff" cx="14.5" cy="6.5" r="1.3"/><circle fill="#fff" cx="17" cy="10" r="1"/>`,
    cloud: `<path ${F} d="M7 19 A4.5 4.5 0 0 1 6.3 10 A6 6 0 0 1 17.6 8.6 A5.2 5.2 0 0 1 17.5 19Z"/>`,
    umbrella: `<path ${F} d="M2 12.5 A10 10 0 0 1 22 12.5Z"/><path ${S} d="M12 12 V19 A2 2 0 0 1 8 19"/>`,
    cat: `<path ${F} d="M4 3 L9 7.5 H15 L20 3 V13 A8 8 0 0 1 4 13Z"/><circle fill="#fff" cx="9" cy="12.5" r="1.4"/><circle fill="#fff" cx="15" cy="12.5" r="1.4"/><path fill="#fff" d="M10.8 15.5 H13.2 L12 16.9Z"/>`,
    bone: `<g ${F} transform="rotate(-45 12 12)"><rect x="5" y="10" width="14" height="4"/><circle cx="5" cy="9.6" r="2.8"/><circle cx="5" cy="14.4" r="2.8"/><circle cx="19" cy="9.6" r="2.8"/><circle cx="19" cy="14.4" r="2.8"/></g>`,
    // travel
    car: `<path ${F} d="M3 16.5 V12.5 L5.3 7.2 A2 2 0 0 1 7.1 6 H16.9 A2 2 0 0 1 18.7 7.2 L21 12.5 V16.5Z"/><path fill="#fff" d="M6.6 11.5 L7.9 8.3 H16.1 L17.4 11.5Z"/><circle ${F} stroke="#fff" stroke-width="1.4" cx="7" cy="17.5" r="2.8"/><circle ${F} stroke="#fff" stroke-width="1.4" cx="17" cy="17.5" r="2.8"/>`,
    bike: `<circle ${S} cx="5.5" cy="16" r="4"/><circle ${S} cx="18.5" cy="16" r="4"/><path ${S} d="M5.5 16 L9 8.5 H16 L18.5 16 M9 8.5 L12.5 16 H5.5 M16 8.5 L12.5 16 M7.5 6 H10.5 M16 8.5 L15 5 H17.5"/>`,
    plane: `<path ${F} d="M21 3 C20 2 18.5 2.3 17.6 3.2 L14 6.8 L4.5 4 L2.8 5.7 L10.6 10.2 L7.2 13.6 L4.2 13.2 L3 14.4 L6.6 16.4 L8.6 20 L9.8 18.8 L9.4 15.8 L12.8 12.4 L17.3 20.2 L19 18.5 L16.2 9 L19.8 5.4 C20.7 4.5 22 4 21 3Z"/>`,
    globe: `<circle ${S} cx="12" cy="12" r="9.8"/><path ${S} d="M2.5 12 H21.5 M12 2.2 C8.5 6 8.5 18 12 21.8 M12 2.2 C15.5 6 15.5 18 12 21.8"/>`,
    anchor: `<circle ${S} cx="12" cy="4.8" r="2.3"/><path ${S} d="M12 7 V21 M7.5 11 H16.5 M3.5 13.5 A8.5 8.5 0 0 0 20.5 13.5"/>`,
    suitcase: `<rect ${F} x="2.5" y="7" width="19" height="13.5" rx="2"/><path ${S} d="M9 7 V4.5 H15 V7"/><path ${Wt} d="M7.5 8 V19.5 M16.5 8 V19.5"/>`,
    // health & people
    medical: `<rect ${F} x="2.5" y="2.5" width="19" height="19" rx="3"/><path fill="#fff" d="M10 6 H14 V10 H18 V14 H14 V18 H10 V14 H6 V10 H10Z"/>`,
    pill: `<g transform="rotate(-45 12 12)"><rect ${S} x="3" y="8" width="18" height="8" rx="4"/><path ${F} d="M12 8 H17 A4 4 0 0 1 17 16 H12Z"/></g>`,
    thermometer: `<path ${S} d="M14.5 13.5 V5 A2.5 2.5 0 0 0 9.5 5 V13.5 A4.5 4.5 0 1 0 14.5 13.5Z"/><circle ${F} cx="12" cy="17" r="2.4"/><path ${S} d="M12 9 V16"/>`,
    person: `<circle ${F} cx="12" cy="6.5" r="4.2"/><path ${F} d="M3.5 21.5 A8.5 8.5 0 0 1 20.5 21.5Z"/>`,
    // symbols
    info: `<circle ${F} cx="12" cy="12" r="10.5"/><rect fill="#fff" x="10.8" y="10" width="2.4" height="8" rx="1"/><circle fill="#fff" cx="12" cy="6.8" r="1.5"/>`,
    question: `<circle ${F} cx="12" cy="12" r="10.5"/><path fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" d="M9 9.2 A3 3 0 1 1 13.2 11.9 C12.4 12.3 12 12.9 12 13.8 V14.3"/><circle fill="#fff" cx="12" cy="17.6" r="1.4"/>`,
    plus: `<path ${thick(3.4)} d="M12 4 V20 M4 12 H20"/>`,
    minus: `<path ${thick(3.4)} d="M4 12 H20"/>`,
    flag: `<path ${S} d="M5 21.5 V3"/><path ${F} d="M5 3.5 H19 L16 8 L19 12.5 H5Z"/>`,
    trophy: `<path ${F} d="M6.5 3 H17.5 V9 A5.5 5.5 0 0 1 6.5 9Z"/><path ${S} d="M6.5 5 H3.5 V7 A3.5 3.5 0 0 0 7 10.5 M17.5 5 H20.5 V7 A3.5 3.5 0 0 1 17 10.5 M12 14.5 V18"/><rect ${F} x="7.5" y="18" width="9" height="3.5" rx="1"/>`,
    thumbsup: `<path ${F} d="M2.5 10 H6 V21 H2.5Z"/><path ${F} d="M7.5 10.5 L11.5 3 C13.2 3 14 4.2 13.8 5.8 L13.2 9.5 H19 A2 2 0 0 1 21 11.8 L19.8 19.2 A2.2 2.2 0 0 1 17.6 21 H7.5Z"/>`,
    hourglass: `<path ${S} d="M5.5 2.5 H18.5 M5.5 21.5 H18.5 M7 2.5 V5.5 C7 8.5 12 10 12 12 C12 14 7 15.5 7 18.5 V21.5 M17 2.5 V5.5 C17 8.5 12 10 12 12 C12 14 17 15.5 17 18.5 V21.5"/><path ${F} d="M8.5 21 C8.5 18 12 16.5 12 15.5 C12 16.5 15.5 18 15.5 21Z"/>`,
    power: `<path ${S} d="M12 2.5 V11"/><path ${S} d="M6.5 5.8 A8.5 8.5 0 1 0 17.5 5.8"/>`,
    eye: `<path ${F} d="M1.5 12 C5 5.5 19 5.5 22.5 12 C19 18.5 5 18.5 1.5 12Z"/><circle fill="#fff" cx="12" cy="12" r="4.2"/><circle ${F} cx="12" cy="12" r="2.2"/>`,
  });

  /** Extra search words per icon (the name itself always matches). */
  const ICON_TAGS = {
    heart: "love", star: "favourite", home: "house", plug: "cable power electric", bolt: "electric power lightning",
    snowflake: "freezer frozen cold winter", flame: "fire hot", leaf: "plant garden vegan", cup: "coffee tea mug kitchen",
    warning: "caution danger fragile", check: "ok done yes", cross: "no stop", arrow: "direction", note: "music",
    gift: "present birthday", cake: "birthday party", paw: "pet dog animal", key: "keys", bulb: "idea light lamp",
    box: "storage package parcel", calendar: "date", tools: "wrench repair", drop: "water liquid", recycle: "waste bin",
    apple: "fruit food", carrot: "vegetable food", fish: "food seafood animal", drumstick: "meat chicken food",
    egg: "food", bread: "food bakery", cheese: "food dairy", milk: "dairy drink", jar: "pantry storage kitchen",
    cutlery: "fork knife food kitchen restaurant", wine: "drink glass alcohol", chili: "spice hot pepper food",
    icecream: "dessert freezer food", pizza: "food", battery: "power charge", usb: "cable data", laptop: "computer",
    monitor: "screen tv computer", printer: "print office", camera: "photo", headphones: "music audio",
    gamepad: "games controller console", book: "read library", pencil: "write edit", paperclip: "attach office",
    folder: "files office", document: "file paper office", clock: "time", bell: "alarm notification",
    trash: "bin waste garbage", tag: "price label sale", cart: "shopping", bag: "shopping", euro: "money price",
    shirt: "clothes laundry", washer: "laundry washing machine", bed: "bedroom sleep", hammer: "tools diy",
    screwdriver: "tools diy", ruler: "measure tools", magnet: "fridge", gear: "settings tools", tree: "garden christmas",
    sprout: "plant seed garden", cactus: "plant garden", mushroom: "food forest", cloud: "weather",
    umbrella: "weather rain", cat: "pet animal", bone: "dog pet", car: "garage vehicle", bike: "bicycle",
    plane: "travel flight", globe: "world travel web", anchor: "boat sea", suitcase: "travel luggage",
    medical: "first aid health", pill: "medicine health", thermometer: "temperature health", person: "name user",
    info: "information", question: "help", flag: "", trophy: "winner prize", thumbsup: "like ok",
    hourglass: "time wait", power: "on off", eye: "look view",
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

  root.Graphics = { ICONS, ICON_TAGS, iconSvg, FRAMES, drawFrame, frameVInset, TEMPLATES };
})(window);
