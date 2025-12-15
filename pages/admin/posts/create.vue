<!--
Copyright (c) 2025 Luca Visciola
SPDX-License-Identifier: MIT

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">Create New Post</h1>

        <!-- Top Right Actions -->
        <div class="flex justify-end items-center mb-6 space-x-3">
            <NuxtLink to="/admin/posts"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Cancel
            </NuxtLink>
            <button type="submit" :disabled="isSaving" @click.prevent="createPost"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="isSaving">Creating...</span>
                <span v-else>Create Post</span>
            </button>
        </div>

        <div>
            <form @submit.prevent="createPost" class="space-y-6">
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

                <!-- Featured Image URL -->
                <div>
                    <label for="featured_image" class="block text-sm font-medium text-gray-700">Featured Image URL</label>
                    <input type="text" id="featured_image" v-model="postForm.featured_image"
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';
import type { Post } from '~/server/repositories/PostRepository';

definePageMeta({
    middleware: ['auth'], // Protect this route with auth middleware
    layout: 'admin',     // Use the custom admin layout
});

const router = useRouter();

const postForm = ref<Partial<Post>>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    author: '',
    tags: [],
});

const isSaving = ref(false);

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

async function createPost() {
    if (!postForm.value.title || !postForm.value.content) {
        alert('Title and Content cannot be empty.');
        return;
    }

    isSaving.value = true;
    try {
        const payload: Partial<Omit<Post, 'id' | 'slug' | 'images'>> & { createdAt: number } = {
            title: postForm.value.title,
            content: postForm.value.content,
            excerpt: postForm.value.excerpt,
            featured_image: postForm.value.featured_image,
            author: postForm.value.author,
            tags: postForm.value.tags,
            createdAt: Date.now(),
        };

        const response = await $fetch('/api/posts', {
            method: 'POST',
            body: payload,
        });

        if(response.post) {
             await router.push(`/admin/posts/edit/${response.post.id}`);
        } else {
            alert('Post created successfully, but could not redirect to edit page.');
            await router.push('/admin/posts');
        }

    } catch (e: any) {
        alert(`Failed to create post: ${e.data?.message || e.message}`);
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
