import { getCollection } from 'astro:content';
import { partialDateKey } from './utils';

export async function getPublications() {
  const pubs = await getCollection('publications');
  // Newest year first; within a year keep the order from the YAML file.
  return pubs
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.data.year - a.p.data.year || a.i - b.i)
    .map(({ p }) => p);
}

export async function getProjects() {
  const projects = await getCollection('projects');
  return projects.sort(
    (a, b) =>
      a.data.order - b.data.order ||
      partialDateKey(b.data.start).localeCompare(partialDateKey(a.data.start)),
  );
}

export async function getPosts() {
  // Drafts show up in `npm run dev` but are left out of the production build.
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getExperience() {
  const items = await getCollection('experience');
  // Ongoing first, then by most recent end/start date.
  return items.sort(
    (a, b) =>
      partialDateKey(b.data.end).localeCompare(partialDateKey(a.data.end)) ||
      b.data.start.localeCompare(a.data.start),
  );
}

export async function getNews() {
  const news = await getCollection('news');
  return news.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
