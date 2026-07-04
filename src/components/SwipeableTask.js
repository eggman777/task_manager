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

  // 左滑显示的删除按钮（默认隐藏，仅滑动时显示）
  const actions = document.createElement('div')
  actions.className = 'swipe-actions'
  actions.style.opacity = '0'
  actions.style.transition = 'opacity 0.15s ease'
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

    // Show delete button as soon as user starts swiping left
    if (dx < 0) {
      actions.style.opacity = '1'
      const offset = Math.max(dx, -80)
      content.style.transform = `translateX(${offset}px)`
      content.style.transition = 'none'
    } else {
      actions.style.opacity = '0'
    }
  }

  function onTouchEnd() {
    if (!isDragging) return

    content.style.transition = ''

    if (currentX < -SWIPE_THRESHOLD) {
      // Snap open: keep delete button visible
      content.style.transform = `translateX(-80px)`
      actions.style.opacity = '1'
    } else {
      // Snap shut: hide delete button
      content.style.transform = ''
      actions.style.opacity = '0'
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
