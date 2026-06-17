// Email store: per-alias inbox, email detail, mark read, delete.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

export const useEmailStore = defineStore('email', () => {
  const lists = ref({}); // aliasId -> { items, page, pageSize, total }
  const details = ref({}); // emailId -> email
  const loading = ref(false);

  /**
   * Fetch a page of the inbox for an alias.
   * @param {string} aliasId
   * @param {object} opts
   * @param {number} [opts.page=1]
   * @param {number} [opts.pageSize=20]
   * @param {boolean} [opts.unread=false]
   * @param {string} [opts.search='']
   */
  async function fetchInbox(aliasId, { page = 1, pageSize = 20, unread = false, search = '' } = {}) {
    loading.value = true;
    try {
      const params = { page, pageSize };
      if (unread) params.unread = 'true';
      if (search) params.q = search;

      const { data } = await api.get(`/aliases/${aliasId}/emails`, { params });
      lists.value[aliasId] = data;
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(emailId) {
    const { data } = await api.get(`/emails/${emailId}`);
    details.value[emailId] = data.email;
    for (const list of Object.values(lists.value)) {
      const item = list.items.find((i) => i.id === emailId);
      if (item) item.isRead = data.email.isRead;
    }
    return data.email;
  }

  async function markRead(emailId, isRead = true) {
    await api.patch(`/emails/${emailId}/read`, { isRead });
    if (details.value[emailId]) details.value[emailId].isRead = isRead;
    for (const list of Object.values(lists.value)) {
      const item = list.items.find((i) => i.id === emailId);
      if (item) item.isRead = isRead;
    }
  }

  async function remove(emailId) {
    await api.delete(`/emails/${emailId}`);
    delete details.value[emailId];
    for (const list of Object.values(lists.value)) {
      list.items = list.items.filter((i) => i.id !== emailId);
      list.total = Math.max(0, list.total - 1);
    }
  }

  return { lists, details, loading, fetchInbox, fetchOne, markRead, remove };
});
