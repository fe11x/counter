const CACHE_NAME = 'counter-cache-v1';

// 需要缓存的资源列表
const urlsToCache = [
  './',
  './index.html',
  './icon.png', // 你的桌面图标
  'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// 安装 Service Worker，缓存必要的文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('已打开缓存');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker，清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截网络请求，优先从缓存中获取（离线可用核心）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，则直接返回缓存的数据
        if (response) {
          return response;
        }
        // 否则去网络请求
        return fetch(event.request).then(
          function(response) {
            // 检查是否收到有效的响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 如果是第三方网络请求或需要动态缓存的，可以在这里额外添加
            // 对于这个小工具，我们只缓存指定的静态文件即可
            return response;
          }
        );
      })
  );
});
