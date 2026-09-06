<script setup>
import { ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);
const links = [
  { name: 'dashboard', label: 'Ringkasan', icon: 'home' },
  { name: 'aliases', label: 'Alamat alias', icon: 'at' },
];

function isActive(name) {
  if (name === 'aliases') return ['aliases', 'alias-inbox', 'email-detail'].includes(route.name);
  return route.name === name;
}

async function onLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white/90 backdrop-blur-xl lg:flex lg:flex-col">
    <div class="flex h-20 items-center gap-3 px-6">
      <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.59 13a2.4 2.4 0 0 0 2.82 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg>
      </span>
      <div><p class="font-bold tracking-tight text-slate-900">AliasMail</p><p class="text-xs text-slate-400">Kotak masuk privat</p></div>
    </div>

    <nav class="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi utama">
      <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name }" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition" :class="isActive(link.name) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'">
        <svg v-if="link.icon === 'home'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9Z"/></svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="m-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-700 shadow-sm">{{ auth.user?.email?.charAt(0)?.toUpperCase() }}</span>
        <div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold text-slate-700">Akun Anda</p><p class="truncate text-xs text-slate-500">{{ auth.user?.email }}</p></div>
        <button class="icon-btn h-9 w-9" title="Keluar" aria-label="Keluar" @click="onLogout">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M14 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3m-4-4h11m0 0-3-3m3 3-3 3"/></svg>
        </button>
      </div>
    </div>
  </aside>

  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:hidden">
    <div class="flex h-16 items-center justify-between px-4">
      <RouterLink :to="{ name: 'dashboard' }" class="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.59 13a2.4 2.4 0 0 0 2.82 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg></span>
        AliasMail
      </RouterLink>
      <button class="icon-btn border border-slate-200 bg-white" :aria-expanded="mobileOpen" aria-label="Buka menu" @click="mobileOpen = !mobileOpen">
        <svg v-if="!mobileOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div v-if="mobileOpen" class="border-t border-slate-100 px-4 py-3 shadow-lg">
      <nav class="space-y-1" aria-label="Navigasi seluler">
        <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name }" class="block rounded-xl px-3 py-2.5 text-sm font-medium" :class="isActive(link.name) ? 'bg-brand-50 text-brand-700' : 'text-slate-600'" @click="mobileOpen = false">{{ link.label }}</RouterLink>
      </nav>
      <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span class="max-w-[70%] truncate text-xs text-slate-500">{{ auth.user?.email }}</span><button class="text-sm font-semibold text-red-600" @click="onLogout">Keluar</button></div>
    </div>
  </header>
</template>
