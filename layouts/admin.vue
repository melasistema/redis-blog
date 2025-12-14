<template>
    <div class="min-h-screen bg-background text-text">
        <header class="bg-primary text-white p-4 shadow-md">
            <div class="container mx-auto flex justify-between items-center">
                <NuxtLink to="/admin" class="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
                    Admin Dashboard
                </NuxtLink>
                <nav>
                    <button @click="handleLogout"
                            class="py-2 px-4 rounded-md text-sm font-medium bg-primary-dark hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Logout
                    </button>
                </nav>
            </div>
        </header>

        <main class="container mx-auto p-8">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';

const { logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
    await logout();
    // useAuth's logout already redirects to /admin/login
};
</script>