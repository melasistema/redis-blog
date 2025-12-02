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
        <div class="post-content" v-html="post.content"></div>
        <div class="tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
      <div v-else class="no-post">
        <p>Post not found.</p>
        <NuxtLink to="/">Go back home</NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const slug = route.params.slug;

const runtimeConfig = useRuntimeConfig();
const blogConfig = runtimeConfig.public.blogConfig;

const { data: result, pending, error } = await useFetch(`/api/posts/${slug}`, {
  transform: (res) => res.post || null,
});

const post = computed(() => result.value);
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
</style>