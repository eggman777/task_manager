const CACHE = 'task-v3'

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

// Cache-First：缓存命中→瞬间返回，网络请求→后台静默缓存
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached

      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()))
        }
        return res.clone()
      })
    })
  )
})
