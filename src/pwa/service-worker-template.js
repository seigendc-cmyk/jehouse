const PRECACHE_ENTRIES = __PRESSCRAFT_PRECACHE_ENTRIES__;
const SHELL_CACHE = 'presscraft-shell-__PRESSCRAFT_BUILD_REVISION__';
const RUNTIME_IMAGE_CACHE = 'presscraft-runtime-images-v1';
const MAX_RUNTIME_IMAGES = 32;
const SHELL_URLS = new Set(PRECACHE_ENTRIES.map((entry) => entry.url));

function isRemoteDataRequest(url) {
  return (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/firebase/') ||
    url.pathname.startsWith('/firestore/') ||
    url.pathname.startsWith('/gemini/')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_ENTRIES.map((entry) => entry.url)))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('presscraft-shell-') && name !== SHELL_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function cacheRuntimeImage(request) {
  const cache = await caches.open(RUNTIME_IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (!response.ok || response.type === 'opaque') return response;

  await cache.put(request, response.clone());
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_RUNTIME_IMAGES)).map((key) => cache.delete(key)));
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isRemoteDataRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        return cache.match('/index.html');
      })
    );
    return;
  }

  if (SHELL_URLS.has(url.pathname)) {
    event.respondWith(caches.open(SHELL_CACHE).then((cache) => cache.match(url.pathname)));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheRuntimeImage(request));
  }
});
