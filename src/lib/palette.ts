// Derives the site accent color from the banner image at build time.
//
// 1. Downscale the image and convert pixels to OKLCH (a perceptual color space).
// 2. Group colorful pixels by hue and pick the hue with the most "color mass"
//    (area weighted by saturation), so a large vivid region wins over a tiny one.
// 3. Tune lightness separately for light and dark mode until text in that color
//    has enough contrast against the page background (WCAG AA for normal text).

import { statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export interface AccentPair {
  light: string;
  dark: string;
}

// Keep in sync with --bg in src/styles/global.css.
const BG_LIGHT = '#fbfbf9';
const BG_DARK = '#111315';
// 4.5 is the WCAG AA minimum for body text; a little headroom keeps links comfortable.
const MIN_CONTRAST = 4.8;

type Lab = { L: number; a: number; b: number };

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklab(r: number, g: number, b: number): Lab {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

// Returns linear sRGB, which may fall outside [0, 1] when the color is out of gamut.
function oklchToLinearRgb(L: number, C: number, h: number): [number, number, number] {
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((c) => c >= -0.0005 && c <= 1.0005);

function toHex(linear: number[]): string {
  return (
    '#' +
    linear
      .map((c) => Math.round(Math.min(1, Math.max(0, linearToSrgb(Math.min(1, Math.max(0, c))))) * 255))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgbToLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Closest in-gamut color at this lightness and hue, reducing chroma if needed.
function fitColor(L: number, C: number, h: number): string {
  let c = C;
  let rgb = oklchToLinearRgb(L, c, h);
  while (!inGamut(rgb) && c > 0) {
    c -= 0.005;
    rgb = oklchToLinearRgb(L, Math.max(0, c), h);
  }
  return toHex(rgb);
}

// Walk lightness from `start` in `step` until the color reads well on `bg`.
function tune(h: number, C: number, bg: string, start: number, step: number): string {
  for (let L = start; L > 0.05 && L < 0.98; L += step) {
    const hex = fitColor(L, C, h);
    if (contrast(hex, bg) >= MIN_CONTRAST) return hex;
  }
  return fitColor(start, 0, h);
}

/** Dominant colorful hue of an image, or undefined if the image is (nearly) grey. */
async function dominantHue(file: string): Promise<{ h: number; C: number } | undefined> {
  const { data, info } = await sharp(file)
    .resize(96, 96, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const BINS = 24;
  const bins = Array.from({ length: BINS }, () => ({ weight: 0, a: 0, b: 0, n: 0 }));
  for (let i = 0; i < data.length; i += info.channels) {
    const { L, a, b } = rgbToOklab(data[i], data[i + 1], data[i + 2]);
    const C = Math.hypot(a, b);
    // Skip greys, near-blacks and near-whites: they carry no usable hue.
    if (C < 0.03 || L < 0.15 || L > 0.95) continue;
    const h = (Math.atan2(b, a) + 2 * Math.PI) % (2 * Math.PI);
    const bin = bins[Math.floor((h / (2 * Math.PI)) * BINS) % BINS];
    bin.weight += C;
    bin.a += a * C;
    bin.b += b * C;
    bin.n++;
  }

  // Smooth across neighbouring bins so a hue split over a bin edge is not penalised.
  const score = (i: number) =>
    bins[i].weight + 0.5 * (bins[(i + BINS - 1) % BINS].weight + bins[(i + 1) % BINS].weight);
  let best = 0;
  for (let i = 1; i < BINS; i++) if (score(i) > score(best)) best = i;

  const total = info.width * info.height;
  const pick = bins[best];
  // Require the hue (with its neighbours, as scored above) to cover a meaningful
  // share of the image. Flat illustrations spread one color over a few bins.
  const covered = pick.n + bins[(best + BINS - 1) % BINS].n + bins[(best + 1) % BINS].n;
  if (covered < total * 0.02) return undefined;
  return { h: Math.atan2(pick.b, pick.a), C: pick.weight / pick.n };
}

export async function accentFromImage(file: string): Promise<AccentPair | undefined> {
  const hue = await dominantHue(file);
  if (!hue) return undefined;
  // Keep the image's character but stay within a range that works for text:
  // muted photos get a little more color, neon images get toned down.
  const light = tune(hue.h, Math.min(0.16, Math.max(0.09, hue.C)), BG_LIGHT, 0.62, -0.01);
  const dark = tune(hue.h, Math.min(0.13, Math.max(0.07, hue.C * 0.85)), BG_DARK, 0.7, 0.01);
  return { light, dark };
}

const cache = new Map<string, Promise<AccentPair | undefined>>();

/**
 * Accent for an image in src/assets/, cached per file version. Runs once per
 * build (and again in dev only when the image changes).
 */
export function accentFromAsset(name: string): Promise<AccentPair | undefined> {
  const file = path.join(process.cwd(), 'src/assets', name.replace(/^\.?\/+/, ''));
  const key = `${file}:${statSync(file).mtimeMs}`;
  let result = cache.get(key);
  if (!result) {
    result = accentFromImage(file).then((pair) => {
      console.log(
        pair
          ? `[theme] accent from ${name}: light ${pair.light}, dark ${pair.dark}`
          : `[theme] ${name} has no dominant color; using the fallback accent`,
      );
      return pair;
    });
    cache.set(key, result);
  }
  return result;
}
