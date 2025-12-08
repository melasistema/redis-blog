// server/api/sitemap-urls.ts
import { PostRepository } from '~/server/repositories/PostRepository';
import { TagRepository } from '~/server/repositories/TagRepository';
import { defaultBlogConfig } from '~/config/blog.config';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const baseUrl = process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000';

  const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }> = [];

  // Add homepage
  urls.push({
    loc: baseUrl,
    changefreq: 'daily',
    priority: 1.0,
  });

  // Add posts
  const posts = await PostRepository.getAllSlugs(); // Need to implement getAllSlugs in PostRepository
  posts.forEach(post => {
    urls.push({
      loc: `${baseUrl}/posts/${post.slug}`,
      lastmod: new Date(post.createdAt).toISOString(), // Assuming createdAt is available and represents last modification
      changefreq: 'weekly',
      priority: 0.8,
    });
  });

  // Add tags
  const tags = await TagRepository.all(); // TagRepository.all() returns an array of tag strings
  tags.forEach(tag => {
    urls.push({
      loc: `${baseUrl}/tags/${tag}`, // Assuming a /tags/[tag] route
      changefreq: 'weekly',
      priority: 0.6,
    });
  });

  return urls;
});