const CACHE_NAME = '6561-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/www/styles.css',
  '/www/game.js',
  '/www/manifest.json',
  '/www/icon-192.png',
  '/www/icon-512.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// 预缓存静态资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 缓存策略：缓存优先，网络更新
self.addEventListener('fetch', (e) => {
  // 跳过非 GET 请求
  if (e.request.method !== 'GET') return;
  
  // 跳过 cross-origin 请求
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 返回缓存或 fetch 网络
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // 缓存新的响应
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // 网络失败，返回缓存（如果有）
        return cachedResponse;
      });
      
      return cachedResponse || fetchPromise;
    })
  );
});