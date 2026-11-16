const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('en-IN');

export const formatInt = (n) => int.format(Number(n) || 0);
export const formatINR = (n) => inr.format(Number(n) || 0);

/** ₹4.2 Cr / ₹12.5 L / ₹8,400 — the way Indian finance teams write it. */
export function formatINRShort(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const trim = (x) => x.toFixed(x >= 100 ? 0 : x >= 10 ? 1 : 2).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
  if (abs >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (abs >= 1e5) return `₹${trim(n / 1e5)} L`;
  return formatINR(n);
}

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', opts);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return formatDate(value);
}

export const plural = (n, one, many = `${one}s`) => `${formatInt(n)} ${Number(n) === 1 ? one : many}`;

export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** “The API server…” → “the API server…”, for joining sentences. */
export const lowerFirst = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);
