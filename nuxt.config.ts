import { env } from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    baseURL: env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Beconet - Portfolio',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Supacheep Poonsawat is a fullstack developer building considered web products from interface to infrastructure.' },
        { name: 'theme-color', content: '#f5f3ed' },
        { property: 'og:title', content: 'Supacheep Poonsawat | Fullstack Developer' },
        { property: 'og:description', content: 'Selected work, tools, and notes by Supacheep Poonsawat.' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },
  css: ['~/assets/css/portfolio.css'],
  nitro: { preset: 'static' }
})
