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

    // Sort weights and clean up
    Object.values(families).forEach(family => {
        if (typeof family === 'object' && family !== null && !Array.isArray(family)) {
            if(family.wght) family.wght.sort((a: number,b: number)=> a-b);
            if(family.ital && family.ital.length > 0) {
                family.ital.sort((a: number,b: number)=> a-b);
            } else if (family.ital) {
                delete family.ital;
            }
        }
    });

    return families;
}


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Expose environment variables to the Nuxt application
  runtimeConfig: {
    public: {
      redisHost: process.env.NUXT_PUBLIC_REDIS_HOST,
      redisPort: parseInt(process.env.NUXT_PUBLIC_REDIS_PORT || '6379'),
      blogConfig: defaultBlogConfig,
    }
  },
  modules: [
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: getGoogleFontsFamilies(),
    display: 'swap',
    prefetch: true,
    preconnect: true,
    preload: true,
  },
  app: {
    head: {
      title: defaultBlogConfig.siteName,
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
