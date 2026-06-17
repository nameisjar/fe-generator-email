// Auth store. Persists access token in memory + localStorage and bootstraps
// from /api/auth/me on page reload.

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api, { setAccessToken } from '../api';

const STORAGE_KEY = 'eam.accessToken';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const ready = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  function setSession({ user: u, accessToken }) {
    user.value = u;
    setAccessToken(accessToken);
    localStorage.setItem(STORAGE_KEY, accessToken);
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    setSession(data);
  }

  async function login(payload) {
    const { data } = await api.post('/auth/login', payload);
    setSession(data);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — we still want to clear local state
    }
    user.value = null;
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function bootstrap() {
    if (ready.value) return;
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) setAccessToken(token);
    if (!token) {
      ready.value = true;
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      user.value = data.user;
    } catch {
      user.value = null;
      setAccessToken(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      ready.value = true;
    }
  }

  return { user, ready, isAuthenticated, register, login, logout, bootstrap };
});
