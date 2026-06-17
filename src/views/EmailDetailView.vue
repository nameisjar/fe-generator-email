<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useEmailStore } from '../stores/email';
import EmailBody from '../components/EmailBody.vue';
import OtpHighlight from '../components/OtpHighlight.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const emailStore = useEmailStore();
const email = ref(null);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    email.value = await emailStore.fetchOne(props.id);
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Failed to load email';
  } finally {
    loading.value = false;
  }
}

async function toggleRead() {
  if (!email.value) return;
  await emailStore.markRead(email.value.id, !email.value.isRead);
  email.value.isRead = !email.value.isRead;
}

async function remove() {
  if (!email.value) return;
  if (!confirm('Delete this email?')) return;
  await emailStore.remove(email.value.id);
  router.push({ name: 'dashboard' });
}

onMounted(load);
</script>

<template>
  <div>
    <div v-if="loading" class="text-sm text-slate-500">Loading…</div>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <article v-else-if="email" class="card p-6">
      <header class="border-b border-slate-200 pb-4 mb-4">
        <div class="flex items-start justify-between gap-3">
          <h1 class="text-xl font-semibold text-slate-800 break-words">
            {{ email.subject || '(no subject)' }}
          </h1>
          <div class="flex gap-2 shrink-0">
            <button class="btn-secondary" @click="toggleRead">
              {{ email.isRead ? 'Mark unread' : 'Mark read' }}
            </button>
            <button class="btn-danger" @click="remove">Delete</button>
          </div>
        </div>
        <p class="text-sm text-slate-500 mt-2">
          From: <span class="text-slate-800">{{ email.fromName || email.fromAddress }}</span>
        </p>
        <p class="text-sm text-slate-500">
          To:
          <RouterLink
            :to="{ name: 'alias-inbox', params: { id: email.alias.id } }"
            class="text-brand-600 hover:underline font-mono"
          >
            {{ email.alias.fullAddress }}
          </RouterLink>
        </p>
        <p class="text-xs text-slate-400 mt-1">{{ new Date(email.receivedAt).toLocaleString() }}</p>
      </header>

      <OtpHighlight v-if="email.extractedCode" :code="email.extractedCode" class="mb-4" />

      <EmailBody :html="email.bodyHtml" :text="email.bodyText" />
    </article>
  </div>
</template>
