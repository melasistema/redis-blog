// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Expose environment variables to the Nuxt application
  runtimeConfig: {
    public: {
      redisUrl: process.env.NUXT_REDIS_URL
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
