import { defaultBlogConfig } from './config/blog.config';

const extractFontNameForUrl = (input: string) => {
  if (input.startsWith('http')) {
    try {
      const url = new URL(input);
      const familyParam = url.searchParams.get('family');
      if (familyParam) {
        return familyParam; // Return the full family param for the URL
      }
    } catch (e) {
      console.error("Failed to parse Google Font URL in nuxt.config.ts:", e);
    }
  }
  return input; // Assume it's already in the 'Font Name:weights' format
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Expose environment variables to the Nuxt application
  runtimeConfig: {
    public: {
      // redisUrl: process.env.NUXT_REDIS_URL, // Not for client-side exposure
      redisHost: process.env.NUXT_PUBLIC_REDIS_HOST,
      redisPort: parseInt(process.env.NUXT_PUBLIC_REDIS_PORT || '6379'),
      blogConfig: defaultBlogConfig,
    }
  },
  app: {
    head: {
      title: defaultBlogConfig.siteName,
      link: defaultBlogConfig.useGoogleFonts && defaultBlogConfig.googleFontToUse ? [
        {
          rel: 'stylesheet',
          href: defaultBlogConfig.googleFontToUse,
        }
      ] : [],
    },
  },
  nitro: {
    preset: 'node-server',
    compatibilityDate: '2025-11-23'
  },
  // Optional: Add any other Nuxt configuration here
  devtools: { enabled: true },
  vite: {
    server: {
      hmr: {
        clientPort: 3000,
        protocol: 'ws',
      },
    },
  },
})
