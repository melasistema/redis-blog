/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/routes/sitemap.xml.ts

import { getSitemapUrls } from '~/server/sitemap/getSitemapUrls'

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const baseUrl =
        runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000'

    const urls = await getSitemapUrls(baseUrl)

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map(
            (url) => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`
        )
        .join('')}
</urlset>`

    event.node.res.setHeader('Content-Type', 'application/xml')
    event.node.res.setHeader('Cache-Control', 'public, max-age=3600')

    return xml
})
