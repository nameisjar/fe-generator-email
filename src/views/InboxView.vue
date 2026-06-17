<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useEmailStore } from '../stores/email';
import { useAliasStore } from '../stores/alias';
import EmailListItem from '../components/EmailListItem.vue';
import Pagination from '../components/Pagination.vue';

const props = defineProps({ id: { type: String, required: true } });

const emailStore = useEmailStore();
const aliasStore = useAliasStore();
const alias = computed(() => aliasStore.items.find((a) => a.id === props.id));

const page = ref(1);
const pageSize = ref(20);
const showUnreadOnly = ref(false);
const search = ref('');
const searchInput = ref('');
const copied = ref(false);

const list = computed(() => emailStore.lists[props.id] || { items: [], page: 1, pageSize: 20, total: 0 });

async function load() {
  if (aliasStore.items.length === 0) await aliasStore.fetchAll();
  await emailStore.fetchInbox(props.id, {
    page: page.value,
    pageSize: pageSize.value,
    unread: showUnreadOnly.value,
    search: search.value,
  });
}

function reloadFromFirst() {
  page.value = 1;
  load();
}

function onPageChange(newPage) {
  page.value = newPage;
  load();
}

let searchTimer = null;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = searchInput.value.trim();
    reloadFromFirst();
  }, 300);
}

function clearSearch() {
  searchInput.value = '';
  search.value = '';
  reloadFromFirst();
}

function clearAllFilters() {
  searchInput.value = '';
  search.value = '';
  showUnreadOnly.value = false;
  reloadFromFirst();
}

async function toggleRead(email) {
  await emailStore.markRead(email.id, !email.isRead);
}

async function remove(email) {
  if (!confirm('Delete this email?')) return;
  await emailStore.remove(email.id);
}

async function copyAddress() {
  if (!alias.value) return;
  try {
    await navigator.clipboard.writeText(alias.value.fullAddress);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1500);
  } catch {
    // ignore
  }
}

watch(() => props.id, () => {
  page.value = 1;
  load();
});

onMounted(load);
</script>

<template>
  <div class="space-y-4">
    <!-- Header card with alias info + controls -->
    <div class="card p-5">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <RouterLink :to="{ name: 'aliases' }" class="hover:text-brand-600">Aliases</RouterLink>
            <span>/</span>
            <span class="text-slate-700">{{ alias?.label || alias?.address || 'Inbox' }}</span>
          </div>
          <h1 class="text-2xl font-semibold text-slate-800 truncate">
            {{ alias?.label || alias?.address || 'Inbox' }}
          </h1>
          <button
            v-if="alias"
            class="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-600 font-mono hover:underline break-all"
            @click="copyAddress"
            :title="alias.fullAddress"
          >
            <span>{{ alias.fullAddress }}</span>
            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span v-else class="text-emerald-600 text-xs font-sans">✓ Copied</span>
          </button>
          <p v-else class="text-sm text-slate-500">Loading alias…</p>
        </div>

        <div class="flex items-center gap-3 text-sm">
          <label class="inline-flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              v-model="showUnreadOnly"
              type="checkbox"
              @change="reloadFromFirst"
              class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Unread only</span>
          </label>
          <button class="btn-secondary" @click="load" :disabled="emailStore.loading">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="{ 'animate-spin': emailStore.loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="mt-4 relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          v-model="searchInput"
          @input="onSearchInput"
          type="search"
          class="input pl-9 pr-9"
          placeholder="Search subject, sender, or body…"
        />
        <button
          v-if="searchInput"
          @click="clearSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          title="Clear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="emailStore.loading && !list.items.length" class="card p-12 text-center">
      <svg class="w-8 h-8 text-slate-300 mx-auto animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      <p class="text-sm text-slate-500 mt-3">Loading emails…</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!list.items.length" class="card p-12 text-center">
      <svg class="w-12 h-12 text-slate-200 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      <p class="text-slate-700 font-medium mt-3">
        {{ search ? 'No matches' : showUnreadOnly ? 'All caught up!' : 'Inbox is empty' }}
      </p>
      <p class="text-sm text-slate-500 mt-1">
        {{ search
          ? 'Try a different search term, or clear filters.'
          : showUnreadOnly
            ? 'You have no unread messages in this alias.'
            : 'Send an email to this alias to see it appear here.' }}
      </p>
      <button
        v-if="search || showUnreadOnly"
        class="btn-secondary mt-4"
        @click="clearAllFilters"
      >
        Clear filters
      </button>
    </div>

    <!-- Email list -->
    <div v-else class="card divide-y divide-slate-100 overflow-hidden">
      <EmailListItem
        v-for="e in list.items"
        :key="e.id"
        :email="e"
        @toggle-read="toggleRead"
        @remove="remove"
      />
    </div>

    <!-- Pagination + page-size -->
    <div v-if="list.items.length" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <label for="pageSize">Per page</label>
        <select
          id="pageSize"
          v-model.number="pageSize"
          @change="reloadFromFirst"
          class="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <Pagination
        :page="list.page"
        :page-size="list.pageSize"
        :total="list.total"
        :loading="emailStore.loading"
        @update:page="onPageChange"
      />
    </div>
  </div>
</template>
