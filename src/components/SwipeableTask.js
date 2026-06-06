// 👆 滑动操作组件
// 包装 TaskItem，支持左滑删除/右滑完成

import { isMobile } from '../core/utils.js'

const SWIPE_THRESHOLD = 60 // px

/**
 * 创建可滑动任务卡片
 * @param {object} task
 * @param {object} handlers
 * @param {Function} handlers.onToggle
 * @param {Function} handlers.onDelete
 * @param {Function} handlers.onEdit
 * @param {HTMLElement} card - 已创建的 TaskItem DOM
 * @returns {HTMLElement}
 */
export function createSwipeableTask(task, handlers, card) {
  const container = document.createElement('div')
  container.className = 'swipe-container'

  // 左滑显示的删除按钮
  const actions = document.createElement('div')
  actions.className = 'swipe-actions'
  actions.innerHTML = `
    <button class="swipe-action-btn delete">🗑️ 删除</button>
  `
  actions.querySelector('.swipe-action-btn').addEventListener('click', () => {
    handlers.onDelete(task)
  })

  // 将卡片包在 swipe-content 里
  const content = document.createElement('div')
  content.className = 'swipe-content'
  content.appendChild(card)
  container.appendChild(actions)
  container.appendChild(content)

  // 滑动状态
  let startX = 0
  let currentX = 0
  let isDragging = false

  // 只有触控设备启用滑动
  if (isMobile()) {
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })
  }

  function onTouchStart(e) {
    startX = e.touches[0].clientX
    currentX = 0
    isDragging = false
  }

  function onTouchMove(e) {
    const dx = e.touches[0].clientX - startX
    if (Math.abs(dx) < 5) return // 忽略微小滑动
    isDragging = true
    currentX = dx

    // 左滑显示删除按钮，右滑不做偏移（完成用复选框）
    if (dx < 0) {
      const offset = Math.max(dx, -80)
      content.style.transform = `translateX(${offset}px)`
      content.style.transition = 'none'
    }
  }

  function onTouchEnd() {
    if (!isDragging) return

    content.style.transition = ''

    if (currentX < -SWIPE_THRESHOLD) {
      // 左滑到底 → 删除按钮完全展开
      content.style.transform = `translateX(-80px)`
    } else {
      // 回弹
      content.style.transform = ''
    }

    isDragging = false
  }

  return container
}

/**
 * 重置所有滑动状态（列表重新渲染时调用）
 */
export function resetSwipes() {
  document.querySelectorAll('.swipe-content').forEach(el => {
    el.style.transform = ''
  })
}
