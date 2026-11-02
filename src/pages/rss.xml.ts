import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../site.config';
import { getPosts } from '../lib/content';
import { url } from '../lib/utils';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name} · Blog`,
    description: site.description,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: url(`/blog/${post.id}/`),
    })),
  });
}
