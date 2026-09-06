<script setup>
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
import ToastHost from './components/ToastHost.vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
auth.bootstrap();
</script>

<template>
  <div class="min-h-screen">
    <Navbar v-if="auth.user" />
    <div :class="auth.user ? 'lg:pl-64' : ''" class="min-h-screen flex flex-col">
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <RouterView />
      </main>
      <footer class="px-4 pb-5 text-center text-xs text-slate-400">
        AliasMail · Email yang lebih privat dan terorganisir
      </footer>
    </div>
    <ToastHost />
  </div>
</template>
