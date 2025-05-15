// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().optional(),
  }),
});

const portfolio = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url(),
  }),
});

export const collections = {
  blog,
  portfolio,
};
