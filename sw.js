const CACHE = 'primeroute-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/tracking.html',
  '/login.html',
  '/css/variables.css',
  '/css/main.css',
  '/img/logo-full.jpg',
  '/img/logo-icon.png',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/manifest.json'
];

// Install — cache core shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', e => {
  // Only handle GET requests; skip Firebase API calls
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebaseio.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('gstatic.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses for static assets
        if (res.ok && (e.request.url.match(/\.(html|css|js|png|jpg|json)$/))) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
  );
});
