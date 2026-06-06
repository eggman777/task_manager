const CACHE = 'task-manager-v2'

// Cache-first + 后台更新（stale-while-revalidate）
// 缓存命中→立即返回（零延迟），同时后台无感更新
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        // 后台下载最新版本，不影响当前响应
        const fetched = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone())
          return res
        })

        // 缓存命中 → 立即返回
        if (cached) {
          fetched.catch(() => {}) // fire-and-forget
          return cached
        }

        // 缓存未中 → 等网络
        return fetched
      })
    )
  )
})

// 激活时清理旧版本缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})
