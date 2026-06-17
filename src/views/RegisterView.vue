<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="max-w-md mx-auto card p-6 mt-10 text-center">
    <div class="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h1 class="text-xl font-semibold text-slate-800">Registration is disabled</h1>
    <p class="text-sm text-slate-500 mt-2">
      Self-service account creation is not available on this instance.
    </p>
    <RouterLink
      :to="{ name: 'login' }"
      class="btn-primary inline-flex mt-5"
    >
      Back to sign in
    </RouterLink>
  </div>
</template>
