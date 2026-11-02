import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Accepts "2024", "2024-05" or "2024-05-12" and keeps it as a string.
const partialDate = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine((v) => /^\d{4}(-\d{2}(-\d{2})?)?$/.test(v), {
    message: 'Use YYYY, YYYY-MM or YYYY-MM-DD',
  });

const links = z
  .object({
    pdf: z.string().optional(),
    arxiv: z.string().optional(),
    code: z.string().optional(),
    project: z.string().optional(),
    slides: z.string().optional(),
    video: z.string().optional(),
    poster: z.string().optional(),
    doi: z.string().optional(),
  })
  .default({});

const publications = defineCollection({
  loader: file('src/content/publications.yaml'),
  schema: ({ image }) => z.object({
    title: z.string(),
    // Main figure, relative to publications.yaml, e.g. ./figures/my-paper.png
    image: image().optional(),
    authors: z.array(z.string()),
    venue: z.string(),
    // Short venue label shown as a badge, e.g. "NeurIPS 2025".
    venueShort: z.string().optional(),
    year: z.number(),
    type: z
      .enum(['conference', 'journal', 'workshop', 'preprint', 'thesis', 'other'])
      .default('conference'),
    // Mark co-first authors with a trailing "*" in authors and set this to true.
    equalContribution: z.boolean().default(false),
    award: z.string().optional(),
    selected: z.boolean().default(false),
    links,
    bibtex: z.string().optional(),
    // Id of a related entry in src/content/projects/.
    project: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      start: partialDate,
      end: partialDate.optional(),
      role: z.string().optional(),
      lab: z.string().optional(),
      tags: z.array(z.string()).default([]),
      // Bullet points shown on cards: what you contributed.
      contributions: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      // Lower numbers come first; ties fall back to start date (newest first).
      order: z.number().default(100),
      cover: image().optional(),
      links,
    }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      // Cover image, relative to the post file, e.g. ./cover.jpg
      cover: image().optional(),
      // Table of contents next to the post on wide screens (needs at least two headings).
      toc: z.boolean().default(true),
      draft: z.boolean().default(false),
    }),
});

const experience = defineCollection({
  loader: file('src/content/experience.yaml'),
  schema: z.object({
    kind: z.enum(['education', 'research', 'industry', 'teaching', 'service']),
    org: z.string(),
    orgUrl: z.string().optional(),
    role: z.string(),
    location: z.string().optional(),
    start: partialDate,
    end: partialDate.optional(),
    advisor: z.string().optional(),
    details: z.array(z.string()).default([]),
  }),
});

const news = defineCollection({
  loader: file('src/content/news.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    // Supports **bold**, *italic*, `code` and [links](url).
    text: z.string(),
  }),
});

export const collections = { publications, projects, posts, experience, news };
