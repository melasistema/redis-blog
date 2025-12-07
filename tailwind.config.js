// tailwind.config.js
import { defaultBlogConfig } from './config/blog.config';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    `./components/**/*.{vue,js,ts}`,
    `./layouts/**/*.vue`,
    `./pages/**/*.vue`,
    `./composables/**/*.{js,ts}`,
    `./plugins/**/*.{js,ts}`,
    `./utils/**/*.{js,ts}`,
    `./app.{js,ts,vue}`,
    `./error.{js,ts,vue}`,
    `./nuxt.config.{js,ts}`,
  ],
  theme: {
    extend: {
      colors: {
          primary: defaultBlogConfig.colors.primary,
          'primary-dark': defaultBlogConfig.colors['primary-dark'],
          secondary: defaultBlogConfig.colors.secondary,
          'secondary-dark': defaultBlogConfig.colors['secondary-dark'],
          text: defaultBlogConfig.colors.text,
          'text-dark': defaultBlogConfig.colors['text-dark'],
          background: defaultBlogConfig.colors.background,
          'background-dark': defaultBlogConfig.colors['background-dark'],
          error: defaultBlogConfig.colors.error,
          'error-dark': defaultBlogConfig.colors['error-dark'],
      },
      fontFamily: {
        sans: [defaultBlogConfig.typography.body.fontFamily, ...defaultTheme.fontFamily.sans],
        serif: [defaultBlogConfig.typography.body.fontFamily, ...defaultTheme.fontFamily.serif],
        mono: [...defaultTheme.fontFamily.mono],
        h1: [defaultBlogConfig.typography.h1.fontFamily, ...defaultTheme.fontFamily.sans],
        h2: [defaultBlogConfig.typography.h2.fontFamily, ...defaultTheme.fontFamily.sans],
        h3: [defaultBlogConfig.typography.h3.fontFamily, ...defaultTheme.fontFamily.sans],
        h4: [defaultBlogConfig.typography.h4.fontFamily, ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
