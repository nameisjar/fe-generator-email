<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import OtpHighlight from './OtpHighlight.vue';

const props = defineProps({ email: { type: Object, required: true } });
const emit = defineEmits(['toggle-read', 'remove']);

const dateLabel = computed(() => {
  const date = new Date(props.email.receivedAt);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return 'baru saja';
  if (diffMinutes < 60) return `${diffMinutes} mnt`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} jam`;
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)} hari`;
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
});
const fullDate = computed(() => new Date(props.email.receivedAt).toLocaleString('id-ID'));
const senderName = computed(() => props.email.fromName || props.email.fromAddress);
const avatarLetter = computed(() => (senderName.value || '?').trim().charAt(0).toUpperCase());
</script>

<template>
  <article class="email-row group" :class="{ 'email-row-unread': !email.isRead }">
    <RouterLink :to="{ name: 'email-detail', params: { id: email.id } }" class="flex min-w-0 flex-1 items-start gap-3 rounded-lg">
      <div class="avatar shrink-0" :class="{ 'avatar-unread': !email.isRead }" aria-hidden="true">{{ avatarLetter }}</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2">
          <p class="truncate text-sm" :class="email.isRead ? 'text-slate-700' : 'font-semibold text-slate-900'">{{ senderName }}</p>
          <time class="ml-auto shrink-0 text-xs text-slate-400" :title="fullDate">{{ dateLabel }}</time>
        </div>
        <p class="mt-0.5 truncate text-sm" :class="email.isRead ? 'text-slate-600' : 'font-medium text-slate-800'">{{ email.subject || '(tanpa subjek)' }}</p>
        <p v-if="email.snippet" class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{{ email.snippet }}</p>
        <OtpHighlight :code="email.extractedCode" :subject="email.subject" :text="email.snippet" :interactive="false" class="mt-2" />
      </div>
    </RouterLink>

    <div class="flex shrink-0 items-center gap-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
      <button class="icon-btn" :title="email.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'" :aria-label="email.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'" @click="emit('toggle-read', email)">
        <svg v-if="!email.isRead" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.6 13a2.4 2.4 0 0 0 2.8 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m3 10 7.6-5.1a2.5 2.5 0 0 1 2.8 0L21 10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Zm0 1 7.6 5.1a2.5 2.5 0 0 0 2.8 0L21 11"/></svg>
      </button>
      <button class="icon-btn icon-btn-danger" title="Hapus" aria-label="Hapus email" @click="emit('remove', email)">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10 11v6m4-6v6M4 7h16m-2 0-.8 12a2 2 0 0 1-2 2H8.8a2 2 0 0 1-2-2L6 7m3 0V4h6v3"/></svg>
      </button>
    </div>
    <span v-if="!email.isRead" class="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-600" aria-label="Belum dibaca" />
  </article>
</template>
