<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['update:page']);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const start = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1));
const end = computed(() => Math.min(props.page * props.pageSize, props.total));

// Build a small page-numbers strip with ellipses for large totals.
const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = props.page;
  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (current > 3) pages.push('…');
  const startPage = Math.max(2, current - 1);
  const endPage = Math.min(total - 1, current + 1);
  for (let i = startPage; i <= endPage; i += 1) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
});

function go(p) {
  if (p < 1 || p > totalPages.value || p === props.page) return;
  emit('update:page', p);
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
    <p class="text-sm text-slate-500">
      <span v-if="total === 0">No results</span>
      <span v-else>
        Showing <span class="font-medium text-slate-700">{{ start }}–{{ end }}</span>
        of <span class="font-medium text-slate-700">{{ total }}</span>
      </span>
    </p>

    <nav v-if="totalPages > 1" class="flex items-center gap-1" aria-label="Pagination">
      <button
        class="pager-btn"
        :disabled="page === 1 || loading"
        @click="go(page - 1)"
        aria-label="Previous page"
      >
        ←
      </button>

      <button
        v-for="(p, idx) in pageNumbers"
        :key="`${p}-${idx}`"
        class="pager-btn"
        :class="{ 'pager-btn-active': p === page, 'pager-btn-ellipsis': p === '…' }"
        :disabled="p === '…' || loading"
        @click="go(Number(p))"
      >
        {{ p }}
      </button>

      <button
        class="pager-btn"
        :disabled="page === totalPages || loading"
        @click="go(page + 1)"
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  </div>
</template>
