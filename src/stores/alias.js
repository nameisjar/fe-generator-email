// Alias store: list, create, update, delete aliases.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

export const useAliasStore = defineStore('alias', () => {
  const items = ref([]);
  const pagination = ref({ page: 1, pageSize: 20, total: 0 });
  const domains = ref([]);
  const defaultDomain = ref('');
  const loading = ref(false);
  const error = ref(null);

  async function fetchAll({ page = 1, pageSize = 20, search = '', activeOnly = false, domain = '' } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const params = { page, pageSize };
      if (search) params.q = search;
      if (activeOnly) params.active = 'true';
      if (domain) params.domain = domain;
      const { data } = await api.get('/aliases', { params });
      items.value = data.items;
      pagination.value = { page: data.page, pageSize: data.pageSize, total: data.total };
      // Backend returns the allowed domains with every list call so the UI
      // can stay in sync without an extra round-trip.
      if (Array.isArray(data.domains)) {
        domains.value = data.domains;
        defaultDomain.value = data.defaultDomain || data.domains[0] || '';
      }
      return data;
    } catch (err) {
      error.value = err.response?.data?.error?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload) {
    const { data } = await api.post('/aliases', payload);
    items.value = [data.alias, ...items.value];
    pagination.value.total += 1;
    return data.alias;
  }

  async function update(id, payload) {
    const { data } = await api.patch(`/aliases/${id}`, payload);
    const idx = items.value.findIndex((a) => a.id === id);
    if (idx >= 0) items.value[idx] = { ...items.value[idx], ...data.alias };
    return data.alias;
  }

  async function remove(id) {
    await api.delete(`/aliases/${id}`);
    items.value = items.value.filter((a) => a.id !== id);
    pagination.value.total = Math.max(0, pagination.value.total - 1);
  }

  return { items, pagination, domains, defaultDomain, loading, error, fetchAll, create, update, remove };
});
