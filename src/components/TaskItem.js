// 📋 任务卡片组件
// 显示单个任务的完整信息

import { getDeadlineStatus, getTaskCardStatusClass, getPriorityLabel } from '../core/utils.js'

/**
 * 创建任务卡片
 * @param {object} task
 * @param {object} handlers
 * @param {Function} handlers.onToggle
 * @param {Function} handlers.onDelete
 * @param {Function} handlers.onEdit
 * @returns {HTMLElement}
 */
export function createTaskItem(task, { onToggle, onDelete, onEdit }) {
  const deadlineInfo = getDeadlineStatus(task.deadline)
  const isCompleted = task.completed

  const card = document.createElement('div')
  card.className = `task-card priority-${task.priority}`
  if (isCompleted) card.classList.add('completed')
  if (!isCompleted) { const c = getTaskCardStatusClass(task); if (c) card.classList.add(c) }

  card.innerHTML = `
    <div class="task-header">
      <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-action="toggle" />
      <div class="task-title-area">
        <div class="task-title">${escHtml(task.title)}</div>
        ${task.description ? `<p class="task-description">${escHtml(task.description)}</p>` : ''}
      </div>
    </div>

    ${task.tags && task.tags.length > 0 ? `
    <div class="task-tags">
      ${task.tags.map(t => `<span class="task-tag">${escHtml(t)}</span>`).join('')}
    </div>` : ''}

    <div class="task-meta">
      <span class="priority-badge ${task.priority}">${getPriorityLabel(task.priority)}</span>
      ${deadlineInfo.label ? `<span class="task-deadline ${deadlineInfo.status !== 'normal' && deadlineInfo.status !== 'none' ? 'deadline-' + deadlineInfo.status : ''}">${deadlineInfo.label}</span>` : ''}
    </div>

    <div class="task-actions">
      <button class="btn btn-ghost btn-sm" data-action="edit">✏️ 编辑</button>
      <button class="btn btn-ghost btn-sm" data-action="delete">🗑️ 删除</button>
    </div>
  `

  card.querySelector('[data-action="toggle"]').addEventListener('change', () => onToggle(task.id))
  card.querySelector('[data-action="edit"]').addEventListener('click', () => onEdit(task))
  card.querySelector('[data-action="delete"]').addEventListener('click', () => onDelete(task))

  return card
}

function escHtml(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML
}
