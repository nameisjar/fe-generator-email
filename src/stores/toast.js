import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const items = ref([]);
  let nextId = 1;

  function dismiss(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  function show(message, type = 'success') {
    const id = nextId;
    nextId += 1;
    items.value.push({ id, message, type });
    window.setTimeout(() => dismiss(id), 3200);
  }

  return { items, show, dismiss };
});
