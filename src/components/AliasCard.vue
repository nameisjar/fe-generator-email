<script setup>
import { ref } from 'vue';
import { useAliasStore } from '../stores/alias';
import { useToastStore } from '../stores/toast';
import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps({ alias: { type: Object, required: true } });
const emit = defineEmits(['open', 'refresh']);
const aliasStore = useAliasStore();
const toast = useToastStore();
const editing = ref(false);
const labelInput = ref('');
const menuOpen = ref(false);
const confirmOpen = ref(false);
const deleting = ref(false);

function startEdit() {
  labelInput.value = props.alias.label || '';
  editing.value = true;
  menuOpen.value = false;
}

async function saveLabel() {
  try {
    await aliasStore.update(props.alias.id, { label: labelInput.value.trim() || null });
    editing.value = false;
    toast.show('Nama alias berhasil diperbarui.');
    emit('refresh');
  } catch (error) {
    toast.show(error.response?.data?.error?.message || 'Nama alias gagal diperbarui.', 'error');
  }
}

async function toggleActive() {
  menuOpen.value = false;
  try {
    await aliasStore.update(props.alias.id, { isActive: !props.alias.isActive });
    toast.show(props.alias.isActive ? 'Alias diaktifkan.' : 'Alias dinonaktifkan.');
    emit('refresh');
  } catch (error) {
    toast.show(error.response?.data?.error?.message || 'Status alias gagal diperbarui.', 'error');
  }
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(props.alias.fullAddress);
    toast.show('Alamat alias disalin.');
  } catch {
    toast.show('Alamat tidak dapat disalin.', 'error');
  }
}

async function remove() {
  deleting.value = true;
  try {
    await aliasStore.remove(props.alias.id);
    confirmOpen.value = false;
    toast.show('Alias berhasil dihapus.');
    emit('refresh');
  } catch (error) {
    toast.show(error.response?.data?.error?.message || 'Alias gagal dihapus.', 'error');
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <article class="card group relative flex flex-col p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md" :class="{ 'bg-slate-50/80': !alias.isActive }">
    <div class="flex items-start gap-3">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" :class="alias.isActive ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-500'">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
      </span>
      <button class="min-w-0 flex-1 text-left" @click="emit('open', alias)">
        <span class="flex items-center gap-2"><span class="truncate text-sm font-semibold text-slate-900">{{ alias.label || 'Tanpa label' }}</span><span class="h-2 w-2 shrink-0 rounded-full" :class="alias.isActive ? 'bg-emerald-500' : 'bg-slate-300'"></span></span>
        <span class="mt-1 block truncate font-mono text-xs text-slate-500">{{ alias.fullAddress }}</span>
      </button>
      <div class="relative">
        <button class="icon-btn h-9 w-9" aria-label="Aksi alias" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
        </button>
        <div v-if="menuOpen" class="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl">
          <button class="w-full rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50" @click="copyAddress(); menuOpen = false">Salin alamat</button>
          <button class="w-full rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50" @click="startEdit">Ubah nama</button>
          <button class="w-full rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-50" @click="toggleActive">{{ alias.isActive ? 'Nonaktifkan' : 'Aktifkan' }}</button>
          <button class="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50" @click="menuOpen = false; confirmOpen = true">Hapus</button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
      <span class="text-xs text-slate-500">{{ alias.emailCount }} email</span>
      <button class="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700" @click="emit('open', alias)">Buka kotak masuk <span aria-hidden="true">→</span></button>
    </div>

    <form v-if="editing" class="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row" @submit.prevent="saveLabel">
      <input v-model="labelInput" class="input flex-1" placeholder="Contoh: Netflix" maxlength="80" autofocus />
      <div class="flex gap-2"><button type="submit" class="btn-primary flex-1 sm:flex-none">Simpan</button><button type="button" class="btn-secondary flex-1 sm:flex-none" @click="editing = false">Batal</button></div>
    </form>

    <ConfirmDialog :open="confirmOpen" :busy="deleting" title="Hapus alias?" :description="`Semua email untuk ${alias.fullAddress} juga akan dihapus permanen.`" @close="confirmOpen = false" @confirm="remove" />
  </article>
</template>
