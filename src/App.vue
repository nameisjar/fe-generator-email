<script setup>
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
auth.bootstrap();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="auth.user" />
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
      <RouterView />
    </main>
    <footer class="text-center text-xs text-slate-400 py-4">
      Email Alias Manager · algonova.my.id
    </footer>
  </div>
</template>
