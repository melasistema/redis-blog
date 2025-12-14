<!--
Copyright (c) 2025 Luca Visciola
SPDX-License-Identifier: MIT

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

<template>
  <div class="bg-background text-text font-sans min-h-screen">
    <slot />
    <footer class="py-8 border-t border-secondary text-center text-secondary text-sm">
      <div :style="{ maxWidth: blogConfig.contentMaxWidth }" class="mx-auto px-4 sm:px-6 lg:px-8">
        <p v-html="dynamicCopyrightNotice"></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;

const dynamicCopyrightNotice = computed(() => {
  const currentYear = new Date().getFullYear();
  const linkedSiteName = `<a href="${blogConfig.copyrightUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${blogConfig.siteName}</a>`;
  
  let notice = blogConfig.copyrightNotice.replace('{year}', currentYear.toString());
  notice = notice.replace('{siteName}', linkedSiteName);
  
  return notice;
});
</script>
