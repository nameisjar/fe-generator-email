// Router with auth guards.

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/aliases', name: 'aliases', component: () => import('../views/AliasListView.vue') },
  { path: '/aliases/:id', name: 'alias-inbox', component: () => import('../views/InboxView.vue'), props: true },
  { path: '/emails/:id', name: 'email-detail', component: () => import('../views/EmailDetailView.vue'), props: true },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.ready) await auth.bootstrap();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.public && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
