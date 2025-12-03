<template>
  <div class="bg-background text-text font-sans min-h-screen">
    <slot />
    <footer class="mt-16 py-8 border-t border-secondary text-center text-secondary text-sm">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <p>
          {{ blogConfig.copyrightNotice }}
          <a :href="blogConfig.copyrightUrl" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
            {{ blogConfig.siteName }}
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;
</script>
