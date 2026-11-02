import { site } from '../site.config';
import { accentFromAsset, type AccentPair } from './palette';

// The accent colors for the site: set by hand, or derived from the banner image.
export async function resolveAccent(): Promise<AccentPair> {
  const { accent, accentFallback, banner } = site.theme;
  if (accent !== 'auto') return accent;
  if (!banner.image) return accentFallback;
  return (await accentFromAsset(banner.image)) ?? accentFallback;
}
