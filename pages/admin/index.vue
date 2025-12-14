<template>
    <div class="min-h-screen bg-background text-text">
        <header class="bg-primary text-white p-4 shadow-md">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-2xl font-bold">Admin Dashboard</h1>
                <nav>
                    <button @click="handleLogout"
                            class="py-2 px-4 rounded-md text-sm font-medium bg-primary-dark hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Logout
                    </button>
                </nav>
            </div>
        </header>

        <main class="container mx-auto p-8">
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
        </main>
    </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const router = useRouter();
const { user, logout, isLoggedIn, loading } = useAuth();

const handleLogout = async () => {
    await logout();
};

onMounted(() => {
    // If auth state is still loading, wait. If not logged in, redirect.
    // This is a secondary check, as the global beforeEach guard in useAuth should handle most cases.
    if (!loading.value && !isLoggedIn.value) {
        router.push('/admin/login');
    }
});

</script>