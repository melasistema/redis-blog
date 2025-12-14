<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Manage Blog Posts</h1>

    <div v-if="pending" class="text-center text-gray-500">Loading posts...</div>
    <div v-else-if="error" class="text-center text-red-500">Error: {{ error.message }}</div>
    <div v-else-if="!posts || posts.length === 0" class="text-center text-gray-500">No posts found.</div>
    <div v-else>
      <div class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full divide-y divide-gray-200 md:table">
          <thead class="bg-gray-50 md:table-header-group">
            <tr class="md:table-row">
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" class="px-6 py-3 hidden md:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th scope="col" class="px-6 py-3 hidden md:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published At
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 md:table-row-group">
            <tr v-for="post in posts" :key="post.slug" class="block md:table-row bg-white shadow-md md:shadow-none rounded-lg mb-4 md:mb-0">
              <td data-label="Title" class="px-6 py-4 whitespace-nowrap block md:table-cell">
                <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
              </td>
              <td data-label="Author" class="px-6 py-4 hidden md:table-cell whitespace-nowrap block md:table-cell">
                <div class="text-sm text-gray-500">{{ post.author }}</div>
              </td>
              <td data-label="Tags" class="px-6 py-4 hidden md:table-cell block md:table-cell">
                <span v-for="tag in post.tags" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-1">
                  {{ tag }}
                </span>
              </td>
              <td data-label="Published At" class="px-6 py-4 whitespace-nowrap block md:table-cell text-sm text-gray-500">
                {{ new Date(post.createdAt).toLocaleDateString() }}
              </td>
              <td data-label="Actions" class="px-6 py-4 whitespace-nowrap block md:table-cell text-left text-sm font-medium">
                <NuxtLink :to="`/admin/posts/edit/${post.slug}`" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</NuxtLink>
                <button @click="deletePost(post.slug)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination controls -->
      <nav v-if="meta && meta.totalPages > 1" class="flex justify-center items-center mt-10 gap-4" aria-label="Pagination">
        <button @click="changePage(meta.page - 1)" :disabled="meta.page <= 1" class="bg-primary text-white py-2 px-5 text-base rounded cursor-pointer transition-colors disabled:bg-secondary-light disabled:cursor-not-allowed hover:not(:disabled):bg-primary-dark">
          &larr; Previous
        </button>
        <span class="text-secondary font-medium">Page {{ meta.page }} of {{ meta.totalPages }}</span>
        <button @click="changePage(meta.page + 1)" :disabled="meta.page >= meta.totalPages" class="bg-primary text-white py-2 px-5 text-base rounded cursor-pointer transition-colors disabled:bg-secondary-light disabled:cursor-not-allowed hover:not(:disabled):bg-primary-dark">
          Next &rarr;
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Post } from '~/server/repositories/PostRepository';
import { defaultAdminConfig } from '~/config/admin.config'; // Import admin config

definePageMeta({
  middleware: ['auth'], // Protect this route with auth middleware
});

const route = useRoute();
const router = useRouter();

const { pagination } = defaultAdminConfig;
const limit = pagination.postsPerPage;
const page = ref(parseInt(route.query.page as string) || 1);

const queryParams = computed(() => ({
  page: page.value,
  limit: limit,
}));

const { data, pending, error } = await useFetch('/api/posts', {
  query: queryParams,
  default: () => ({ posts: [], meta: {
    total: 0,
    page: 1,
    limit: limit,
    totalPages: 1,
  }}),
});

const posts = computed(() => data.value?.posts || []);
const meta = computed(() => data.value?.meta || {});

// Update router query when page changes
watch(page, (newPage) => {
  const query = {};
  if (newPage > 1) {
    query.page = newPage;
  }
  router.push({ query });
});

// Function to change page
const changePage = (newPage: number) => {
  if (newPage > 0 && newPage <= meta.value.totalPages) {
    page.value = newPage;
  }
};

async function deletePost(slug: string) {
  if (!confirm(`Are you sure you want to delete the post "${slug}"?`)) {
    return;
  }
  try {
    // Implement API call to delete post
    console.log(`Deleting post with slug: ${slug}`);
    // await $fetch(`/api/posts/${slug}`, { method: 'DELETE' }); // This endpoint doesn't exist yet
    alert('Delete functionality not yet implemented in API.');
    // useFetch automatically re-fetches when queryParams changes, but we can manually trigger if needed.
    // For now, assume a change in data would trigger a refetch if needed.
  } catch (e: any) {
    alert(`Failed to delete post: ${e.message}`);
  }
}
</script>

<style scoped>
@media (max-width: 767px) { /* md breakpoint is 768px by default */
  .md\:table {
    display: block;
  }
  .md\:table-header-group {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }
  .md\:table-row-group {
    display: block;
  }
  .md\:table-row {
    border: 1px solid #e2e8f0; /* secondary-light */
    margin-bottom: 1rem; /* mb-4 */
    display: block;
  }
  .md\:table-cell {
    border: none;
    border-bottom: 1px solid #e2e8f0; /* secondary-light */
    position: relative;
    padding-left: calc(30% + 1rem); /* Adjust padding for data-label */
    display: block;
    text-align: right;
  }
  .md\:table-cell:last-child {
    border-bottom: none;
  }
  .md\:table-cell::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    width: 30%;
    padding-right: 1rem;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
    color: #4a5568; /* gray-700 */
  }

  /* Specific adjustments for cells that contain links/buttons */
  td[data-label="Actions"] {
    text-align: left; /* Align actions to the left for better usability */
  }
  td[data-label="Actions"]::before {
    content: "Actions";
    text-align: left;
  }
}
</style>