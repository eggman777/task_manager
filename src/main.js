import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/state.css'
import './styles/mobile.css'
import './app.js'

// Service Worker 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 静默失败，离线不影响使用
    })
  })
}

console.log('🎓 学习任务管理器已加载')
