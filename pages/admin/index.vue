<template>
    <h2 class="text-3xl font-semibold mb-6">Welcome, {{ user?.username || 'Admin' }}!</h2>
    <p class="text-lg text-secondary">This is your central hub for managing the blog.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <!-- Admin Card: Manage Posts -->
        <div class="bg-white rounded-lg shadow-md p-6 border border-secondary-light">
            <h3 class="text-xl font-semibold text-text mb-3">Manage Posts</h3>
            <p class="text-secondary mb-4">Create, edit, delete, and view your blog posts.</p>
            <NuxtLink to="/admin/posts"
                        class="inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                Go to Posts
            </NuxtLink>
        </div>

        <!-- Admin Card: Manage Users (Future Feature) -->
        <div class="bg-white rounded-lg shadow-md p-6 border border-secondary-light opacity-50 cursor-not-allowed">
            <h3 class="text-xl font-semibold text-text mb-3">Manage Users</h3>
            <p class="text-secondary mb-4">Add, edit, or remove administrative users.</p>
            <button disabled
                    class="inline-block bg-primary text-white py-2 px-4 rounded-md opacity-50 cursor-not-allowed">
                Coming Soon
            </button>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: 'admin', // Use the custom admin layout
  middleware: ['auth'], // Explicitly apply the auth middleware
});

const { user, isLoggedIn, loading } = useAuth(); // Keep user for display

onMounted(() => {
    // If auth state is still loading, wait. If not logged in, redirect.
    // This is a secondary check, as the global beforeEach guard in useAuth should handle most cases.
    if (!loading.value && !isLoggedIn.value) {
        // Redirection is now handled by the admin layout's useAuth or global middleware
    }
});
</script>