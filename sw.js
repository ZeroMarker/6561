const CACHE_NAME = '6561-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/game.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
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

// 清理旧缓存并通知更新
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    }).then(() => {
      // 通知所有客户端已更新
      return self.clients.claim();
    }).then(() => {
      // 通知客户端有更新可用
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'UPDATE_AVAILABLE' });
        });
      });
    })
  );
});

// 缓存策略：缓存优先，网络更新
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      // 如果有缓存就返回缓存，否则返回网络请求
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // 完全离线时的回退
      if (e.request.destination === 'document') {
        return caches.match('/index.html');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});

// 监听消息
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
