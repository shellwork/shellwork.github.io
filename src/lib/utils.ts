import { site } from '../site.config';

// Prefix an internal path with the configured base, so the site also works
// when deployed to https://user.github.io/repo/ instead of the domain root.
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2024-05" -> "May 2024", "2024" -> "2024".
export function formatPartialDate(value: string): string {
  const [y, m] = value.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

export function formatRange(start: string, end?: string): string {
  return `${formatPartialDate(start)} – ${end ? formatPartialDate(end) : 'Present'}`;
}

export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: style === 'long' ? 'numeric' : undefined,
    timeZone: 'UTC',
  });
}

// Sort key for partial dates: later dates and ongoing items come first.
export function partialDateKey(value?: string): string {
  return value ?? '9999';
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Minimal inline Markdown for short strings (news items): links, bold, italic, code.
export function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const external = /^https?:/.test(href);
      const attrs = external ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${external ? href : url(href)}"${attrs}>${label}</a>`;
    });
}

// Estimated minutes to read a Markdown body. CJK text is counted per character.
export function readingTime(body = ''): number {
  const text = body.replace(/```[\s\S]*?```/g, ' ');
  const cjk = (text.match(/[぀-ヿ㐀-鿿가-힯]/g) ?? []).length;
  const words = text.replace(/[぀-ヿ㐀-鿿가-힯]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}

// A valid CSS identifier, for view-transition-name.
export function cssIdent(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function isSelf(author: string): boolean {
  const clean = author.replace(/[*†‡]+$/, '').trim();
  return (site.authorNames as readonly string[]).includes(clean);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const linkLabels: Record<string, string> = {
  pdf: 'PDF',
  arxiv: 'arXiv',
  code: 'Code',
  project: 'Project',
  slides: 'Slides',
  video: 'Video',
  poster: 'Poster',
  doi: 'DOI',
};
