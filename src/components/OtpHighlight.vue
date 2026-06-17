<script setup>
import { ref } from 'vue';

const props = defineProps({
  code: { type: String, required: true },
});

const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1500);
  } catch {
    // ignore
  }
}
</script>

<template>
  <div
    class="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm text-amber-900 shadow-sm"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    <span class="text-amber-700 text-xs uppercase tracking-wide font-semibold">OTP</span>
    <span class="font-mono font-semibold tracking-wider text-amber-900">{{ code }}</span>
    <button
      type="button"
      class="text-xs text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline font-medium"
      @click="copy"
    >
      {{ copied ? '✓ Copied' : 'Copy' }}
    </button>
  </div>
</template>
