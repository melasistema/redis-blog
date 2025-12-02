<template>
  <div class="container">
    <header>
      <h1>This is your Blog build with Nuxt and Redis</h1>
      <p>A powerful and elegant blog architecture inspired by <a href="https://antirez.com/" target="_blank" rel="noopener noreferrer">Salvatore Sanfilippo</a></p>
    </header>

    <div class="controls">
      <!-- <button @click="createPost" :disabled="isCreating">
        {{ isCreating ? 'Creating...' : 'Create New Post' }}
      </button> -->
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <main>
      <section class="tag-cloud-section">
        <h2>Tags</h2>
        <div v-if="tagsPending" class="loading">Loading tags...</div>
        <div v-else-if="uniqueTags && uniqueTags.length > 0" class="tag-cloud">
          <span v-for="tag in uniqueTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div v-else class="no-tags">
          <p>No tags found.</p>
        </div>
      </section>

      <h2>Recent Posts</h2>
      <div v-if="pending" class="loading">Loading posts...</div>
      <div v-else-if="posts && posts.length > 0" class="posts-grid">
        <NuxtLink v-for="post in posts" :key="post.id" :to="`/posts/${post.slug}`" class="post-link">
          <div class="post-card">
            <h3>{{ post.title }}</h3>
            <div class="post-meta">
              <span>By {{ post.author }}</span>
              <span>{{ new Date(post.createdAt).toISOString().split('T')[0] }}</span>
            </div>
            <div class="post-content" v-html="post.content"></div>
            <div class="tags">
              <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="no-posts">
        <p>No posts yet.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'; // Added computed here

const error = ref(null);
const isCreating = ref(false);

const runtimeConfig = useRuntimeConfig(); // Access runtime config
const blogConfig = runtimeConfig.public.blogConfig;

// Fetch posts from our API endpoint
const { data: result, pending, refresh } = await useFetch('/api/posts', {
  transform: (res) => res.posts || [],
  default: () => ({ posts: [] })
});

const posts = computed(() => result.value);

// Fetch unique tags from our API endpoint
const { data: tagsResult, pending: tagsPending } = await useFetch('/api/tags', {
  transform: (res) => res.tags || [],
  default: () => ({ tags: [] })
});

const uniqueTags = computed(() => tagsResult.value);

// Function to create a new post
const createPost = async () => {
  isCreating.value = true;
  error.value = null;
  try {
    const response = await $fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Post at ${new Date().toLocaleTimeString()}`,
        content: `<p>This is a new post created at ${new Date().toLocaleString()}.</p>`,
        tags: ['new', 'live']
      })
    });
    if (response.success) {
      // Refresh the list of posts after creating a new one
      await refresh();
    } else {
      throw new Error(response.error || 'Failed to create post.');
    }
  } catch (err) {
    error.value = err.message;
    console.error('Error creating post:', err);
  } finally {
    isCreating.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-color);
}

header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--secondary-color-light);
  padding-bottom: 1rem;
}

header h1 {
  font-size: 2.5rem;
  margin: 0;
}

.controls {
  text-align: center;
  margin-bottom: 2rem;
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: var(--secondary-color-light);
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.error-message {
  color: var(--error-color);
  margin-top: 1rem;
}

main h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.loading, .no-posts {
  text-align: center;
  color: var(--secondary-color);
  font-size: 1.1rem;
  padding: 2rem;
}

.posts-grid {
  display: grid;
  gap: 1.5rem;
}

.post-card {
  background-color: var(--background-color);
  border: 1px solid var(--secondary-color-light);
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.post-card h3 {
  margin-top: 0;
  color: var(--text-color);
}

.post-meta {
  font-size: 0.9rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.post-content {
  color: var(--text-color);
  line-height: 1.6;
}

.tags {
  margin-top: 1rem;
}

.tag {
  display: inline-block;
  background-color: var(--secondary-color-light);
  color: var(--primary-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 5px;
}

/* New styles for tag cloud */
.tag-cloud-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--secondary-color-light);
  padding-bottom: 2rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.tag-cloud .tag {
  background-color: var(--secondary-color-light);
  color: var(--primary-color-dark);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.tag-cloud .tag:hover {
  background-color: var(--primary-color-dark);
  color: white;
  cursor: pointer;
}

.no-tags {
  text-align: center;
  color: var(--secondary-color);
  font-size: 1.1rem;
  padding: 2rem;
}
</style>