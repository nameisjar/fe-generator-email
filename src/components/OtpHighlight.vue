<script setup>
import { computed, ref } from 'vue';
import { resolveOtp } from '../utils/otp';
import { useToastStore } from '../stores/toast';

const props = defineProps({
  code: { type: String, default: '' },
  subject: { type: String, default: '' },
  text: { type: String, default: '' },
  interactive: { type: Boolean, default: true },
});

const toast = useToastStore();
const copied = ref(false);
const resolvedCode = computed(() => resolveOtp(props.subject, props.text, props.code));

function fallbackCopy(value) {
  const input = document.createElement('textarea');
  try {
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.setSelectionRange(0, value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    input.remove();
  }
}

async function copy() {
  if (!resolvedCode.value) return;
  let success = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(resolvedCode.value);
      success = true;
    } else {
      success = fallbackCopy(resolvedCode.value);
    }
  } catch {
    success = fallbackCopy(resolvedCode.value);
  }

  if (!success) {
    toast.show('Kode OTP tidak dapat disalin.', 'error');
    return;
  }

  copied.value = true;
  toast.show(`Kode OTP ${resolvedCode.value} disalin.`);
  window.setTimeout(() => { copied.value = false; }, 1600);
}
</script>

<template>
  <button
    v-if="resolvedCode && interactive"
    type="button"
    class="group inline-flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-brand-900 shadow-sm transition hover:border-brand-300 hover:bg-brand-100"
    :aria-label="`Salin kode OTP ${resolvedCode}`"
    @click="copy"
  >
    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10V7a4 4 0 0 1 8 0v3m-9 0h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/></svg>
    </span>
    <span class="text-left"><span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500">Kode OTP</span><span class="block font-mono text-lg font-bold tracking-[0.18em]">{{ resolvedCode }}</span></span>
    <span class="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
      <svg v-if="!copied" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="11" height="11" rx="2"/><path stroke-linecap="round" d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
      <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/></svg>
      {{ copied ? 'Disalin' : 'Salin' }}
    </span>
  </button>

  <div v-else-if="resolvedCode" class="inline-flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1.5 text-brand-800">
    <span class="text-[10px] font-bold uppercase tracking-wider text-brand-500">OTP</span>
    <span class="font-mono text-sm font-bold tracking-wider">{{ resolvedCode }}</span>
  </div>
</template>
