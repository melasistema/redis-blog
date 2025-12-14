<!--
Copyright (c) 2025 Luca Visciola
SPDX-License-Identifier: MIT

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

<template>
  <div :style="{ maxWidth: blogConfig.contentMaxWidth }" class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header class="text-center mb-8 border-b border-secondary-light pb-4">
      <h1 class="font-h1 text-4xl m-0 text-text">{{ blogConfig.headerTitle }}</h1>
      <p class="text-lg text-secondary" v-html="blogConfig.headerTagline"></p>
    </header>

    <div class="text-center mb-8">
      <!-- Search Bar -->
      <div class="relative max-w-lg mx-auto">
        <input
          type="search"
          v-model="searchQueryInput"
          placeholder="Search posts..."
          @input="debouncedSearch"
          class="w-full py-3 px-4 pl-10 bg-background border border-secondary-light rounded-full text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.477l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      <p v-if="postsError" class="text-error mt-4">{{ postsError.message }}</p>
    </div>

    <main>
      <section class="mb-8 border-b border-secondary-light pb-8">
        <h2 class="font-h2 text-3xl mb-6 text-text">Tags</h2>
        <!-- Top-level container for pending state vs. content -->
        <div>
          <!-- Loading state -->
          <div v-if="tagsPending" class="text-center text-secondary text-lg py-8">Loading tags...</div>
          <!-- Content state -->
          <div v-else>
            <!-- Tags list -->
            <div v-if="uniqueTags && uniqueTags.length > 0" class="flex flex-wrap gap-2 justify-center">
              <span
                v-for="tag in uniqueTags"
                :key="tag"
                @click="searchByTag(tag)"
                class="bg-secondary text-white py-2 px-4 rounded-full text-sm no-underline transition-colors hover:bg-primary hover:text-white cursor-pointer"
              >
                #{{ tag }}
              </span>
            </div>
            <!-- Empty state -->
            <div v-else class="text-center text-secondary text-lg py-8">
              <p>No tags found.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Title: "Search Results" or "Recent Posts" -->
      <h2 class="font-h2 text-3xl mb-6 text-text">{{ searchQuery ? 'Search Results' : 'Recent Posts' }}</h2>

      <!-- Top-level container for pending state vs. content -->
      <div>
        <!-- Loading state -->
        <div v-if="postsPending" class="text-center text-secondary text-lg py-8">Loading posts...</div>
        
        <!-- Content state -->
        <div v-else>
          <!-- Post list -->
          <div v-if="posts.length > 0" class="grid gap-6">
            <NuxtLink v-for="post in posts" :key="post.id" :to="`/posts/${post.slug}`">
              <div class="bg-background border border-secondary-light rounded-lg p-6 transition-shadow shadow-sm hover:shadow-lg">
                <h2 class="font-h3 text-2xl text-text mt-0">{{ post.title }}</h2>
                <div class="text-sm text-secondary mb-4 flex justify-between">
                  <span>By {{ post.author }}</span>
                  <span>{{ new Date(post.createdAt).toISOString().split('T')[0] }}</span>
                </div>
                <div class="prose max-w-none text-text leading-relaxed" v-html="post.content"></div>
                <div class="mt-4">
                  <span v-for="tag in post.tags" :key="tag" class="inline-block bg-secondary-light text-primary py-1 px-2 rounded text-xs mr-2">#{{ tag }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
          <!-- Empty state -->
          <div v-else class="text-center text-secondary text-lg py-8">
            <p>{{ searchQuery ? `No results found for "${searchQuery}"` : 'No posts yet.' }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination (only shown when not searching) -->
      <nav v-if="!searchQuery && paginationEnabled && meta && meta.totalPages > 1" class="flex justify-center items-center mt-10 gap-4" aria-label="Pagination">
        <button @click="changePage(meta.page - 1)" :disabled="meta.page <= 1" class="bg-primary text-white py-2 px-5 text-base rounded cursor-pointer transition-colors disabled:bg-secondary-light disabled:cursor-not-allowed hover:not(:disabled):bg-primary-dark">
          &larr; Previous
        </button>
        <span class="text-secondary font-medium">Page {{ meta.page }} of {{ meta.totalPages }}</span>
        <button @click="changePage(meta.page + 1)" :disabled="meta.page >= meta.totalPages" class="bg-primary text-white py-2 px-5 text-base rounded cursor-pointer transition-colors disabled:bg-secondary-light disabled:cursor-not-allowed hover:not(:disabled):bg-primary-dark">
          Next &rarr;
        </button>
      </nav>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import { useSeo } from '~/composables/useSeo'; // Import useSeo

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;

// Set SEO for the homepage
// Set SEO for the homepage
useSeo({
  title: blogConfig.siteName,
  description: blogConfig.headerTagline.replace(/<[^>]*>?/gm, ''), // Strip HTML tags from tagline
  url: '/', // Base URL
  type: 'website',
});
const paginationEnabled = blogConfig.pagination.enabled;

// --- Search State ---
const searchQuery = ref(route.query.q || '');
const searchQueryInput = ref(searchQuery.value); // A separate ref for the input to allow debouncing
let debounceTimer = null;

// Debounce function to prevent API calls on every keystroke
const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery.value = searchQueryInput.value;
  }, 300); // 300ms delay
};

// --- Pagination State ---
const page = ref(parseInt(route.query.page) || 1);

// --- Data Fetching ---

// Re-usable query parameters for useFetch
const queryParams = computed(() => {
  const params = {};
  if (searchQuery.value) {
    params.q = searchQuery.value;
  } else {
    params.page = page.value;
  }
  return params;
});

// Custom renderer to demote heading levels for SEO on the homepage
const renderer = new marked.Renderer();
renderer.heading = (text, level) => {
  const newLevel = Math.min(6, level + 2); // Demote by 2 levels
  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${newLevel} id="${id}">${text}</h${newLevel}>`;
};

// Fetch posts from our API endpoint. This is now reactive to both search and pagination.
const { data: postsData, pending: postsPending, error: postsError } = await useFetch('/api/posts', {
  query: queryParams, // Use reactive queryParams
  default: () => ({ posts: [], meta: {} }),
  transform: (res) => {
    if (!res || !res.posts) return { posts: [], meta: {} };
    
    res.posts = res.posts.map(post => {
      let content = post.content || '';
      // Create excerpt only if search is not active
      if (!searchQuery.value && blogConfig.postExcerpt?.enabled && content.length > blogConfig.postExcerpt.maxLength) {
        content = content.substring(0, blogConfig.postExcerpt.maxLength);
        content = content.substring(0, Math.min(content.length, content.lastIndexOf(' ')));
        content += '...';
      }
      return { ...post, content: marked.parse(content, { renderer }) };
    });
    return res;
  },
});

const posts = computed(() => postsData.value?.posts || []);
const meta = computed(() => postsData.value?.meta || {});

// Update router query when page or search query changes
watch([page, searchQuery], ([newPage, newSearchQuery]) => {
  const query = {};
  if (newSearchQuery) {
    query.q = newSearchQuery;
    page.value = 1; // Reset to first page on new search
  } else if (newPage > 1) {
    query.page = newPage;
  }
  router.push({ query });
});

// Function to change page
const changePage = (newPage) => {
  if (newPage > 0 && newPage <= meta.value.totalPages) {
    page.value = newPage;
  }
};

// Function to search by tag
const searchByTag = (tag) => {
  searchQueryInput.value = `@tags:{${tag}}`;
  searchQuery.value = searchQueryInput.value;
};

// --- Tags Fetching ---
const { data: tagsResult, pending: tagsPending } = await useFetch('/api/tags', {
  transform: (res) => res.tags || [],
  default: () => ({ tags: [] })
});

const uniqueTags = computed(() => tagsResult.value);
</script>