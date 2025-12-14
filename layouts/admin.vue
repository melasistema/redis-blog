<!--
Copyright (c) 2025 Luca Visciola
SPDX-License-Identifier: MIT

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

<template>
  <div class="min-h-screen bg-background text-text">
      <header class="bg-primary text-white p-4 shadow-md">
          <div class="container mx-auto flex justify-between items-center">
              <NuxtLink to="/admin" class="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
                  Admin Dashboard
              </NuxtLink>
              <nav class="flex items-center space-x-4">
                  <a :href="publicUrl" target="_blank" rel="noopener noreferrer"
                     class="py-2 px-4 rounded-md text-sm font-medium bg-secondary-dark hover:bg-opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      View Site
                  </a>
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
  <footer class="py-8 border-t border-secondary text-center text-secondary text-sm">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <a class="text-red-600 hover:text-opacity-50" href="https://github.com/melasistema" target="_blank">...follow the rabbit hole --> Melasistema</a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';

const { logout } = useAuth();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const publicUrl = runtimeConfig.public.NUXT_PUBLIC_URL;

const handleLogout = async () => {
    await logout();
    // useAuth's logout already redirects to /admin/login
};
</script>