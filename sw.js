// 自律小窝 PWA 服务工作线程：预缓存资源，离线可用，版本化更新
const CACHE_VERSION = 'zili-xiaowo-v5';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 核心文件：network-first，确保在线时用户总是拿到最新代码
const CORE_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // 仅处理同源请求
  if (url.origin !== self.location.origin) return;

  const isCore = CORE_FILES.some(function (f) {
    return url.pathname.endsWith(f) || url.pathname === f.replace('./', '/');
  });

  if (isCore) {
    // 核心文件：network-first
    event.respondWith(
      fetch(event.request).then(function (res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(event.request, clone); });
        }
        return res;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
  } else {
    // 非核心文件：stale-while-revalidate
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        var network = fetch(event.request).then(function (res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE_VERSION).then(function (c) { c.put(event.request, clone); });
          }
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      })
    );
  }
});
