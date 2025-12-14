<!--
Copyright (c) 2025 Luca Visciola
SPDX-License-Identifier: MIT

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden">

    <!-- Background image (blurred) -->
    <div
        class="absolute inset-0 bg-[url('/redis-blog-poster-wide-image.jpg')]
             bg-cover bg-center
         scale-150 rotate-12
         blur-md"
    ></div>

    <!-- Dark overlay for contrast -->
    <div class="absolute inset-0 bg-black/30"></div>

    <!-- Login card -->
    <div
        class="relative z-10 w-full max-w-md p-8 space-y-6
             bg-white/90 backdrop-blur-sm
             rounded-lg shadow-md border border-secondary-light"
    >
      <h2 class="text-2xl font-bold text-center text-text">
        Admin Login
      </h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label
              for="username"
              class="block text-sm font-medium text-text"
          >
            Username
          </label>
          <input
              type="text"
              id="username"
              v-model="username"
              required
              class="mt-1 block w-full px-3 py-2 border border-secondary-light
                   rounded-md shadow-sm focus:outline-none
                   focus:ring-primary focus:border-primary
                   sm:text-sm text-text"
          />
        </div>

        <div>
          <label
              for="password"
              class="block text-sm font-medium text-text"
          >
            Password
          </label>
          <input
              type="password"
              id="password"
              v-model="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-secondary-light
                   rounded-md shadow-sm focus:outline-none
                   focus:ring-primary focus:border-primary
                   sm:text-sm text-text"
          />
        </div>

        <div v-if="error" class="text-error text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4
                   border border-transparent rounded-md shadow-sm
                   text-sm font-medium text-white bg-primary
                   hover:bg-primary-dark focus:outline-none
                   focus:ring-2 focus:ring-offset-2
                   focus:ring-primary disabled:opacity-50
                   disabled:cursor-not-allowed"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
    </div>

  </div>
</template>
<script setup lang="ts">
</script>