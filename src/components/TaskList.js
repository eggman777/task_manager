// 📋 任务列表组件
// 渲染任务卡片列表或空状态（移动端带滑动操作）

import { createTaskItem } from './TaskItem.js'
import { createSwipeableTask } from './SwipeableTask.js'
import { isMobile } from '../core/utils.js'

/**
 * 创建任务列表
 * @param {object[]} tasks
 * @param {object} handlers
 * @param {Function} handlers.onToggle
 * @param {Function} handlers.onDelete
 * @param {Function} handlers.onEdit
 * @returns {HTMLElement}
 */
export function createTaskList(tasks, { onToggle, onDelete, onEdit }) {
  const container = document.createElement('div')
  container.className = 'task-list-container'

  if (!tasks || tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎉</div>
        <h2 class="empty-state-title">还没有任务</h2>
        <p class="empty-state-message">点击「新建」开始吧！</p>
      </div>
    `
    return container
  }

  const mobile = isMobile()

  tasks.forEach(task => {
    const card = createTaskItem(task, { onToggle, onDelete, onEdit })

    if (mobile) {
      const swipeable = createSwipeableTask(task, { onToggle, onDelete, onEdit }, card)
      container.appendChild(swipeable)
    } else {
      container.appendChild(card)
    }
  })

  return container
}
