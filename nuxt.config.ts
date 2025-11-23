// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Expose environment variables to the Nuxt application
  runtimeConfig: {
    public: {
      redisUrl: process.env.NUXT_REDIS_URL,
      redisHost: process.env.NUXT_PUBLIC_REDIS_HOST,
      redisPort: parseInt(process.env.NUXT_PUBLIC_REDIS_PORT || '6379')
    }
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
