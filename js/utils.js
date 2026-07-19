export const STATUS_LABELS = {
  pending:          'Pending',
  picked_up:        'Picked Up',
  in_transit:       'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  failed:           'Failed',
  cancelled:        'Cancelled'
};

export const STATUS_FLOW = [
  'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'
];

export function generateTrackingNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `PRD-${seg()}-${seg()}`;
}

export function formatDate(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function statusBadge(status) {
  return `<span class="badge badge-${status}">${STATUS_LABELS[status] || status}</span>`;
}

export function avatar(name = '') {
  return (name || '?').trim().charAt(0).toUpperCase();
}

// ── Toast ───────────────────────────────────
let toastWrap = null;
function getToastWrap() {
  if (!toastWrap) {
    toastWrap = document.getElementById('toast-container');
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.id = 'toast-container';
      document.body.appendChild(toastWrap);
    }
  }
  return toastWrap;
}

export function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="font-size:15px">${icons[type] || icons.info}</span><span>${message}</span>`;
  getToastWrap().appendChild(el);
  setTimeout(() => {
    el.style.animation = 'fadeOut 0.3s ease forwards';
    el.addEventListener('animationend', () => el.remove());
  }, 3500);
}

// ── Modal helpers ────────────────────────────
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// ── Route guard redirect ─────────────────────
export function redirectTo(path) { window.location.href = path; }

// ── Debounce ─────────────────────────────────
export function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}
