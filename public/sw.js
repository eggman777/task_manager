const CACHE = 'task-v4'

// Install: 立刻接管，不等待旧 SW 释放
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Activate: 清旧缓存 + 立即控制所有页面
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Stale-While-Revalidate：先给缓存（秒开），同时后台拉新版本更新缓存
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        // 后台发起网络请求更新缓存
        const fetchPromise = fetch(e.request).then(res => {
          if (res.ok && res.type === 'basic') {
            cache.put(e.request, res.clone())
          }
          return res.clone()
        }).catch(() => null)

        // 缓存命中 → 先返回缓存，后台静默更新
        // 缓存未命中 → 等网络请求
        return cached || fetchPromise
      })
    )
  )
})
