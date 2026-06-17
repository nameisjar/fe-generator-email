<script setup>
import { ref } from 'vue';
import { useAliasStore } from '../stores/alias';

defineProps({
  alias: { type: Object, required: true },
});
const emit = defineEmits(['open']);
const aliasStore = useAliasStore();

const editing = ref(false);
const labelInput = ref('');

function startEdit(label) {
  labelInput.value = label || '';
  editing.value = true;
}

async function saveLabel(id) {
  await aliasStore.update(id, { label: labelInput.value.trim() || null });
  editing.value = false;
  emit('open'); // trigger parent refresh
}

async function toggleActive(alias) {
  await aliasStore.update(alias.id, { isActive: !alias.isActive });
  emit('open');
}

async function remove(alias) {
  if (!confirm(`Delete alias ${alias.fullAddress}? This also deletes its emails.`)) return;
  await aliasStore.remove(alias.id);
  emit('open');
}
</script>

<template>
  <div class="card p-4 flex flex-col gap-2">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="font-medium text-slate-800 truncate">{{ alias.label || '(unlabeled)' }}</p>
        <button
          class="text-sm text-brand-600 hover:underline font-mono break-all"
          @click="$emit('open', alias)"
          :title="alias.fullAddress"
        >
          {{ alias.fullAddress }}
        </button>
        <p class="text-xs text-slate-500 mt-1">
          {{ alias.emailCount }} email{{ alias.emailCount === 1 ? '' : 's' }}
          <span v-if="!alias.isActive" class="ml-1 badge-red">disabled</span>
        </p>
      </div>
      <div class="flex flex-col gap-1 items-end text-xs shrink-0">
        <button class="text-slate-500 hover:text-brand-600" @click="startEdit(alias.label)">Rename</button>
        <button class="text-slate-500 hover:text-brand-600" @click="toggleActive(alias)">
          {{ alias.isActive ? 'Disable' : 'Enable' }}
        </button>
        <button class="text-slate-500 hover:text-red-600" @click="remove(alias)">Delete</button>
      </div>
    </div>
    <form v-if="editing" class="flex gap-2 mt-1" @submit.prevent="saveLabel(alias.id)">
      <input v-model="labelInput" class="input" placeholder="Label (e.g. Netflix)" maxlength="80" />
      <button type="submit" class="btn-primary">Save</button>
      <button type="button" class="btn-secondary" @click="editing = false">Cancel</button>
    </form>
  </div>
</template>
