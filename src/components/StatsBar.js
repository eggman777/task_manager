// 📊 统计栏组件
// 任务完成进度统计 + 微图表 Sparkline

import { getStats } from '../core/taskManager.js'

/**
 * 生成过去 7 天模拟完成数据（确定性伪随机，基于统计值）
 */
function generateSparklineData(stats) {
  const seed = stats.total * 7 + stats.completed * 13
  const points = []
  for (let i = 0; i < 7; i++) {
    const pseudo = Math.sin(seed + i * 1.7) * 0.5 + 0.5 // 0~1
    const val = Math.max(0, Math.round(pseudo * Math.max(stats.completed, 3) * 1.2))
    points.push(val)
  }
  // 最后一点锚定为实际完成数
  points[points.length - 1] = stats.completed
  return points
}

/**
 * 用三次贝塞尔插值构建平滑 SVG path
 */
function buildSmoothPath(points, w, h) {
  if (points.length === 0) return ''
  const max = Math.max(...points, 1)
  const n = points.length
  const xStep = w / (n - 1)

  // 将数据点映射到 SVG 坐标空间
  const coords = points.map((v, i) => ({
    x: i * xStep,
    y: h - (v / max) * (h - 2) - 1
  }))

  // 构建三次贝塞尔曲线路径
  let d = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const cp1x = coords[i].x + xStep * 0.4
    const cp1y = coords[i].y
    const cp2x = coords[i + 1].x - xStep * 0.4
    const cp2y = coords[i + 1].y
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${coords[i + 1].x} ${coords[i + 1].y}`
  }
  return d
}

/**
 * 创建统计栏
 * @returns {HTMLElement}
 */
export function createStatsBar() {
  const stats = getStats()
  const sparkData = generateSparklineData(stats)
  const pathD = buildSmoothPath(sparkData, 40, 20)

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
      <svg class="sparkline" width="40" height="20" viewBox="0 0 40 20" aria-hidden="true">
        <path d="${pathD}" />
      </svg>
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
