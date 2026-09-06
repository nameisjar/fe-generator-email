<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  confirmLabel: { type: String, default: 'Hapus' },
  busy: { type: Boolean, default: false },
});
defineEmits(['close', 'confirm']);
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" @click.self="$emit('close')">
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10 11v6m4-6v6M4 7h16m-2 0-.8 12a2 2 0 0 1-2 2H8.8a2 2 0 0 1-2-2L6 7m3 0V4h6v3"/></svg>
          </span>
          <h2 class="mt-4 text-lg font-semibold text-slate-900">{{ title }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ description }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <button class="btn-secondary" :disabled="busy" @click="$emit('close')">Batal</button>
            <button class="btn-danger" :disabled="busy" @click="$emit('confirm')">{{ busy ? 'Menghapus…' : confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active, .dialog-leave-active { transition: opacity 160ms ease; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
</style>
