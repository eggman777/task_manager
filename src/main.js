import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/state.css'
import './styles/mobile.css'
import './app.js'

// Service Worker 注册 + 自动更新检测
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // 检测到新版 SW → 自动刷新页面
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing
        if (newSW) {
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版 SW 已就绪，刷新页面应用更新
              window.location.reload()
            }
          })
        }
      })
    }).catch(() => {
      // 静默失败，离线不影响使用
    })
  })
}

console.log('🎓 学习任务管理器已加载')
