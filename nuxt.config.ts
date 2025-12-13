// nuxt.config.ts
import { defaultBlogConfig } from './config/blog.config';

function getGoogleFontsFamilies() {
    const families: { [key: string]: true | number[] | { wght?: number[]; ital?: number[] } } = {};

    Object.values(defaultBlogConfig.typography).forEach(font => {
        if (!families[font.fontFamily]) {
            families[font.fontFamily] = { wght: [], ital: [] };
        }
        const family = families[font.fontFamily] as { wght: number[]; ital: number[] };

        const weights = font.weights.split('..');
        const weightsToAdd = new Set<number>();

        if (weights.length === 2) {
            for (let i = parseInt(weights[0]); i <= parseInt(weights[1]); i += 100) {
                weightsToAdd.add(i);
            }
        } else {
            font.weights.split(';').forEach((w: string) => weightsToAdd.add(parseInt(w)));
        }

        weightsToAdd.forEach(w => {
            if (!family.wght.includes(w)) {
                family.wght.push(w);
            }
            if (font.italic && family.ital && !family.ital.includes(w)) {
                family.ital.push(w);
            }
        });
    });

    Object.values(families).forEach(family => {
        if (typeof family === 'object' && family !== null && !Array.isArray(family)) {
            if (family.wght) family.wght.sort((a, b) => a - b);
            if (family.ital && family.ital.length > 0) {
                family.ital.sort((a, b) => a - b);
            } else if (family.ital) {
                delete family.ital;
            }
        }
    });

    return families;
}

const buildFaviconLinks = () => {
    if (!defaultBlogConfig.favicon.enabled) return [];
    const path = defaultBlogConfig.favicon.path;
    return [
        { rel: 'icon', type: 'image/svg+xml', href: `${path}favicon.svg` },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: `${path}icon-192.png` },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: `${path}icon-512.png` },
        { rel: 'apple-touch-icon', href: `${path}apple-touch-icon.png` },
        { rel: 'manifest', href: `${path}manifest.webmanifest` },
    ];
};

const blogConfig = defaultBlogConfig;
const faviconLinks = buildFaviconLinks();

export default defineNuxtConfig({
    modules: [
        '@nuxtjs/google-fonts',
        '@nuxtjs/tailwindcss',
        ['@nuxtjs/sitemap', {
            // Nuxt 3 sitemap options
            strict: true,
            defaults: {
                changefreq: 'weekly',
                priority: 0.7,
            },
            // Provide dynamic routes
            async routes() {
                const runtimeConfig = useRuntimeConfig();
                const baseUrl = process.env.NUXT_PUBLIC_URL || runtimeConfig.public.NUXT_PUBLIC_URL || 'http://localhost:3000';

                try {
                    const urls = await $fetch<Array<{ loc: string }>>(`${baseUrl}/api/sitemap-urls`);
                    return urls.map(u => u.loc);
                } catch (err) {
                    console.error('Error generating sitemap routes:', err);
                    return [];
                }
            }
        }]
    ],
    runtimeConfig: {
        public: {
            redisHost: process.env.NUXT_PUBLIC_REDIS_HOST,
            redisPort: parseInt(process.env.NUXT_PUBLIC_REDIS_PORT || '6379'),
            blogConfig: defaultBlogConfig,
        },
    },
    googleFonts: {
        families: getGoogleFontsFamilies(),
        display: 'swap',
        prefetch: true,
        preconnect: true,
        preload: true,
    },
    app: {
        head: {
            title: blogConfig.siteName,
            meta: [
                { name: 'theme-color', content: blogConfig.colors.primary },
                { name: 'description', content: `Welcome to ${blogConfig.siteName}, a blog built with Nuxt and Redis.` },
            ],
            link: faviconLinks,
        },
    },
    nitro: {
        preset: 'node-server',
        compatibilityDate: '2025-11-23',
        prerender: {
            routes: ['/', '/api/sitemap-urls'],
        },
    },
    devtools: { enabled: true },
    vite: {
        server: {
            hmr: {
                clientPort: 3000,
                protocol: 'ws',
            },
        },
    },
});
