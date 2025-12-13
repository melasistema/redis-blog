/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// server/api/sitemap-urls.ts
import { getSitemapUrls } from '~/server/sitemap/getSitemapUrls'

export default defineEventHandler(async () => {
    const runtimeConfig = useRuntimeConfig()
    const baseUrl =
        runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000'

    return getSitemapUrls(baseUrl)
})
