// 📊 统计栏组件
// 任务完成进度统计

import { getStats } from '../core/taskManager.js'

/**
 * 创建统计栏
 * @returns {HTMLElement}
 */
export function createStatsBar() {
  const stats = getStats()

  const bar = document.createElement('div')
  bar.className = 'stats-bar'

  bar.innerHTML = `
    <div class="stats-item">
      <span class="stats-number">${stats.total}</span>
      <span class="stats-label">📝 总任务</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-item">
      <span class="stats-number">${stats.completed}</span>
      <span class="stats-label">✅ 已完成</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-item">
      <span class="stats-number">${stats.active}</span>
      <span class="stats-label">🔄 进行中</span>
    </div>
    <div class="stats-divider"></div>
    <div class="stats-progress-wrap">
      <div class="stats-progress-bar">
        <div class="stats-progress-fill" style="width:${stats.progress}%"></div>
      </div>
      <div class="stats-progress-text">已完成 ${stats.progress}%${stats.total === 0 ? ' — 还没有任务' : ''}</div>
    </div>
  `

  return bar
}
