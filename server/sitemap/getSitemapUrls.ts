// server/sitemap/getSitemapUrls.ts

import { PostRepository } from '~/server/repositories/PostRepository'
import { TagRepository } from '~/server/repositories/TagRepository'
import { defaultBlogConfig } from '~/config/blog.config'
import type { SitemapUrl } from './types'
import { getRedis } from '~/server/utils/redis'

export async function getSitemapUrls(baseUrl: string): Promise<SitemapUrl[]> {
    const postRepository = new PostRepository(getRedis)
    const posts = await postRepository.getAllSlugs()
    const tags = await TagRepository.all()
    const postsPerPage = defaultBlogConfig.pagination.postsPerPage

    const urls: SitemapUrl[] = []

    // Homepage
    urls.push({
        loc: `${baseUrl}/`,
        changefreq: 'daily',
        priority: 1
    })

    // Posts
    for (const post of posts) {
        urls.push({
            loc: `${baseUrl}/posts/${post.slug}`,
            lastmod: new Date(post.createdAt).toISOString(),
            changefreq: 'weekly',
            priority: 0.9
        })
    }

    console.log('[sitemap] posts:', posts)

    return urls
}
