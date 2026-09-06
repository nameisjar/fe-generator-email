const CODE_CONTEXT = /(?:verification|security|confirmation|authentication|login|access|one[- ]time)\s+(?:code|passcode)|kode(?:\s+verifikasi)?|otp|pin|passcode|code/i;

export function normalizeOtp(value) {
  if (!value || typeof value !== 'string') return '';
  const normalized = value.trim().replace(/^-+|-+$/g, '').toUpperCase();
  const compact = normalized.replace(/-/g, '');
  if (!/^[A-Z0-9]{4,8}$/.test(compact) || !/\d/.test(compact)) return '';
  return normalized;
}

export function resolveOtp(subject = '', text = '', storedCode = '') {
  const sources = [subject, text]
    .filter(Boolean)
    .map((value) => String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

  const afterContext = /(?:(?:verification|security|confirmation|authentication|login|access|one[- ]time)\s+(?:code|passcode)|kode(?:\s+verifikasi)?|otp|pin|passcode|code)(?:\s+(?:anda|your))?(?:\s+(?:is|adalah|yaitu))?[\s:#-]{0,16}([A-Z0-9](?:[A-Z0-9-]{2,10}[A-Z0-9]))/i;
  const beforeContext = /\b([A-Z0-9](?:[A-Z0-9-]{2,10}[A-Z0-9]))[\s,:-]{0,16}(?:is\s+)?(?:your\s+)?(?:\w+\s+){0,2}(?:(?:verification|security|confirmation|authentication|login|access|one[- ]time)\s+(?:code|passcode)|kode(?:\s+verifikasi)?|otp|pin|passcode|code)\b/i;

  for (const source of sources) {
    for (const pattern of [afterContext, beforeContext]) {
      const code = normalizeOtp(source.match(pattern)?.[1]);
      if (code) return code;
    }
  }

  const bareSubject = sources[0]?.match(/^[\s#:-]*(\d{4,8})[\s#:-]*$/);
  const bareCode = normalizeOtp(bareSubject?.[1]);
  if (bareCode) return bareCode;

  for (const source of sources) {
    if (!CODE_CONTEXT.test(source)) continue;
    const numeric = normalizeOtp(source.match(/\b(\d{4,8})\b/)?.[1]);
    if (numeric) return numeric;
  }

  return normalizeOtp(storedCode);
}
