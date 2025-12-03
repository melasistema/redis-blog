<template>
  <div :style="{ maxWidth: blogConfig.contentMaxWidth }" class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <header>
      <NuxtLink to="/" class="inline-block mb-6 text-primary no-underline font-medium hover:underline">&larr; Back to all posts</NuxtLink>
      <h1 v-if="post" class="font-h1 text-4xl mb-6 text-center text-text">{{ post.title }}</h1>
      <h1 v-else class="font-h1 text-4xl mb-6 text-center text-text">Loading Post...</h1>
    </header>

    <main class="pt-4">
      <div v-if="pending" class="text-center text-lg py-8 rounded-lg">Loading post details...</div>
      <div v-else-if="error" class="text-center text-lg py-8 rounded-lg text-error bg-error-light border border-error">
        <p>Error loading post: {{ error.message }}</p>
        <p>This might happen if the post does not exist or there's a server issue.</p>
      </div>
      <div v-else-if="post" class="bg-background border border-secondary-light rounded-lg p-8 shadow-sm">
        <div class="text-sm text-secondary mb-6 flex justify-between border-b border-secondary-light pb-3">
          <span>By {{ post.author }}</span>
          <span>Published on {{ new Date(post.createdAt).toLocaleDateString() }}</span>
        </div>
        <div class="prose max-w-none" v-html="renderedContent"></div>
        <div class="mt-8 pt-4 border-t border-secondary-light">
          <span v-for="tag in post.tags" :key="tag" class="inline-block bg-secondary-light text-primary py-1.5 px-3 rounded-full text-sm mr-2 mb-2 no-underline">{{ tag }}</span>
        </div>
      </div>
      <div v-else class="text-center text-lg py-8 rounded-lg">
        <p>Post not found.</p>
        <NuxtLink to="/">Go back home</NuxtLink>
      </div>

      <nav v-if="post && blogConfig.postNavigation.enabled && (neighbors.prev || neighbors.next)" class="flex justify-between mt-12 pt-8 border-t border-secondary-light">
        <NuxtLink v-if="neighbors.prev" :to="`/posts/${neighbors.prev.slug}`" class="flex items-center gap-4 no-underline text-text p-4 rounded-lg max-w-[50%] border border-transparent transition-colors hover:bg-secondary-light hover:border-secondary">
          <span class="text-2xl text-primary">&larr;</span>
          <span class="flex flex-col">
            <span class="text-sm text-secondary mb-1">Previous Post</span>
            <span class="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ neighbors.prev.title }}</span>
          </span>
        </NuxtLink>
        <NuxtLink v-if="neighbors.next" :to="`/posts/${neighbors.next.slug}`" class="flex items-center gap-4 no-underline text-text p-4 rounded-lg max-w-[50%] border border-transparent transition-colors hover:bg-secondary-light hover:border-secondary text-right justify-end">
          <span class="flex flex-col">
            <span class="text-sm text-secondary mb-1">Next Post</span>
            <span class="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ neighbors.next.title }}</span>
          </span>
          <span class="text-2xl text-primary">&rarr;</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { marked } from 'marked';

const route = useRoute();
const slug = route.params.slug;

const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;

const { data: result, pending, error } = await useFetch(`/api/posts/${slug}`, {
  transform: (res) => res || { post: null, neighbors: null },
  default: () => ({ post: null, neighbors: { prev: null, next: null } }),
});

const post = computed(() => result.value.post);
const neighbors = computed(() => result.value.neighbors || { prev: null, next: null });

const renderedContent = computed(() => {
  if (post.value?.content) {
    return marked(post.value.content);
  }
  return '';
});
</script>
