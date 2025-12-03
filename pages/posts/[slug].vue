<template>
  <div class="container">
    <header>
      <NuxtLink to="/" class="back-link">&larr; Back to all posts</NuxtLink>
      <h1 v-if="post">{{ post.title }}</h1>
      <h1 v-else>Loading Post...</h1>
    </header>

    <main>
      <div v-if="pending" class="loading">Loading post details...</div>
      <div v-else-if="error" class="error-message">
        <p>Error loading post: {{ error.message }}</p>
        <p>This might happen if the post does not exist or there's a server issue.</p>
      </div>
      <div v-else-if="post" class="post-content-wrapper">
        <div class="post-meta">
          <span>By {{ post.author }}</span>
          <span>Published on {{ new Date(post.createdAt).toLocaleDateString() }}</span>
        </div>
        <div class="post-content" v-html="renderedContent"></div>
        <div class="tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
      <div v-else class="no-post">
        <p>Post not found.</p>
        <NuxtLink to="/">Go back home</NuxtLink>
      </div>

      <nav v-if="post && blogConfig.postNavigation.enabled && (neighbors.prev || neighbors.next)" class="post-navigation">
        <NuxtLink v-if="neighbors.prev" :to="`/posts/${neighbors.prev.slug}`" class="nav-link prev">
          <span class="arrow">&larr;</span>
          <span class="text">
            <span class="label">Previous Post</span>
            <span class="title">{{ neighbors.prev.title }}</span>
          </span>
        </NuxtLink>
        <NuxtLink v-if="neighbors.next" :to="`/posts/${neighbors.next.slug}`" class="nav-link next">
          <span class="text">
            <span class="label">Next Post</span>
            <span class="title">{{ neighbors.next.title }}</span>
          </span>
          <span class="arrow">&rarr;</span>
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

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-color);
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

header h1 {
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  text-align: center;
}

main {
  padding-top: 1rem;
}

.loading, .error-message, .no-post {
  text-align: center;
  font-size: 1.1rem;
  padding: 2rem;
  border-radius: 8px;
}

.error-message {
  color: var(--error-color);
  background-color: var(--error-color-light);
  border: 1px solid var(--error-color);
}

.post-content-wrapper {
  background-color: var(--background-color);
  border: 1px solid var(--secondary-color-light);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.post-meta {
  font-size: 0.9rem;
  color: var(--secondary-color);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--secondary-color-light);
  padding-bottom: 0.8rem;
}

.post-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: var(--text-color);
}

.post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  color: var(--text-color);
}

.post-content p {
  margin-bottom: 1rem;
}

.tags {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--secondary-color-light);
}

.tag {
  display: inline-block;
  background-color: var(--secondary-color-light);
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-right: 8px;
  margin-bottom: 8px;
  text-decoration: none;
}

.post-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--secondary-color-light);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--text-color);
  padding: 1rem;
  border-radius: 8px;
  max-width: 50%;
  border: 1px solid transparent;
  transition: background-color 0.2s, border-color 0.2s;
}

.nav-link:hover {
  background-color: var(--secondary-color-light);
  border-color: var(--secondary-color);
}

.nav-link.next {
  text-align: right;
  justify-content: flex-end;
}

.nav-link .text {
  display: flex;
  flex-direction: column;
}

.nav-link .label {
  font-size: 0.9rem;
  color: var(--secondary-color);
  margin-bottom: 0.25rem;
}

.nav-link .title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link .arrow {
  font-size: 1.5rem;
  color: var(--primary-color);
}
</style>
