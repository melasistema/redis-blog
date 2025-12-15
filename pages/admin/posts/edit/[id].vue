<!--
Copyright (c) 2025 Luca Visciola
SPDX-License-Identifier: MIT

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

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
        <div v-else-if="!postForm.id" class="text-center text-gray-500">Post not found.</div>
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

                <!-- Featured Image URL -->
                <div>
                    <label for="featured_image" class="block text-sm font-medium text-gray-700">Featured Image URL</label>
                    <input type="text" id="featured_image" v-model="postForm.featured_image"
                           class="mt-1 block w-full py-2 px-3 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" />
                </div>

                <!-- Image Upload Section -->
                <div class="space-y-4 p-4 border border-gray-200 rounded-md">
                    <h3 class="text-lg font-medium text-gray-900">Post Images</h3>
                    <!-- Upload UI -->
                    <div class="flex items-center space-x-4">
                        <input type="file" @change="onFileChange" accept="image/*" ref="fileInput" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
                        <button @click.prevent="uploadImage" :disabled="!selectedFile || isUploading" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                            <span v-if="isUploading">Uploading...</span>
                            <span v-else>Upload</span>
                        </button>
                    </div>

                    <!-- Uploaded Images List -->
                    <div v-if="postForm.images && postForm.images.length > 0" class="space-y-3 mt-4">
                        <h4 class="text-md font-medium text-gray-800">Uploaded Images:</h4>
                        <ul class="list-disc list-inside space-y-2">
                            <li v-for="imgUrl in postForm.images" :key="imgUrl" class="flex items-center justify-between">
                                <a :href="imgUrl" target="_blank" class="text-sm text-blue-600 hover:underline truncate" :title="imgUrl">{{ imgUrl }}</a>
                                <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
                                    <button @click.prevent="setAsFeatured(imgUrl)" class="text-xs px-2 py-1 border rounded-md hover:bg-gray-100">Set as Featured</button>
                                    <button @click.prevent="copyMarkdown(imgUrl)" class="text-xs px-2 py-1 border rounded-md hover:bg-gray-100">Copy Markdown</button>
                                </div>
                            </li>
                        </ul>
                    </div>
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
import type { Post } from '~/server/repositories/PostRepository';

interface ApiResponse {
    success: boolean;
    post?: Post;
    error?: string;
}

interface UploadApiResponse {
    success: boolean;
    url?: string;
    message?: string;
}

definePageMeta({
    middleware: ['auth'],
    layout: 'admin',
});

const route = useRoute();
const router = useRouter();
const postId = computed(() => route.params.id as string);

const postForm = ref<Partial<Post>>({
    id: '',
    slug: '',
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    images: [],
    author: '',
    tags: [],
    createdAt: 0,
});

const isSaving = ref(false);
const isUploading = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const { data, pending, error } = await useFetch<ApiResponse>(`/api/posts/by-id/${postId.value}`, {
    default: () => ({ success: false }),
});

watch(data, (newData) => {
    if (newData?.success && newData.post) {
        postForm.value = { ...newData.post };
        if (!postForm.value.images) {
            postForm.value.images = [];
        }
    }
}, { immediate: true });

const tagsInput = computed({
    get: () => postForm.value.tags?.join(', ') || '',
    set: (val: string) => {
        postForm.value.tags = val.split(',').map(tag => tag.trim()).filter(Boolean);
    },
});

const renderedMarkdown = computed(() => {
    return marked.parse(postForm.value.content || '');
});

function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0];
    }
}

async function uploadImage() {
    if (!selectedFile.value) {
        alert('Please select a file to upload.');
        return;
    }

    isUploading.value = true;
    const formData = new FormData();
    formData.append('image', selectedFile.value);

    try {
        const response = await $fetch<UploadApiResponse>(`/api/posts/${postId.value}/images`, {
            method: 'POST',
            body: formData,
        });

        if (response.success && response.url) {
            if (!postForm.value.images) {
                postForm.value.images = [];
            }
            postForm.value.images.push(response.url);
            alert('Image uploaded successfully!');
            // Reset file input
            selectedFile.value = null;
            if(fileInput.value) fileInput.value.value = '';
        } else {
            throw new Error(response.message || 'Unknown upload error');
        }
    } catch (e: any) {
        alert(`Failed to upload image: ${e.data?.message || e.message}`);
    } finally {
        isUploading.value = false;
    }
}

function setAsFeatured(url: string) {
    postForm.value.featured_image = url;
}

function copyMarkdown(url: string) {
    const markdown = `![Enter alt text](${url})`;
    navigator.clipboard.writeText(markdown).then(() => {
        alert('Markdown link copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy markdown link.');
        console.error('Clipboard copy failed:', err);
    });
}

async function savePost() {
    if (!postForm.value.title || !postForm.value.content) {
        alert('Title and Content cannot be empty.');
        return;
    }

    isSaving.value = true;
    try {
        const payload: Partial<Omit<Post, 'id' | 'createdAt'>> = {
            title: postForm.value.title,
            content: postForm.value.content,
            excerpt: postForm.value.excerpt,
            featured_image: postForm.value.featured_image,
            images: postForm.value.images,
            author: postForm.value.author,
            tags: postForm.value.tags,
        };

        await $fetch(`/api/posts/update/${postId.value}`, {
            method: 'PUT',
            body: payload,
        });

        alert('Post updated successfully!');
        await router.push('/admin/posts');
    } catch (e: any) {
        alert(`Failed to update post: ${e.data?.message || e.message}`);
    } finally {
        isSaving.value = false;
    }
}
</script>

<style scoped>
.prose {
  font-size: 1rem;
  line-height: 1.75rem;
}
.prose h1 {
  font-size: 2em;
  font-weight: bold;
}
.prose h2 {
  font-size: 1.5em;
  font-weight: bold;
}
.prose h3 {
  font-size: 1.25em;
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
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-family: monospace;
}
.prose pre {
  background-color: #1f2937;
  color: #e5e7eb;
  padding: 1em;
  border-radius: 0.375rem;
  overflow-x: auto;
}
</style>