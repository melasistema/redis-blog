<template>
  <div>
    <slot />
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 <a href="https://github.com/melasistema" target="_blank" rel="noopener noreferrer">Melasistema</a></p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.footer {
  margin-top: 4rem;
  padding: 2rem 0;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
  font-size: 0.9rem;
}

.footer a {
  color: #007bff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>
<script setup lang="ts">
</script>