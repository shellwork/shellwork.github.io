// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';

// Posts migrated from the old Hexo blog were written with single line breaks
// rendered as <br>, so keep that behavior for blog posts only.
/** @type {import('unified').Plugin<[], import('mdast').Root>} */
function postLineBreaks() {
  const breaks = remarkBreaks();
  return (tree, file) => {
    if (file.path?.includes('/src/content/posts/')) breaks(tree);
  };
}

// Deployment target.
// - Repo named <username>.github.io  -> SITE = 'https://<username>.github.io', BASE = '/'
// - Any other repo name (e.g. "homepage") -> SITE = 'https://<username>.github.io', BASE = '/homepage'
// - Custom domain -> SITE = 'https://your.domain', BASE = '/', and add public/CNAME
const SITE = 'https://shellwork.github.io';
const BASE = '/';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Old Hexo post URLs (/:year/:month/:day/:title/) point to the new posts.
  redirects: {
    '/2024/02/07/Bioinformatics': '/blog/bioinformatics',
    '/2024/02/07/Chip-seq': '/blog/chip-seq',
    '/2024/02/07/Immunology': '/blog/immunology',
    '/2024/02/07/Pharmacology': '/blog/pharmacology',
    '/2024/02/07/r2s_notes': '/blog/r2s-istoreos',
  },
  markdown: {
    // $inline$ and $$block$$ math, rendered with KaTeX at build time.
    remarkPlugins: [remarkMath, postLineBreaks],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
