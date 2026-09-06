<script setup>
import { useToastStore } from '../stores/toast';

const toast = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:items-end" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="item in toast.items" :key="item.id" class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-white p-3 shadow-xl shadow-slate-900/10" :class="item.type === 'error' ? 'border-red-200' : 'border-emerald-200'">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" :class="item.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'">
            <svg v-if="item.type === 'error'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 8v5m0 3h.01M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/></svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/></svg>
          </span>
          <p class="flex-1 text-sm font-medium text-slate-700">{{ item.message }}</p>
          <button class="icon-btn h-8 w-8" aria-label="Tutup notifikasi" @click="toast.dismiss(item.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 180ms ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px) scale(.98); }
</style>
