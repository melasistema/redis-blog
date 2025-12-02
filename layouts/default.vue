<template>
  <div>
    <slot />
    <footer class="footer">
      <div class="container">
        <p>{{ blogConfig.copyrightNotice }} <a :href="blogConfig.copyrightUrl" target="_blank" rel="noopener noreferrer">{{ blogConfig.siteName }}</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;

const bodyWeight = computed(() => {
    const weights = blogConfig.typography.body.weights;
    if (weights.includes('..')) {
        return 400; // A sensible default for body text
    }
    return weights.split(';')[0];
});

useHead({
  style: [
    {
      innerHTML: computed(() => `
        :root {
          --primary-color: ${blogConfig.colors.primary};
          --primary-color-dark: #0056b3; /* A darker shade of #007bff */
          --secondary-color: ${blogConfig.colors.secondary};
          --secondary-color-light: #d6d8db; /* A lighter shade of #6c757d */
          --text-color: ${blogConfig.colors.text};
          --background-color: ${blogConfig.colors.background};
          --error-color: #e53e3e; /* Standard red for errors */
          --error-color-light: #ffebeb; /* Lighter red for error backgrounds */
        }
        body {
          font-family: '${blogConfig.typography.body.fontFamily}', sans-serif;
          font-weight: ${bodyWeight.value};
          color: var(--text-color);
          background-color: var(--background-color);
        }
        h1 {
          font-family: '${blogConfig.typography.h1.fontFamily}', sans-serif;
          font-weight: ${blogConfig.typography.h1.weights};
        }
        h2 {
          font-family: '${blogConfig.typography.h2.fontFamily}', sans-serif;
          font-weight: ${blogConfig.typography.h2.weights};
        }
        h3 {
          font-family: '${blogConfig.typography.h3.fontFamily}', sans-serif;
          font-weight: ${blogConfig.typography.h3.weights};
        }
        h4 {
          font-family: '${blogConfig.typography.h4.fontFamily}', sans-serif;
          font-weight: ${blogConfig.typography.h4.weights};
        }
        .footer a {
          color: var(--primary-color);
        }
      `)
    }
  ]
})
</script>

<style scoped>
.footer {
  margin-top: 4rem;
  padding: 2rem 0;
  border-top: 1px solid var(--secondary-color);
  text-align: center;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.footer a {
  color: var(--primary-color);
  text-decoration: none;
}
</style>
