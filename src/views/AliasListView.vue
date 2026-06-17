<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAliasStore } from '../stores/alias';
import AliasCard from '../components/AliasCard.vue';
import Pagination from '../components/Pagination.vue';

const router = useRouter();
const aliasStore = useAliasStore();

const newAddress = ref('');
const newLabel = ref('');
const creating = ref(false);
const createError = ref('');
const generatedRandom = ref(true);

// List state
const page = ref(1);
const pageSize = ref(20);
const search = ref('');
const searchInput = ref('');
const activeOnly = ref(false);

const totalEmailsOnPage = computed(() =>
  aliasStore.items.reduce((sum, a) => sum + (a.emailCount || 0), 0),
);
const activeOnPage = computed(() => aliasStore.items.filter((a) => a.isActive).length);

async function load() {
  await aliasStore.fetchAll({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    activeOnly: activeOnly.value,
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

function toggleActiveFilter() {
  reloadFromFirst();
}

async function create() {
  createError.value = '';
  creating.value = true;
  try {
    await aliasStore.create({
      address: generatedRandom.value ? undefined : newAddress.value.trim() || undefined,
      label: newLabel.value.trim() || undefined,
    });
    newAddress.value = '';
    newLabel.value = '';
  } catch (err) {
    createError.value = err.response?.data?.error?.message || 'Failed to create alias';
  } finally {
    creating.value = false;
  }
}

function openInbox(alias) {
  router.push({ name: 'alias-inbox', params: { id: alias.id } });
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold text-slate-800">Aliases</h1>
      <p class="text-sm text-slate-500">Generate and manage your email aliases on algonova.my.id.</p>
    </header>

    <!-- Quick stats -->
    <section v-if="aliasStore.pagination.total" class="grid grid-cols-3 gap-3">
      <div class="card p-4">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Total</p>
        <p class="text-2xl font-semibold text-slate-800 mt-1">{{ aliasStore.pagination.total }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 uppercase tracking-wide">On this page</p>
        <p class="text-2xl font-semibold text-emerald-600 mt-1">
          {{ activeOnPage }}<span class="text-sm text-slate-400 font-normal">/ {{ aliasStore.items.length }}</span>
        </p>
        <p class="text-xs text-slate-400 mt-0.5">active / shown</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 uppercase tracking-wide">Emails on page</p>
        <p class="text-2xl font-semibold text-brand-600 mt-1">{{ totalEmailsOnPage }}</p>
      </div>
    </section>

    <!-- Create form -->
    <section class="card p-5">
      <h2 class="text-base font-semibold text-slate-800 mb-3">Create a new alias</h2>
      <form @submit.prevent="create">
        <div class="grid sm:grid-cols-[1fr_1fr] gap-3 mb-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Local part</label>
            <div class="flex items-stretch rounded-md border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 overflow-hidden">
              <input
                v-model="newAddress"
                :disabled="generatedRandom"
                class="flex-1 px-3 py-2 text-sm font-mono focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="leave empty for random"
                maxlength="30"
                pattern="[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?"
              />
              <span class="px-3 py-2 text-sm text-slate-500 bg-slate-50 border-l border-slate-300">@algonova.my.id</span>
            </div>
            <label class="inline-flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                v-model="generatedRandom"
                type="checkbox"
                class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Generate random</span>
            </label>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Label <span class="text-slate-400 font-normal">(optional)</span></label>
            <input
              v-model="newLabel"
              class="input"
              placeholder="e.g. Netflix, Shopee, Bank"
              maxlength="80"
            />
            <p class="text-xs text-slate-400 mt-2">For your own reference — not visible to senders.</p>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3">
          <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
          <span v-else class="text-xs text-slate-400">
            Allowed chars: <code class="font-mono">a-z 0-9 . _ -</code> · 3–30 chars
          </span>
          <button type="submit" class="btn-primary" :disabled="creating">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ creating ? 'Creating…' : 'Create alias' }}
          </button>
        </div>
      </form>
    </section>

    <!-- List controls: search + filter -->
    <section v-if="aliasStore.pagination.total > 0 || search || activeOnly" class="card p-3">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 min-w-[16rem]">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            v-model="searchInput"
            @input="onSearchInput"
            type="search"
            class="input pl-9 pr-9"
            placeholder="Search by local part or label…"
          />
          <button
            v-if="searchInput"
            @click="clearSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <label class="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            v-model="activeOnly"
            type="checkbox"
            @change="toggleActiveFilter"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>Active only</span>
        </label>
        <button class="btn-secondary" @click="load" :disabled="aliasStore.loading" title="Refresh">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="{ 'animate-spin': aliasStore.loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>
    </section>

    <!-- List -->
    <section>
      <div v-if="aliasStore.loading" class="card p-12 text-center">
        <svg class="w-8 h-8 text-slate-300 mx-auto animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p class="text-sm text-slate-500 mt-3">Loading aliases…</p>
      </div>
      <div v-else-if="aliasStore.items.length === 0" class="card p-12 text-center">
        <svg class="w-12 h-12 text-slate-200 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <p class="text-slate-700 font-medium mt-3">
          {{ search || activeOnly ? 'No matches' : 'No aliases yet' }}
        </p>
        <p class="text-sm text-slate-500 mt-1">
          {{ search || activeOnly
            ? 'Try a different search or clear filters.'
            : 'Create your first alias above to start receiving emails.' }}
        </p>
        <button
          v-if="search || activeOnly"
          class="btn-secondary mt-4"
          @click="() => { searchInput = ''; search = ''; activeOnly = false; reloadFromFirst(); }"
        >
          Clear filters
        </button>
      </div>
      <div v-else class="grid sm:grid-cols-2 gap-3">
        <AliasCard
          v-for="a in aliasStore.items"
          :key="a.id"
          :alias="a"
          @open="openInbox"
        />
      </div>
    </section>

    <!-- Pagination + page-size -->
    <div v-if="aliasStore.items.length" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <label for="aliasPageSize">Per page</label>
        <select
          id="aliasPageSize"
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
        :page="aliasStore.pagination.page"
        :page-size="aliasStore.pagination.pageSize"
        :total="aliasStore.pagination.total"
        :loading="aliasStore.loading"
        @update:page="onPageChange"
      />
    </div>
  </div>
</template>
