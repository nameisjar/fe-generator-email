// Axios instance with credentials so the httpOnly refresh cookie travels with requests.
// We also centralize 401 handling: try a refresh once, then fail.

import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
});

let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { response, config } = error;
    const requestPath = config?.url || '';
    const shouldRefresh =
      requestPath === '/auth/me' ||
      requestPath === '/me' ||
      requestPath.endsWith('/auth/me') ||
      requestPath.endsWith('/me');

    if (!response || response.status !== 401 || config._retry || requestPath === '/auth/refresh' || !shouldRefresh) {
      throw error;
    }
    config._retry = true;
    try {
      refreshing = refreshing || axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true });
      const { data } = await refreshing;
      refreshing = null;
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api.request(config);
      }
      throw error;
    } catch (e) {
      refreshing = null;
      setAccessToken(null);
      throw e;
    }
  },
);

export default api;
