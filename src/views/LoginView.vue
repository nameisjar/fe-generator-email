<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// Map error code dari backend ke pesan yang ramah user.
// Kode lain yang tidak dikenali akan pakai message dari backend kalau ada,
// atau fallback generik.
function mapAuthError(err) {
  const code = err?.response?.data?.error?.code;
  const backendMessage = err?.response?.data?.error?.message;

  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Email atau password salah.';
    case 'EMAIL_TAKEN':
      return 'Email sudah terdaftar.';
    case 'RATE_LIMITED':
      return 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.';
    case 'UNAUTHORIZED':
      // Biasanya dari /refresh di interceptor — abaikan di halaman login.
      return '';
    default:
      if (err?.response?.status === 401) {
        return 'Email atau password salah.';
      }
      if (err?.response?.status === 429) {
        return 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.';
      }
      if (!err?.response) {
        return 'Tidak dapat menghubungi server. Periksa koneksi Anda.';
      }
      return backendMessage || 'Login gagal. Coba lagi.';
  }
}

// Reset pesan error begitu user mulai mengetik lagi supaya tidak "stuck".
watch(email, () => { if (error.value) error.value = ''; });
watch(password, () => { if (error.value) error.value = ''; });

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    // Hanya redirect kalau login benar-benar berhasil (tidak throw).
    const target = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    await router.push(target);
  } catch (err) {
    // Jangan redirect — tampilkan pesan di tempat, tetap di halaman login.
    error.value = mapAuthError(err);
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
