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
        'primary-dark': '#0056b3',
        secondary: defaultBlogConfig.colors.secondary,
        'secondary-light': '#d6d8db',
        text: defaultBlogConfig.colors.text,
        background: defaultBlogConfig.colors.background,
        error: '#e53e3e',
        'error-light': '#ffebeb',
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
