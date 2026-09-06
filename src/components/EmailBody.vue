<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import DOMPurify from 'dompurify';

const props = defineProps({
  html: { type: String, default: '' },
  text: { type: String, default: '' },
});

const mode = ref(props.html ? 'original' : 'text');
const frame = ref(null);
const frameHeight = ref(320);
let resizeObserver = null;
let resizeTimer = null;

const preparedEmail = computed(() => {
  if (!props.html) return '';

  const clean = DOMPurify.sanitize(props.html, {
    USE_PROFILES: { html: true },
    WHOLE_DOCUMENT: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'base'],
    FORBID_ATTR: ['srcset'],
  });

  const documentNode = new DOMParser().parseFromString(clean, 'text/html');
  documentNode.querySelectorAll('a[href]').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer nofollow');
  });

  documentNode.querySelectorAll('img').forEach((image) => {
    const source = image.getAttribute('src') || '';
    if (/^(?:https?:)?\/\//i.test(source)) {
      image.setAttribute('loading', 'lazy');
      image.setAttribute('referrerpolicy', 'no-referrer');
    }
  });

  const bodyClass = documentNode.body.getAttribute('class') || '';
  const bodyStyle = documentNode.body.getAttribute('style') || '';
  const embeddedStyles = Array.from(documentNode.head.querySelectorAll('style'))
    .map((style) => style.outerHTML)
    .join('');
  const srcdoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: http: data: blob:; style-src 'unsafe-inline'; font-src data: https:; connect-src 'none'; media-src 'none'; frame-src 'none';">
    <base target="_blank">
    ${embeddedStyles}
    <style>
      :root { color-scheme: light; }
      html { background: #fff; }
      body { box-sizing: border-box; margin: 0; padding: 0; max-width: 100%; overflow-wrap: anywhere; background: #fff; color: #1e293b; }
      *, *::before, *::after { box-sizing: border-box; }
      img { max-width: 100% !important; height: auto !important; }
      table { max-width: 100%; }
      pre { max-width: 100%; overflow-x: auto; white-space: pre-wrap; }
      a { color: #1d5cf2; }
    </style>
  </head>
  <body class="${bodyClass.replace(/"/g, '&quot;')}" style="${bodyStyle.replace(/"/g, '&quot;')}">
    ${documentNode.body.innerHTML}
  </body>
</html>`;

  return srcdoc;
});

function resizeFrame() {
  resizeObserver?.disconnect();
  if (resizeTimer) window.clearTimeout(resizeTimer);

  const documentNode = frame.value?.contentDocument;
  if (!documentNode) return;

  const updateHeight = () => {
    const measured = Math.max(
      documentNode.body?.scrollHeight || 0,
      documentNode.documentElement?.scrollHeight || 0,
    );
    frameHeight.value = Math.min(Math.max(measured + 2, 240), 24000);
  };

  resizeObserver = new ResizeObserver(updateHeight);
  if (documentNode.documentElement) resizeObserver.observe(documentNode.documentElement);
  if (documentNode.body) resizeObserver.observe(documentNode.body);
  documentNode.querySelectorAll('img').forEach((image) => {
    image.addEventListener('load', updateHeight, { once: true });
    image.addEventListener('error', updateHeight, { once: true });
  });
  updateHeight();
  resizeTimer = window.setTimeout(updateHeight, 150);
}

async function setMode(nextMode) {
  mode.value = nextMode;
  if (nextMode === 'original') {
    await nextTick();
    resizeFrame();
  }
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (resizeTimer) window.clearTimeout(resizeTimer);
});
</script>

<template>
  <div>
    <div v-if="html && text" class="mb-4">
      <div class="inline-flex self-start rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Mode tampilan email">
        <button class="rounded-lg px-3 py-1.5 text-xs font-semibold transition" :class="mode === 'original' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'" role="tab" :aria-selected="mode === 'original'" @click="setMode('original')">Tampilan asli</button>
        <button class="rounded-lg px-3 py-1.5 text-xs font-semibold transition" :class="mode === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'" role="tab" :aria-selected="mode === 'text'" @click="setMode('text')">Teks sederhana</button>
      </div>
    </div>

    <div v-if="mode === 'original' && html" class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:p-4">
      <iframe
        ref="frame"
        :srcdoc="preparedEmail"
        :style="{ height: `${frameHeight}px` }"
        class="block w-full rounded-xl bg-white"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title="Isi email"
        @load="resizeFrame"
      />
    </div>
    <div v-else-if="text" class="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <pre class="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">{{ text }}</pre>
    </div>
    <p v-else class="py-8 text-center text-sm italic text-slate-400">(isi email kosong)</p>
  </div>
</template>
