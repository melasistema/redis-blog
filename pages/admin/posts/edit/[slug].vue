<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Edit Blog Post</h1>
      <p>Editing post: {{ $route.params.slug }}</p>
      <div class="mt-4">
        <NuxtLink to="/admin/posts" class="text-blue-600 hover:underline">Back to Posts</NuxtLink>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({
    middleware: ['auth'], // Protect this route with auth middleware
  });
  </script>
  
  <style scoped>
  /* Add any specific styles here */
  </style>