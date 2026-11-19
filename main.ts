// news-image-20261119 — "The World Today": a newspaper front page summing up
// Thursday 19 November 2026, drawn from scratch in code (Node 22+, stdlib only).
// Own PNG encoder (zlib deflate + CRC32) and a 5x7 bitmap font, scaled up.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join } from 'node:path';

const W = 1024;
const H = 1024;
const PAPER: [number, number, number] = [246, 241, 231];
const INK: [number, number, number] = [17, 17, 17];
const RED: [number, number, number] = [180, 35, 24];
const BLUE: [number, number, number] = [29, 78, 158];
const GOLD: [number, number, number] = [196, 148, 44];
const GREY: [number, number, number] = [90, 86, 78];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT: [number, number, number] = [232, 226, 212];

type RGB = [number, number, number];
const px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = PAPER[0]; px[i * 3 + 1] = PAPER[1]; px[i * 3 + 2] = PAPER[2];
}
function set(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++)
    for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) set(i, j, c);
}
function outline(x: number, y: number, w: number, h: number, c: RGB, t = 2): void {
  rect(x, y, w, t, c); rect(x, y + h - t, w, t, c);
  rect(x, y, t, h, c); rect(x + w - t, y, t, h, c);
}
function disc(cx: number, cy: number, r: number, c: RGB): void {
  for (let j = cy - r; j <= cy + r; j++)
    for (let i = cx - r; i <= cx + r; i++)
      if ((i - cx) * (i - cx) + (j - cy) * (j - cy) <= r * r) set(i, j, c);
}
function hline(x: number, y: number, w: number, c: RGB, t = 1): void { rect(x, y, w, t, c); }
function vline(x: number, y: number, h: number, c: RGB, t = 1): void { rect(x, y, t, h, c); }
function line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 2): void {
  const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let s = 0; s <= n; s++) {
    const x = Math.round(x0 + (dx * s) / n), y = Math.round(y0 + (dy * s) / n);
    rect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
  }
}

// ---- 5x7 bitmap font (rows of '#' / '.') ----
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '00000', '00000', '00000', '01100', '00000'],
  ';': ['00000', '01100', '00000', '00000', '01100', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '"': ['01010', '01010', '00000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '+': ['00000', '00100', '00100', '01110', '00100', '00100', '00000'],
  '=': ['00000', '00000', '01110', '00000', '01110', '00000', '00000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '*': ['00000', '10101', '01110', '10101', '00000', '00000', '00000'],
  '#': ['01010', '01010', '11111', '01010', '11111', '01010', '01010'],
  '@': ['01110', '10001', '10111', '10101', '10110', '10000', '01110'],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}
function drawGlyph(ch: string, x: number, y: number, scale: number, c: RGB): void {
  const g = FONT[ch] ?? FONT[' '];
  for (let r = 0; r < 7; r++)
    for (let col = 0; col < 5; col++)
      if (g[r][col] === '1') rect(x + col * scale, y + r * scale, scale, scale, c);
}
function drawLine(s: string, x: number, y: number, scale: number, c: RGB): void {
  const up = s.toUpperCase();
  for (let i = 0; i < up.length; i++) drawGlyph(up[i], x + i * 6 * scale, y, scale, c);
}
// Word-wrap text into lines of at most maxW px; returns lines.
function wrap(s: string, scale: number, maxW: number): string[] {
  const words = s.toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(t, scale) <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
// Draw wrapped text; returns total height used.
function drawText(s: string, x: number, y: number, scale: number, c: RGB, maxW: number, lh?: number): number {
  const lines = wrap(s, scale, maxW);
  const step = lh ?? Math.round(9 * scale);
  lines.forEach((ln, i) => drawLine(ln, x, y + i * step, scale, c));
  return lines.length * step;
}
function centerText(s: string, cx: number, y: number, scale: number, c: RGB): void {
  drawLine(s, cx - Math.floor(textWidth(s.toUpperCase(), scale) / 2), y, scale, c);
}

// ---- PNG encoder ----
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(b: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}
function encodePNG(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- icons (flat pictograms, drawn in code) ----
function iconCapitol(x: number, y: number, s: number): void {
  // dome + columns, drawn larger and simpler
  disc(x + 10 * s, y + 4 * s, 4 * s, BLUE);
  rect(x + 2 * s, y + 8 * s, 16 * s, 2 * s, INK);
  rect(x + 4 * s, y + 10 * s, 2 * s, 7 * s, INK);
  rect(x + 9 * s, y + 10 * s, 2 * s, 7 * s, INK);
  rect(x + 14 * s, y + 10 * s, 2 * s, 7 * s, INK);
  rect(x + 1 * s, y + 17 * s, 18 * s, 2 * s, RED);
}
function iconBridge(x: number, y: number, s: number): void {
  rect(x, y + 13 * s, 20 * s, 3 * s, INK);
  rect(x + 2 * s, y + 2 * s, 2 * s, 12 * s, INK);
  rect(x + 16 * s, y + 2 * s, 2 * s, 12 * s, INK);
  line(x + 3 * s, y + 3 * s, x + 10 * s, y + 13 * s, RED, 2);
  line(x + 17 * s, y + 3 * s, x + 10 * s, y + 13 * s, RED, 2);
  // blast burst over the deck
  disc(x + 10 * s, y + 5 * s, 3 * s, GOLD);
  line(x + 10 * s, y + 1 * s, x + 10 * s, y + 9 * s, GOLD, 2);
  line(x + 6 * s, y + 5 * s, x + 14 * s, y + 5 * s, GOLD, 2);
}
function iconGame(x: number, y: number, s: number): void {
  disc(x + 14 * s, y + 4 * s, 4 * s, GOLD); // Vice City sun
  line(x + 3 * s, y + 18 * s, x + 5 * s, y + 9 * s, [34, 120, 60], 2); // palm trunk
  line(x + 5 * s, y + 9 * s, x, y + 6 * s, [34, 120, 60], 2);
  line(x + 5 * s, y + 9 * s, x + 10 * s, y + 6 * s, [34, 120, 60], 2);
  rect(x + 8 * s, y + 13 * s, 12 * s, 6 * s, INK); // controller
  disc(x + 11 * s, y + 16 * s, 1 * s, RED);
  disc(x + 17 * s, y + 16 * s, 1 * s, WHITE);
}
function iconChart(x: number, y: number, s: number): void {
  vline(x + 2 * s, y + 2 * s, 15 * s, INK, 2);
  hline(x + 2 * s, y + 17 * s, 17 * s, INK, 2);
  line(x + 3 * s, y + 14 * s, x + 8 * s, y + 10 * s, RED, 3);
  line(x + 8 * s, y + 10 * s, x + 12 * s, y + 12 * s, RED, 3);
  line(x + 12 * s, y + 12 * s, x + 18 * s, y + 3 * s, RED, 3);
  line(x + 18 * s, y + 3 * s, x + 15 * s, y + 3 * s, RED, 3);
  line(x + 18 * s, y + 3 * s, x + 18 * s, y + 6 * s, RED, 3);
}
function iconVoyager(x: number, y: number, s: number): void {
  disc(x + 3 * s, y + 3 * s, 1 * s, GOLD);
  disc(x + 17 * s, y + 5 * s, 1 * s, GOLD);
  disc(x + 14 * s, y + 15 * s, 1 * s, GOLD);
  line(x + 5 * s, y + 12 * s, x + 13 * s, y + 6 * s, INK, 3); // body
  line(x + 13 * s, y + 6 * s, x + 17 * s, y + 2 * s, INK, 2); // antenna
  disc(x + 17 * s, y + 2 * s, 1 * s, RED);
  line(x + 9 * s, y + 9 * s, x + 5 * s, y + 5 * s, BLUE, 2); // dish
  line(x + 9 * s, y + 9 * s, x + 13 * s, y + 13 * s, BLUE, 2);
}
function iconEU(x: number, y: number, s: number): void {
  disc(x + 10 * s, y + 9 * s, 8 * s, BLUE);
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2;
    disc(Math.round(x + 10 * s + Math.cos(t) * 5 * s), Math.round(y + 9 * s + Math.sin(t) * 5 * s), 1 * s, GOLD);
  }
  drawLine('EU', x + 7 * s, y + 7 * s, 1, WHITE);
}
function iconTruck(x: number, y: number, s: number): void {
  rect(x + 1 * s, y + 6 * s, 11 * s, 7 * s, BLUE);
  rect(x + 12 * s, y + 9 * s, 6 * s, 4 * s, BLUE);
  rect(x + 13 * s, y + 10 * s, 3 * s, 2 * s, WHITE);
  disc(x + 5 * s, y + 14 * s, 2 * s, INK);
  disc(x + 15 * s, y + 14 * s, 2 * s, INK);
  drawLine('AID', x + 3 * s, y + 8 * s, 1, WHITE);
}
function iconSunflower(x: number, y: number, s: number): void {
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2;
    disc(Math.round(x + 10 * s + Math.cos(t) * 6 * s), Math.round(y + 8 * s + Math.sin(t) * 6 * s), 2 * s, GOLD);
  }
  disc(x + 10 * s, y + 8 * s, 4 * s, [90, 50, 20]);
  rect(x + 9 * s, y + 13 * s, 2 * s, 5 * s, [34, 120, 60]);
}
function iconCyclone(x: number, y: number, s: number): void {
  for (let r = 2; r <= 8; r += 2) {
    for (let a = 0; a < 300; a += 12) {
      const t = (a / 180) * Math.PI + r * 0.4;
      set(Math.round(x + 10 * s + Math.cos(t) * r * s), Math.round(y + 9 * s + Math.sin(t) * r * s), BLUE);
      set(Math.round(x + 10 * s + Math.cos(t) * r * s) + 1, Math.round(y + 9 * s + Math.sin(t) * r * s), BLUE);
    }
  }
  disc(x + 10 * s, y + 9 * s, 2 * s, RED);
}

// ---- page layout ----
outline(14, 14, W - 28, H - 28, INK, 3);
// Masthead
rect(24, 24, W - 48, 108, INK);
centerText('THE WORLD TODAY', W / 2, 44, 6, WHITE);
centerText('THURSDAY 19 NOVEMBER 2026', W / 2, 96, 3, GOLD);
hline(24, 140, W - 48, RED, 4);

// Lead story
const LX = 40, LY = 156, LW = 580;
drawLine('LEAD STORY  -  CHINA  -  APEC SUMMIT', LX, LY, 2, RED);
const leadH = drawText('TRUMP, XI AND PUTIN MEET IN SHENZHEN', LX, LY + 26, 4, INK, LW);
drawText('Trilateral talks at the APEC summit in China. Xi hugs Trump on the tarmac as the three leaders gather.', LX, LY + 26 + leadH + 14, 3, INK, LW - 8);
// Lead art: three flags
const FX = 640, FY = 170;
function flagUS(x: number, y: number, w: number, h: number): void {
  for (let i = 0; i < 7; i++) rect(x, y + Math.floor((i * h) / 7), w, Math.ceil(h / 7), i % 2 ? WHITE : RED);
  rect(x, y, Math.floor(w * 0.45), Math.floor(h * 0.5), BLUE);
  disc(x + Math.floor(w * 0.22), y + Math.floor(h * 0.25), 5, WHITE);
}
function flagCN(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, RED);
  disc(x + 22, y + Math.floor(h * 0.3), 8, GOLD);
  disc(x + 52, y + 16, 3, GOLD); disc(x + 62, y + 30, 3, GOLD); disc(x + 52, y + 44, 3, GOLD);
}
function flagRU(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, Math.floor(h / 3), WHITE);
  rect(x, y + Math.floor(h / 3), w, Math.floor(h / 3), BLUE);
  rect(x, y + Math.floor((2 * h) / 3), w, Math.ceil(h / 3), RED);
}
flagUS(FX, FY, 100, 130);
flagCN(FX + 112, FY, 100, 130);
flagRU(FX + 224, FY, 100, 130);
hline(FX, FY + 138, 324, INK, 3);
drawText('The three leaders shake hands in Shenzhen.', FX, FY + 150, 2, GREY, 330);
hline(24, 396, W - 48, INK, 3);

// Grid of six stories: 2 cols x 3 rows
type Story = { k: string; h: string; d: string; icon: (x: number, y: number, s: number) => void };
const stories: Story[] = [
  { k: 'USA - CONGRESS', h: 'JEFFRIES SET TO BE FIRST BLACK SPEAKER', d: 'Democrats nominate Hakeem Jeffries to lead the House.', icon: iconCapitol },
  { k: 'UKRAINE WAR', h: 'CRIMEAN BRIDGE HIT AGAIN', d: 'Traffic suspended after a fresh attack, Russia says.', icon: iconBridge },
  { k: 'GAMING', h: 'GTA VI ROLLS OUT WORLDWIDE', d: 'Gamers return to Vice City as the global launch begins.', icon: iconGame },
  { k: 'TECH - MARKETS', h: 'ANTHROPIC IN BIGGEST IPO EVER', d: 'Claude-maker raises $81.3bn, eyes a $1.4tn debut.', icon: iconChart },
  { k: 'SPACE', h: 'VOYAGER 1 ONE LIGHT-DAY AWAY', d: 'NASA probe reaches the mark 50 years after launch.', icon: iconVoyager },
  { k: 'EUROPE', h: 'EU PLANS 45BN EURO LOAN FOR UKRAINE', d: 'To be repaid after Russia pays reparations.', icon: iconEU },
];
const GX = [24, 524], GY = [408, 544, 680], GW = 476, GH = 124;
stories.forEach((s, i) => {
  const x = GX[i % 2], y = GY[Math.floor(i / 2)];
  rect(x, y, GW, GH, WHITE);
  outline(x, y, GW, GH, INK, 2);
  drawLine(s.k, x + 14, y + 10, 2, RED);
  s.icon(x + GW - 74, y + 8, 3);
  const hh = drawText(s.h, x + 14, y + 30, 3, INK, GW - 96);
  drawText(s.d, x + 14, y + 30 + hh + 4, 2, GREY, GW - 30, 17);
});

// Bottom strip: three stories
type Mini = { k: string; h: string; d: string; icon: (x: number, y: number, s: number) => void };
const minis: Mini[] = [
  { k: 'GAZA', h: 'GROUND RAID IN GAZA', d: 'Allies urge Israel to let aid reach flooded Gaza.', icon: iconTruck },
  { k: 'ART', h: 'VAN GOGH SELLS FOR $190.4M', d: 'Record price after a row over its Nazi past.', icon: iconSunflower },
  { k: 'WEATHER', h: 'CYCLONE AKVAN NEARS INDIA', d: 'Landfall expected on the east coast.', icon: iconCyclone },
];
const MX = [24, 352, 680], MW = 320, MY = 816, MH = 112;
minis.forEach((s, i) => {
  const x = MX[i];
  rect(x, MY, MW, MH, LIGHT);
  outline(x, MY, MW, MH, INK, 2);
  drawLine(s.k, x + 12, MY + 8, 2, RED);
  s.icon(x + MW - 56, MY + 6, 2);
  const hh = drawText(s.h, x + 12, MY + 30, 2, INK, MW - 70);
  drawText(s.d, x + 12, MY + 30 + hh + 4, 2, GREY, MW - 24);
});

// Ticker + footer
hline(24, 940, W - 48, RED, 3);
drawText('ALSO: PELTOLA WINS ALASKA SENATE - DEMOCRATS 56-44 - MYANMAR VERDICT', 24, 950, 2, INK, W - 48);
centerText('THURSDAY 19 NOVEMBER 2026  -  THE WORLD IN ONE IMAGE', W / 2, 984, 2, GREY);

// ---- write output ----
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const png = encodePNG();
writeFileSync(join(outDir, 'entry.png'), png);
console.log(`Wrote ${join(outDir, 'entry.png')} (${png.length} bytes, ${W}x${H})`);
