<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import OtpHighlight from './OtpHighlight.vue';

const props = defineProps({
  email: { type: Object, required: true },
});
const emit = defineEmits(['toggle-read', 'remove']);

const dateLabel = computed(() => {
  const d = new Date(props.email.receivedAt);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
});

const fullDate = computed(() => new Date(props.email.receivedAt).toLocaleString());

const avatarLetter = computed(() => {
  const source = props.email.fromName || props.email.fromAddress || '?';
  return source.trim().charAt(0).toUpperCase();
});

const senderName = computed(() => props.email.fromName || props.email.fromAddress);
const senderDomain = computed(() => {
  const addr = props.email.fromAddress || '';
  return addr.includes('@') ? addr.split('@')[1] : '';
});
</script>

<template>
  <RouterLink
    :to="{ name: 'email-detail', params: { id: email.id } }"
    class="email-row group"
    :class="{ 'email-row-unread': !email.isRead }"
  >
    <div class="flex items-start gap-3 min-w-0 flex-1">
      <div
        class="avatar shrink-0"
        :class="{ 'avatar-unread': !email.isRead }"
        :aria-hidden="true"
      >
        {{ avatarLetter }}
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2 flex-wrap">
          <p class="text-sm truncate" :class="email.isRead ? 'text-slate-700' : 'text-slate-900 font-semibold'">
            {{ senderName }}
          </p>
          <span v-if="senderDomain && email.fromAddress !== senderName" class="text-xs text-slate-400 truncate">
            &lt;{{ email.fromAddress }}&gt;
          </span>
          <span class="ml-auto text-xs text-slate-400 shrink-0" :title="fullDate">{{ dateLabel }}</span>
        </div>

        <p class="text-sm truncate mt-0.5" :class="email.isRead ? 'text-slate-600' : 'text-slate-800 font-medium'">
          {{ email.subject || '(no subject)' }}
        </p>

        <p v-if="email.snippet" class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {{ email.snippet }}
        </p>

        <OtpHighlight v-if="email.extractedCode" :code="email.extractedCode" class="mt-2" />
      </div>
    </div>

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" @click.stop>
      <button
        class="icon-btn"
        :title="email.isRead ? 'Mark as unread' : 'Mark as read'"
        @click.prevent="emit('toggle-read', email)"
      >
        <svg v-if="!email.isRead" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"/></svg>
      </button>
      <button
        class="icon-btn icon-btn-danger"
        title="Delete"
        @click.prevent="emit('remove', email)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
      </button>
    </div>

    <span
      v-if="!email.isRead"
      class="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-600"
      aria-label="Unread"
    />
  </RouterLink>
</template>
