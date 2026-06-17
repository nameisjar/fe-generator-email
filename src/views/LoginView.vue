<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    const target = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.push(target);
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto card p-6 mt-10">
    <h1 class="text-xl font-semibold text-slate-800">Welcome back</h1>
    <p class="text-sm text-slate-500 mt-1">Sign in to manage your aliases.</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input v-model="email" type="email" required autocomplete="email" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input v-model="password" type="password" required autocomplete="current-password" class="input" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <!-- Registration is disabled. To re-enable, uncomment the RouterLink below
         and restore the /register route in src/router/index.js. -->
    <!--
    <p class="text-sm text-slate-500 mt-4 text-center">
      New here?
      <RouterLink :to="{ name: 'register' }" class="text-brand-600 hover:underline">Create an account</RouterLink>
    </p>
    -->
  </div>
</template>
