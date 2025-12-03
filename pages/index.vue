<template>
  <div :style="{ maxWidth: blogConfig.contentMaxWidth }" class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header class="text-center mb-8 border-b border-secondary-light pb-4">
      <h1 class="font-h1 text-4xl m-0 text-text">{{ blogConfig.headerTitle }}</h1>
      <p class="text-lg text-secondary" v-html="blogConfig.headerTagline"></p>
    </header>

    <div class="text-center mb-8">
      <p v-if="postsError" class="text-error mt-4">{{ postsError.message }}</p>
    </div>

    <main>
      <section class="mb-8 border-b border-secondary-light pb-8">
        <h2 class="font-h2 text-3xl mb-6 text-text">Tags</h2>
        <div v-if="tagsPending" class="text-center text-secondary text-lg py-8">Loading tags...</div>
        <div v-else-if="uniqueTags && uniqueTags.length > 0" class="flex flex-wrap gap-2 justify-center">
          <span v-for="tag in uniqueTags" :key="tag" class="bg-secondary-light text-primary-dark py-2 px-4 rounded-full text-sm no-underline transition-colors hover:bg-primary-dark hover:text-white cursor-pointer">{{ tag }}</span>
        </div>
        <div v-else class="text-center text-secondary text-lg py-8">
          <p>No tags found.</p>
        </div>
      </section>

      <h2 class="font-h2 text-3xl mb-6 text-text">Recent Posts</h2>
      <div v-if="postsPending" class="text-center text-secondary text-lg py-8">Loading posts...</div>
      <div v-else-if="posts && posts.length > 0" class="grid gap-6">
        <NuxtLink v-for="post in posts" :key="post.id" :to="`/posts/${post.slug}`">
          <div class="bg-background border border-secondary-light rounded-lg p-6 transition-shadow shadow-sm hover:shadow-lg">
            <h2 class="font-h3 text-2xl text-text mt-0">{{ post.title }}</h2>
            <div class="text-sm text-secondary mb-4 flex justify-between">
              <span>By {{ post.author }}</span>
              <span>{{ new Date(post.createdAt).toISOString().split('T')[0] }}</span>
            </div>
            <div class="prose max-w-none text-text leading-relaxed" v-html="post.content"></div>
            <div class="mt-4">
              <span v-for="tag in post.tags" :key="tag" class="inline-block bg-secondary-light text-primary py-1 px-2 rounded text-xs mr-2">{{ tag }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="text-center text-secondary text-lg py-8">
        <p>No posts yet.</p>
      </div>

      <nav v-if="paginationEnabled && meta && meta.totalPages > 1" class="flex justify-center items-center mt-10 gap-4" aria-label="Pagination">
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

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;
const paginationEnabled = blogConfig.pagination.enabled;

const page = ref(parseInt(route.query.page) || 1);

// Custom renderer to demote heading levels for SEO on the homepage
const renderer = new marked.Renderer();
renderer.heading = (text, level) => {
  const newLevel = Math.min(6, level + 2); // Demote by 2 levels
  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${newLevel} id="${id}">${text}</h${newLevel}>`;
};

// Fetch posts from our API endpoint with pagination
const { data: postsData, pending: postsPending, error: postsError, refresh: refreshPosts } = await useFetch('/api/posts', {
  query: { page },
  watch: [page],
  transform: (res) => {
    if (res && res.posts) {
      res.posts = res.posts.map(post => {
        let content = post.content || '';
        if (blogConfig.postExcerpt?.enabled && content.length > blogConfig.postExcerpt.maxLength) {
          content = content.substring(0, blogConfig.postExcerpt.maxLength);
          content = content.substring(0, Math.min(content.length, content.lastIndexOf(' ')));
          content += '...';
        }
        return {
          ...post,
          content: marked(content, { renderer })
        };
      });
    }
    return res || { posts: [], meta: {} };
  },
  default: () => ({ posts: [], meta: {} })
});

const posts = computed(() => postsData.value.posts);
const meta = computed(() => postsData.value.meta);

// Function to change page
const changePage = (newPage) => {
  if (newPage > 0 && newPage <= meta.value.totalPages) {
    page.value = newPage;
    router.push({ query: { page: newPage } });
  }
};

// Fetch unique tags from our API endpoint
const { data: tagsResult, pending: tagsPending } = await useFetch('/api/tags', {
  transform: (res) => res.tags || [],
  default: () => ({ tags: [] })
});

const uniqueTags = computed(() => tagsResult.value);
</script>


