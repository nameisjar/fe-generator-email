<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function onLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="bg-white border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink :to="{ name: 'dashboard' }" class="flex items-center gap-2 font-semibold text-slate-800">
        <span class="inline-block w-6 h-6 rounded bg-brand-600"></span>
        Email Alias Manager
      </RouterLink>
      <nav class="flex items-center gap-1 text-sm">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="px-3 py-1.5 rounded hover:bg-slate-100"
          active-class="bg-slate-100 text-brand-700"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          :to="{ name: 'aliases' }"
          class="px-3 py-1.5 rounded hover:bg-slate-100"
          active-class="bg-slate-100 text-brand-700"
        >
          Aliases
        </RouterLink>
        <span class="hidden sm:inline-block mx-2 text-slate-300">|</span>
        <span class="hidden sm:inline text-slate-500 mr-2">{{ auth.user?.email }}</span>
        <button class="btn-secondary" @click="onLogout">Logout</button>
      </nav>
    </div>
  </header>
</template>
