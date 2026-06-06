// 📋 任务卡片组件
// 显示单个任务的完整信息

import { getDeadlineStatus } from '../core/utils.js'

/**
 * 创建任务卡片
 * @param {object} task - 任务数据
 * @param {Function} onToggle - 切换完成状态回调
 * @param {Function} onDelete - 删除回调
 * @returns {HTMLElement} 任务卡片 DOM 元素
 */
export function createTaskItem(task, { onToggle, onDelete }) {
  const deadlineInfo = getDeadlineStatus(task.deadline)
  const isCompleted = task.completed

  const card = document.createElement('div')
  card.className = `task-card priority-${task.priority}`
  if (isCompleted) {
    card.classList.add('completed')
  }
  if (!isCompleted && task.deadline) {
    const cssClass = getCardStatusClass(task.deadline)
    if (cssClass) card.classList.add(cssClass)
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

/**
 * 获取卡片状态样式类
 */
function getCardStatusClass(deadline) {
  if (!deadline) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const d = new Date(deadline + 'T00:00:00')
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due-today'
  if (diffDays <= 3) return 'due-soon'
  return ''
}

/**
 * HTML 转义
 */
function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
