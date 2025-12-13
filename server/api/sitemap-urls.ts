// server/api/sitemap-urls.ts
import { getSitemapUrls } from '~/server/sitemap/getSitemapUrls'

export default defineEventHandler(async () => {
    const runtimeConfig = useRuntimeConfig()
    const baseUrl =
        runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000'

    return getSitemapUrls(baseUrl)
})
