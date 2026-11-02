import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{jpg,jpeg,png,webp,avif,gif,svg}', {
  eager: true,
});

// Look up an image in src/assets/ by its file name (e.g. 'banner.jpg'), so the
// site config can refer to images by name and still get build-time optimization.
export function assetImage(name: string): ImageMetadata | undefined {
  if (!name) return undefined;
  const found = images[`/src/assets/${name.replace(/^\.?\/+/, '')}`];
  if (!found) {
    throw new Error(`Image "${name}" not found in src/assets/. Check site.config.ts.`);
  }
  return found.default;
}

const svgs = import.meta.glob<string>('/src/assets/**/*.svg', { query: '?raw', import: 'default', eager: true });

// Raw markup of an SVG in src/assets/, for inlining so its CSS animations and
// dark-mode colors keep working (an <img> would isolate it from the page).
export function assetSvg(name: string): string | undefined {
  if (!name) return undefined;
  const found = svgs[`/src/assets/${name.replace(/^\.?\/+/, '')}`];
  if (found === undefined) {
    throw new Error(`SVG "${name}" not found in src/assets/. Check site.config.ts.`);
  }
  return found.replace(/<\?xml[^>]*>\s*/, '');
}
