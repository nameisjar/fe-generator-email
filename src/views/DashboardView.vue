<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../api';

const overview = ref(null);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get('/dashboard/overview');
    overview.value = data;
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Failed to load';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500">Overview of your aliases and inbox.</p>
      </div>
      <RouterLink :to="{ name: 'aliases' }" class="btn-primary">Manage aliases</RouterLink>
    </header>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div v-if="loading" class="text-sm text-slate-500">Loading…</div>

    <div v-else-if="overview" class="space-y-6">
      <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="card p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wide">Active aliases</p>
          <p class="text-2xl font-semibold text-slate-800 mt-1">{{ overview.counts.activeAliases }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wide">Total aliases</p>
          <p class="text-2xl font-semibold text-slate-800 mt-1">{{ overview.counts.totalAliases }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-slate-500 uppercase tracking-wide">Emails received</p>
          <p class="text-2xl font-semibold text-slate-800 mt-1">{{ overview.counts.totalEmails }}</p>
        </div>
        <div class="card p-4" :class="{ 'ring-1 ring-amber-300': overview.counts.unreadEmails > 0 }">
          <p class="text-xs text-slate-500 uppercase tracking-wide">Unread</p>
          <p class="text-2xl font-semibold mt-1" :class="overview.counts.unreadEmails ? 'text-amber-600' : 'text-slate-800'">
            {{ overview.counts.unreadEmails }}
          </p>
        </div>
      </section>

      <section>
        <h2 class="text-sm font-semibold text-slate-700 mb-2">Recent emails</h2>
        <div v-if="overview.recent.length === 0" class="card p-6 text-center text-sm text-slate-500">
          No emails yet. Send something to one of your aliases to test.
        </div>
        <ul v-else class="space-y-2">
          <li v-for="e in overview.recent" :key="e.id" class="card p-3">
            <RouterLink :to="{ name: 'email-detail', params: { id: e.id } }" class="block">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-slate-800 truncate" :class="{ 'font-semibold': !e.isRead }">
                    {{ e.subject || '(no subject)' }}
                  </p>
                  <p class="text-xs text-slate-500 truncate">
                    {{ e.fromName || e.fromAddress }} → {{ e.alias.address }}@…  ·  {{ new Date(e.receivedAt).toLocaleString() }}
                  </p>
                </div>
                <span v-if="e.extractedCode" class="badge-blue font-mono">{{ e.extractedCode }}</span>
              </div>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
