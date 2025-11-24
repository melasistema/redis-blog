<template>
  <div :style="{ fontFamily: fontCssFamily }">
    <slot />
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 <a href="https://github.com/melasistema" target="_blank" rel="noopener noreferrer">{{ blogConfig.siteName }}</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;

const extractFontName = (input: string) => {
  if (input.startsWith('http')) {
    try {
      const url = new URL(input);
      const familyParam = url.searchParams.get('family');
      if (familyParam) {
        return familyParam.split(':')[0].replace(/\+/g, ' ');
      }
    } catch (e) {
      console.error("Failed to parse Google Font URL:", e);
    }
  } else {
    return input.split(':')[0];
  }
  return '';
};


const fontCssFamily = computed(() => {
  if (blogConfig.useGoogleFonts && blogConfig.googleFontToUse) {
    const fontName = extractFontName(blogConfig.googleFontToUse);
    if (fontName) {
      return `'${fontName}', sans-serif`;
    }
  }
  return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
});
</script>

<style scoped>
.footer {
  margin-top: 4rem;
  padding: 2rem 0;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
  font-size: 0.9rem;
}

.footer a {
  color: #007bff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>