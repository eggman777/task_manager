// 📋 任务列表组件

import { createTaskItem } from './TaskItem.js'
import { createSwipeableTask } from './SwipeableTask.js'
import { isMobile } from '../core/utils.js'

/**
 * @param {object[]} tasks
 * @param {object} handlers
 * @param {string} [handlers.emptyFilter] - 当前筛选状态，用于空状态提示
 */
export function createTaskList(tasks, { onToggle, onDelete, onEdit, isSelectMode, selectedIds, onSelect, emptyFilter }) {
  const container = document.createElement('div')
  container.className = 'task-list-container'

  if (!tasks || tasks.length === 0) {
    const msg = emptyFilter === 'active'
      ? '没有进行中的任务 ✅'
      : emptyFilter === 'completed'
        ? '还没有完成的任务 📝'
        : '点击「新建」开始吧！🚀'
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎉</div>
        <h2 class="empty-state-title">${msg}</h2>
      </div>
    `
    return container
  }

  const mobile = isMobile()

  tasks.forEach(task => {
    const card = createTaskItem(task, {
      onToggle, onDelete, onEdit, onSelect,
      isSelectMode: !!isSelectMode,
      isSelected: selectedIds ? selectedIds.has(task.id) : false
    })

    if (mobile && !isSelectMode) {
      container.appendChild(createSwipeableTask(task, { onToggle, onDelete, onEdit }, card))
    } else {
      container.appendChild(card)
    }
  })

  return container
}
