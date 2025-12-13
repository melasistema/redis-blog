// server/api/sitemap-urls.ts
import { PostRepository } from '~/server/repositories/PostRepository';
import { TagRepository } from '~/server/repositories/TagRepository';
import { defaultBlogConfig } from '~/config/blog.config';

export default defineEventHandler(async () => {
    const runtimeConfig = useRuntimeConfig();
    const baseUrl = process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000';

    const posts = await PostRepository.getAllSlugs();
    const tags = await TagRepository.all();
    const postsPerPage = defaultBlogConfig.pagination.postsPerPage;

    const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }> = [];

    // Homepage + pagination
    const totalPages = Math.ceil(posts.length / postsPerPage);
    for (let page = 1; page <= totalPages; page++) {
        urls.push({ loc: page === 1 ? `${baseUrl}/` : `${baseUrl}/?page=${page}`, changefreq: 'daily', priority: page === 1 ? 1 : 0.8 });
    }

    // Individual posts
    posts.forEach(post => {
        urls.push({ loc: `${baseUrl}/posts/${post.slug}`, lastmod: new Date(post.createdAt).toISOString(), changefreq: 'weekly', priority: 0.9 });
    });

    // Tag-based search URLs
    tags.forEach(tag => urls.push({ loc: `${baseUrl}/?q=@tags:{${encodeURIComponent(tag)}}`, changefreq: 'weekly', priority: 0.6 }));

    return urls;
});
