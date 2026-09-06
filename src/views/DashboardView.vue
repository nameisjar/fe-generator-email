<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../api';
import { resolveOtp } from '../utils/otp';

const overview = ref(null);
const loading = ref(true);
const error = ref('');

function dateLabel(value) {
  const date = new Date(value);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} mnt`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} jam`;
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)} hari`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function emailOtp(email) {
  return resolveOtp(email.subject, email.snippet, email.extractedCode);
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/dashboard/overview');
    overview.value = data;
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Ringkasan gagal dimuat.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">Ruang kerja Anda</p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">Ringkasan</h1>
        <p class="mt-2 text-sm text-slate-500">Pantau alamat alias dan pesan terbaru dalam satu tempat.</p>
      </div>
      <RouterLink :to="{ name: 'aliases' }" class="btn-primary self-start sm:self-auto">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
        Kelola alias
      </RouterLink>
    </header>

    <div v-if="error" class="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

    <div v-if="loading" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="n in 4" :key="n" class="card h-32 animate-pulse bg-white/60 p-5"><div class="h-9 w-9 rounded-xl bg-slate-100"></div><div class="mt-4 h-5 w-16 rounded bg-slate-100"></div></div>
    </div>

    <template v-else-if="overview">
      <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="metric-card">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg></span>
          <p class="mt-4 text-2xl font-bold tracking-tight text-slate-900">{{ overview.counts.activeAliases }}</p>
          <p class="mt-1 text-xs font-medium text-slate-500">Alias aktif</p>
        </div>
        <div class="metric-card">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10"/></svg></span>
          <p class="mt-4 text-2xl font-bold tracking-tight text-slate-900">{{ overview.counts.totalAliases }}</p>
          <p class="mt-1 text-xs font-medium text-slate-500">Total alias</p>
        </div>
        <div class="metric-card">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.6 13a2.4 2.4 0 0 0 2.8 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg></span>
          <p class="mt-4 text-2xl font-bold tracking-tight text-slate-900">{{ overview.counts.totalEmails }}</p>
          <p class="mt-1 text-xs font-medium text-slate-500">Email diterima</p>
        </div>
        <div class="metric-card" :class="overview.counts.unreadEmails ? 'border-amber-200 bg-amber-50/50' : ''">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg></span>
          <p class="mt-4 text-2xl font-bold tracking-tight" :class="overview.counts.unreadEmails ? 'text-amber-700' : 'text-slate-900'">{{ overview.counts.unreadEmails }}</p>
          <p class="mt-1 text-xs font-medium text-slate-500">Belum dibaca</p>
        </div>
      </section>

      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 class="section-title">Email terbaru</h2><p class="mt-0.5 text-xs text-slate-400">Pesan terbaru dari seluruh alias</p></div>
        </div>
        <div v-if="overview.recent.length === 0" class="px-6 py-16 text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.6 13a2.4 2.4 0 0 0 2.8 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg></span>
          <p class="mt-3 font-medium text-slate-700">Belum ada email</p><p class="mt-1 text-sm text-slate-500">Kirim email ke salah satu alias untuk mencobanya.</p>
        </div>
        <ul v-else class="divide-y divide-slate-100">
          <li v-for="e in overview.recent" :key="e.id">
            <RouterLink :to="{ name: 'email-detail', params: { id: e.id } }" class="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5">
              <span class="h-2 w-2 shrink-0 rounded-full" :class="e.isRead ? 'bg-slate-200' : 'bg-brand-600'"></span>
              <div class="min-w-0 flex-1"><p class="truncate text-sm text-slate-800" :class="{ 'font-semibold': !e.isRead }">{{ e.subject || '(tanpa subjek)' }}</p><p class="mt-0.5 truncate text-xs text-slate-500">{{ e.fromName || e.fromAddress }} · ke {{ e.alias.address }}@…</p></div>
              <span v-if="emailOtp(e)" class="badge-blue hidden font-mono sm:inline-flex">{{ emailOtp(e) }}</span>
              <time class="shrink-0 text-xs text-slate-400">{{ dateLabel(e.receivedAt) }}</time>
              <svg class="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6"/></svg>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
