// 📋 任务卡片组件
// 显示单个任务的完整信息

import { getDeadlineStatus, getTaskCardStatusClass } from '../core/utils.js'

/**
 * 创建任务卡片
 * @param {object} task - 任务数据
 * @param {object} handlers
 * @param {Function} handlers.onToggle - 切换完成状态
 * @param {Function} handlers.onDelete - 删除回调
 * @returns {HTMLElement}
 */
export function createTaskItem(task, { onToggle, onDelete }) {
  const deadlineInfo = getDeadlineStatus(task.deadline)
  const isCompleted = task.completed

  const card = document.createElement('div')
  card.className = `task-card priority-${task.priority}`

  if (isCompleted) {
    card.classList.add('completed')
  }
  // 不重复已完成的卡片状态样式
  if (!isCompleted) {
    const statusClass = getTaskCardStatusClass(task)
    if (statusClass) card.classList.add(statusClass)
  }

  card.innerHTML = `
    <div class="task-header">
      <input
        type="checkbox"
        class="task-checkbox"
        ${isCompleted ? 'checked' : ''}
        data-action="toggle"
      />
      <div class="task-title-area">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
      </div>
    </div>

    <div class="task-meta">
      ${deadlineInfo.label ? `<span class="task-deadline ${deadlineInfo.status !== 'normal' && deadlineInfo.status !== 'none' ? 'deadline-' + deadlineInfo.status : ''}">${deadlineInfo.label}</span>` : ''}
    </div>

    <div class="task-actions">
      <button class="btn btn-ghost btn-sm" data-action="delete">🗑️ 删除</button>
    </div>
  `

  card.querySelector('[data-action="toggle"]').addEventListener('change', () => {
    onToggle(task.id)
  })

  card.querySelector('[data-action="delete"]').addEventListener('click', () => {
    onDelete(task)
  })

  return card
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
