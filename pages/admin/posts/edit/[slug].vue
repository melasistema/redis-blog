<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">Edit Blog Post</h1>

        <!-- Top Right Actions -->
        <div class="flex justify-end items-center mb-6 space-x-3">
            <NuxtLink to="/admin/posts"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Cancel
            </NuxtLink>
            <button type="submit" :disabled="isSaving" @click.prevent="savePost"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save Changes</span>
            </button>
        </div>

        <div v-if="pending" class="text-center text-gray-500">Loading post data...</div>
        <div v-else-if="error" class="text-center text-red-500">Error: {{ error.message }}</div>
        <div v-else-if="!postForm.slug" class="text-center text-gray-500">Post not found.</div>
        <div v-else>
            <form @submit.prevent="savePost" class="space-y-6">
                <!-- Title -->
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" v-model="postForm.title"
                           class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                           required />
                </div>

                <!-- Author -->
                <div>
                    <label for="author" class="block text-sm font-medium text-gray-700">Author</label>
                    <input type="text" id="author" v-model="postForm.author"
                           class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" />
                </div>

                <!-- Tags -->
                <div>
                    <label for="tags" class="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input type="text" id="tags" v-model="tagsInput"
                           class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" />
                </div>

                <!-- Excerpt -->
                <div>
                    <label for="excerpt" class="block text-sm font-medium text-gray-700">Excerpt</label>
                    <textarea id="excerpt" v-model="postForm.excerpt" rows="3"
                              class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"></textarea>
                </div>

                <!-- Image URL -->
                <div>
                    <label for="image" class="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" id="image" v-model="postForm.image"
                           class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" />
                </div>

                <!-- Markdown Editor & Preview -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="content" class="block text-sm font-medium text-gray-700">Content (Markdown)</label>
                        <textarea id="content" v-model="postForm.content" rows="15"
                                  class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 font-mono"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Preview</label>
                        <div class="mt-1 p-4 bg-gray-50 rounded-md border border-gray-200 prose max-w-none h-full overflow-y-auto"
                             v-html="renderedMarkdown"></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import type { Post, NeighborPost } from '~/server/repositories/PostRepository';

// Define the expected response type for the API call
interface ApiResponse {
    success: boolean;
    post?: Post;
    neighbors?: { prev: NeighborPost; next: NeighborPost } | null;
    error?: string;
}

definePageMeta({
    middleware: ['auth'], // Protect this route with auth middleware
    layout: 'admin',     // Use the custom admin layout
});

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

const postForm = ref<Partial<Post>>({
    slug: '',
    title: '',
    content: '',
    excerpt: '',
    image: '',
    author: '',
    tags: [],
    createdAt: 0,
});

const isSaving = ref(false);

// Fetch initial post data
const { data, pending, error } = await useFetch<ApiResponse>(`/api/posts/${slug.value}`, {
    default: () => ({ success: false }), // A default empty successful response
});

watch(data, (newData) => {
    if (newData?.success && newData.post) {
        postForm.value = { ...newData.post };
    }
}, { immediate: true });

// Computed property for tags input (string to array conversion)
const tagsInput = computed({
    get: () => postForm.value.tags?.join(', ') || '',
    set: (val: string) => {
        postForm.value.tags = val.split(',').map(tag => tag.trim()).filter(Boolean);
    },
});

// Computed property for Markdown preview
const renderedMarkdown = computed(() => {
    return marked.parse(postForm.value.content || '');
});

async function savePost() {
    if (!postForm.value.title || !postForm.value.content) {
        alert('Title and Content cannot be empty.');
        return;
    }

    isSaving.value = true;
    try {
        const payload: Partial<Post> = {
            title: postForm.value.title,
            content: postForm.value.content,
            excerpt: postForm.value.excerpt,
            image: postForm.value.image,
            author: postForm.value.author,
            tags: postForm.value.tags,
            createdAt: postForm.value.createdAt, // Preserve original creation date
        };

        await $fetch(`/api/posts/${slug.value}`, {
            method: 'PUT',
            body: payload,
        });

        alert('Post updated successfully!');
        await router.push('/admin/posts'); // Redirect to post list
    } catch (e: any) {
        alert(`Failed to update post: ${e.message}`);
    } finally {
        isSaving.value = false;
    }
}
</script>

<style scoped>
/* Add any specific styles here */
.prose {
  /* Default styles for prose content, adjust as needed */
  font-size: 1rem;
  line-height: 1.75rem;
}

.prose h1 {
  font-size: 2em; /* Tailwind h1 size */
  font-weight: bold;
}

.prose h2 {
  font-size: 1.5em; /* Tailwind h2 size */
  font-weight: bold;
}

.prose h3 {
  font-size: 1.25em; /* Tailwind h3 size */
  font-weight: bold;
}

.prose p {
  margin-bottom: 1em;
}

.prose ul, .prose ol {
  margin-left: 1.5em;
  list-style-type: disc;
}

.prose ol {
    list-style-type: decimal;
}

.prose code {
  background-color: #f3f4f6; /* gray-100 */
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-family: monospace;
}

.prose pre {
  background-color: #1f2937; /* gray-800 */
  color: #e5e7eb; /* gray-200 */
  padding: 1em;
  border-radius: 0.375rem;
  overflow-x: auto;
}
</style>
