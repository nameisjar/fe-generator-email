<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useEmailStore } from '../stores/email';
import EmailBody from '../components/EmailBody.vue';
import OtpHighlight from '../components/OtpHighlight.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { useToastStore } from '../stores/toast';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const emailStore = useEmailStore();
const toast = useToastStore();
const email = ref(null);
const loading = ref(true);
const error = ref('');
const confirmOpen = ref(false);
const deleting = ref(false);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    email.value = await emailStore.fetchOne(props.id);
    if (!email.value.isRead) {
      try {
        await emailStore.markRead(email.value.id, true);
        email.value.isRead = true;
      } catch {
        // Email tetap ditampilkan jika pembaruan status baca gagal.
      }
    }
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Email gagal dimuat.';
  } finally {
    loading.value = false;
  }
}

async function toggleRead() {
  if (!email.value) return;
  const nextIsRead = !email.value.isRead;
  await emailStore.markRead(email.value.id, nextIsRead);
  email.value.isRead = nextIsRead;
  toast.show(email.value.isRead ? 'Email ditandai sudah dibaca.' : 'Email ditandai belum dibaca.');
}

async function remove() {
  if (!email.value) return;
  deleting.value = true;
  try {
    await emailStore.remove(email.value.id);
    toast.show('Email berhasil dihapus.');
    router.push({ name: 'dashboard' });
  } catch (err) {
    toast.show(err.response?.data?.error?.message || 'Email gagal dihapus.', 'error');
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="card animate-pulse p-6"><div class="h-6 w-2/3 rounded bg-slate-100"></div><div class="mt-4 h-4 w-1/3 rounded bg-slate-100"></div><div class="mt-8 space-y-2"><div class="h-3 rounded bg-slate-100"></div><div class="h-3 w-5/6 rounded bg-slate-100"></div></div></div>
    <p v-else-if="error" class="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>

    <template v-else-if="email">
      <RouterLink :to="{ name: 'alias-inbox', params: { id: email.alias.id } }" class="mx-auto flex w-full max-w-5xl items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600"><span aria-hidden="true">←</span> Kembali ke kotak masuk</RouterLink>
      <article class="card mx-auto w-full max-w-5xl overflow-hidden">
      <header class="border-b border-slate-100 p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <span v-if="!email.isRead" class="badge-blue mb-2">Belum dibaca</span>
            <h1 class="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {{ email.subject || '(tanpa subjek)' }}
          </h1>
          </div>
          <div class="flex gap-2 shrink-0">
            <button class="btn-secondary" @click="toggleRead">
              {{ email.isRead ? 'Tandai belum dibaca' : 'Tandai dibaca' }}
            </button>
            <button class="btn-secondary px-3 text-red-600 hover:bg-red-50" @click="confirmOpen = true" aria-label="Hapus email">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10 11v6m4-6v6M4 7h16m-2 0-.8 12a2 2 0 0 1-2 2H8.8a2 2 0 0 1-2-2L6 7m3 0V4h6v3"/></svg>
            </button>
          </div>
        </div>
        <div class="mt-5 flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-600">{{ (email.fromName || email.fromAddress || '?').charAt(0).toUpperCase() }}</span>
          <div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-800">{{ email.fromName || email.fromAddress }}</p><p class="truncate text-xs text-slate-400">{{ email.fromAddress }}</p><p class="mt-1 text-xs text-slate-400">kepada
          <RouterLink
            :to="{ name: 'alias-inbox', params: { id: email.alias.id } }"
            class="text-brand-600 hover:underline font-mono"
          >
            {{ email.alias.fullAddress }}
          </RouterLink>
          </p></div>
          <time class="ml-auto shrink-0 text-xs text-slate-400">{{ new Date(email.receivedAt).toLocaleString('id-ID') }}</time>
        </div>
      </header>

      <div class="p-5 sm:p-6">
        <OtpHighlight :code="email.extractedCode" :subject="email.subject" :text="email.bodyText" class="mb-5" />
        <EmailBody :html="email.bodyHtml" :text="email.bodyText" />
      </div>
    </article>
    </template>

    <ConfirmDialog :open="confirmOpen" :busy="deleting" title="Hapus email?" description="Email yang dihapus tidak dapat dipulihkan." @close="confirmOpen = false" @confirm="remove" />
  </div>
</template>
