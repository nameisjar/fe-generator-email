<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAliasStore } from '../stores/alias';
import { useToastStore } from '../stores/toast';
import AliasCard from '../components/AliasCard.vue';
import Pagination from '../components/Pagination.vue';

const router = useRouter();
const aliasStore = useAliasStore();
const toast = useToastStore();

const newAddress = ref('');
const newLabel = ref('');
const newDomain = ref('');
const creating = ref(false);
const createError = ref('');
const generatedRandom = ref(true);
const showCreate = ref(false);
const hasLoaded = ref(false);

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
  const data = await aliasStore.fetchAll({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    activeOnly: activeOnly.value,
  });
  // Default the new-alias domain to the backend's default the first time we
  // see the domain list, so users get a sensible selection immediately.
  if (!newDomain.value && aliasStore.defaultDomain) {
    newDomain.value = aliasStore.defaultDomain;
  }
  if (!hasLoaded.value && data.total === 0) showCreate.value = true;
  hasLoaded.value = true;
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
      domain: newDomain.value || undefined,
    });
    newAddress.value = '';
    newLabel.value = '';
    showCreate.value = false;
    toast.show('Alias baru berhasil dibuat.');
  } catch (err) {
    createError.value = err.response?.data?.error?.message || 'Alias gagal dibuat.';
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
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">Privasi email</p>
        <div class="mt-1 flex items-center gap-3">
          <h1 class="text-3xl font-bold tracking-tight text-slate-950">Alamat alias</h1>
          <span v-if="aliasStore.pagination.total" class="badge-slate">{{ aliasStore.pagination.total }}</span>
        </div>
        <p class="mt-2 text-sm text-slate-500">Buat dan kelola alamat email terpisah untuk setiap layanan.</p>
      </div>
      <button class="btn-primary self-start sm:self-auto" @click="showCreate = !showCreate">
        <svg class="h-4 w-4 transition" :class="{ 'rotate-45': showCreate }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
        {{ showCreate ? 'Tutup' : 'Buat alias' }}
      </button>
    </header>

    <!-- Create form -->
    <section v-if="showCreate" class="card overflow-hidden border-brand-200">
      <div class="border-b border-brand-100 bg-brand-50/60 px-5 py-4">
        <h2 class="section-title">Buat alias baru</h2>
        <p class="mt-1 text-xs text-slate-500">Gunakan satu alias berbeda untuk setiap layanan agar mudah dikendalikan.</p>
      </div>
      <div class="p-5">
      <form @submit.prevent="create">
        <div class="grid gap-4 mb-4 items-start lg:grid-cols-[1.3fr_1fr_0.8fr]">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Nama alamat</label>
            <div class="flex min-h-10 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
              <input
                v-model="newAddress"
                :disabled="generatedRandom"
                class="flex-1 px-3 py-2 text-sm font-mono focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="nama-alias"
                maxlength="30"
                pattern="[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?"
              />
              <span class="px-3 py-2 text-sm text-slate-500 bg-slate-50 border-l border-slate-300 font-mono">@{{ newDomain || aliasStore.defaultDomain || '…' }}</span>
            </div>
            <label class="inline-flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                v-model="generatedRandom"
                type="checkbox"
                class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Buat nama acak</span>
            </label>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Label <span class="text-slate-400 font-normal">(opsional)</span></label>
            <input
              v-model="newLabel"
              class="input"
              placeholder="Contoh: Netflix atau Bank"
              maxlength="80"
            />
            <p class="text-xs text-slate-400 mt-2">Hanya terlihat oleh Anda.</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Domain</label>
            <select
              v-model="newDomain"
              class="input font-mono"
              :disabled="!aliasStore.domains.length"
            >
              <option v-for="d in aliasStore.domains" :key="d" :value="d">@{{ d }}</option>
            </select>
            <p class="text-xs text-slate-400 mt-2">Domain untuk alias ini.</p>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3">
          <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
          <span v-else class="text-xs text-slate-400">
            Karakter: <code class="font-mono">a-z 0-9 . _ -</code> · 3–30 karakter
          </span>
          <button type="submit" class="btn-primary" :disabled="creating">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ creating ? 'Membuat…' : 'Buat alias' }}
          </button>
        </div>
      </form>
      </div>
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
            placeholder="Cari alamat atau label…"
          />
          <button
            v-if="searchInput"
            @click="clearSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            title="Hapus pencarian"
            aria-label="Hapus pencarian"
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
          <span>Hanya aktif</span>
        </label>
        <div class="ml-auto hidden items-center gap-3 text-xs text-slate-400 sm:flex">
          <span>{{ activeOnPage }} aktif</span><span>·</span><span>{{ totalEmailsOnPage }} email di halaman ini</span>
        </div>
        <button class="btn-secondary px-3" @click="load" :disabled="aliasStore.loading" title="Muat ulang" aria-label="Muat ulang">
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
        <p class="text-sm text-slate-500 mt-3">Memuat alias…</p>
      </div>
      <div v-else-if="aliasStore.items.length === 0" class="card p-12 text-center">
        <svg class="w-12 h-12 text-slate-200 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <p class="text-slate-700 font-medium mt-3">
          {{ search || activeOnly ? 'Tidak ada hasil' : 'Belum ada alias' }}
        </p>
        <p class="text-sm text-slate-500 mt-1">
          {{ search || activeOnly
            ? 'Coba kata pencarian lain atau hapus filter.'
            : 'Buat alias pertama untuk mulai menerima email.' }}
        </p>
        <button
          v-if="search || activeOnly"
          class="btn-secondary mt-4"
          @click="() => { searchInput = ''; search = ''; activeOnly = false; reloadFromFirst(); }"
        >
          Hapus filter
        </button>
      </div>
      <div v-else class="grid sm:grid-cols-2 gap-3">
        <AliasCard
          v-for="a in aliasStore.items"
          :key="a.id"
          :alias="a"
          @open="openInbox"
          @refresh="load"
        />
      </div>
    </section>

    <!-- Pagination + page-size -->
    <div v-if="aliasStore.items.length" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <label for="aliasPageSize">Per halaman</label>
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
