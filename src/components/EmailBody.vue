<script setup>
import { computed } from 'vue';
import DOMPurify from 'dompurify';

const props = defineProps({
  html: { type: String, default: '' },
  text: { type: String, default: '' },
});

// We sanitize the HTML before injecting it. DOMPurify strips <script>, on* attrs,
// javascript: URLs, etc.
const sanitizedHtml = computed(() => {
  if (!props.html) return '';
  return DOMPurify.sanitize(props.html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style'],
  });
});
</script>

<template>
  <div v-if="sanitizedHtml" class="prose prose-sm max-w-none" v-html="sanitizedHtml" />
  <pre v-else-if="text" class="whitespace-pre-wrap text-sm text-slate-700 font-sans">{{ text }}</pre>
  <p v-else class="text-sm text-slate-400 italic">(empty body)</p>
</template>
