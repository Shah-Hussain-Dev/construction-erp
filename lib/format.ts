export const inr = (n: unknown) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
export const qty = (n: unknown) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 }).format(Number(n) || 0);
export const day = (v: unknown) =>
  v
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(new Date(String(v)))
    : '—';
export const label = (s: unknown) =>
  String(s || '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/^./, (c) => c.toUpperCase());
export const text = (v: unknown) => (v == null ? '' : String(v));
