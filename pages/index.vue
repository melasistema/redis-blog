<template>
  <div class="container">
    <header>
      <h1>Redis & Nuxt Blog</h1>
      <p>A powerful and elegant blog architecture inspired by <a href="https://antirez.com/" target="_blank">Salvatore Sanfilippo.</a></p>
    </header>

    <div class="controls">
      <!-- <button @click="createPost" :disabled="isCreating">
        {{ isCreating ? 'Creating...' : 'Create New Post' }}
      </button> -->
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <main>
      <h2>Recent Posts</h2>
      <div v-if="pending" class="loading">Loading posts...</div>
      <div v-else-if="posts && posts.length > 0" class="posts-grid">
        <NuxtLink v-for="post in posts" :key="post.id" :to="`/posts/${post.slug}`" class="post-link">
          <div class="post-card">
            <h3>{{ post.title }}</h3>
            <div class="post-meta">
              <span>By {{ post.author }}</span>
              <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
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
import { ref } from 'vue';

const error = ref(null);
const isCreating = ref(false);

// Fetch posts from our API endpoint
const { data: result, pending, refresh } = await useFetch('/api/posts', {
  transform: (res) => res.posts || [],
  default: () => ({ posts: [] })
});

const posts = computed(() => result.value);

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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
}

header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
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
  background-color: #00DC82; /* Nuxt Green */
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #00b36b;
}

.error-message {
  color: #e53e3e; /* Red */
  margin-top: 1rem;
}

main h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.loading, .no-posts {
  text-align: center;
  color: #777;
  font-size: 1.1rem;
  padding: 2rem;
}

.posts-grid {
  display: grid;
  gap: 1.5rem;
}

.post-card {
  background-color: #f9f9f9;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.post-card h3 {
  margin-top: 0;
  color: #003c3c;
}

.post-meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.post-content {
  color: #444;
  line-height: 1.6;
}

.tags {
  margin-top: 1rem;
}

.tag {
  display: inline-block;
  background-color: #e0f2f1;
  color: #00796b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 5px;
}
</style>
