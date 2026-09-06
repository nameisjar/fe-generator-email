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
  <div class="mx-auto mt-4 grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 sm:mt-10 md:grid-cols-[0.9fr_1.1fr]">
    <section class="relative hidden overflow-hidden bg-brand-700 p-8 text-white md:flex md:flex-col md:justify-between">
      <div class="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10"></div>
      <div class="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand-500/40"></div>
      <div class="relative">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.59 13a2.4 2.4 0 0 0 2.82 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg>
        </span>
        <p class="mt-4 text-lg font-bold">AliasMail</p>
      </div>
      <div class="relative">
        <h2 class="text-2xl font-bold leading-tight">Privasi email,<br />tanpa kerumitan.</h2>
        <p class="mt-3 text-sm leading-6 text-brand-100">Buat alamat terpisah untuk setiap layanan dan kelola semua pesan dari satu tempat.</p>
      </div>
    </section>

    <section class="p-6 sm:p-10">
    <div class="mb-8 flex items-center gap-3 md:hidden">
      <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 10.59 13a2.4 2.4 0 0 0 2.82 0L21 7.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg></span>
      <span class="font-bold text-slate-900">AliasMail</span>
    </div>
    <p class="eyebrow">Selamat datang</p>
    <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Masuk ke akun Anda</h1>
    <p class="mt-2 text-sm text-slate-500">Kelola alias dan email masuk dengan aman.</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
        <input v-model="email" type="email" required autocomplete="email" class="input" placeholder="nama@contoh.com" />
      </div>
      <div>
        <label class="block text-sm font-semibold text-slate-700 mb-1.5">Kata sandi</label>
        <input v-model="password" type="password" required autocomplete="current-password" class="input" placeholder="Masukkan kata sandi" />
      </div>
      <p v-if="error" class="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Sedang masuk…' : 'Masuk' }}
      </button>
    </form>

    <!-- Registration is disabled. To re-enable, uncomment the RouterLink below
         and restore the /register route in src/router/index.js. -->
    <!--
    <p class="text-sm text-slate-500 mt-4 text-center">
      New here?
      <RouterLink :to="{ name: 'register' }" class="text-brand-600 hover:underline">Buat akun</RouterLink>
    </p>
    -->
    </section>
  </div>
</template>
