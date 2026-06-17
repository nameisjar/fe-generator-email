<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value });
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto card p-6 mt-10">
    <h1 class="text-xl font-semibold text-slate-800">Create your account</h1>
    <p class="text-sm text-slate-500 mt-1">Start managing email aliases on algonova.my.id.</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Name (optional)</label>
        <input v-model="name" class="input" maxlength="80" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input v-model="email" type="email" required autocomplete="email" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Password (min 8)</label>
        <input v-model="password" type="password" required minlength="8" autocomplete="new-password" class="input" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Creating…' : 'Create account' }}
      </button>
    </form>

    <p class="text-sm text-slate-500 mt-4 text-center">
      Already have an account?
      <RouterLink :to="{ name: 'login' }" class="text-brand-600 hover:underline">Sign in</RouterLink>
    </p>
  </div>
</template>
