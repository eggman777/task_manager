// 📋 任务卡片组件

import { getDeadlineStatus, getTaskCardStatusClass, getPriorityLabel, isMobile } from '../core/utils.js'

export function createTaskItem(task, { onToggle, onDelete, onEdit, onSelect, isSelectMode, isSelected }) {
  const deadlineInfo = getDeadlineStatus(task.deadline)
  const isCompleted = task.completed
  const createdDate = formatCreatedDate(task.createdAt)

  const card = document.createElement('div')
  card.className = `task-card priority-${task.priority}`
  card.setAttribute('data-id', task.id)
  if (isCompleted) card.classList.add('completed')
  if (!isCompleted) { const c = getTaskCardStatusClass(task); if (c) card.classList.add(c) }
  if (isSelected) card.classList.add('selected-card')

  // 多选模式单独画复选框，否则正常显示
  const showToggle = !isSelectMode
  const showSelect = isSelectMode

  card.innerHTML = `
    <div class="task-header">
      <div class="task-title-area">
        <div class="task-title">${escHtml(task.title)}</div>
        ${task.description ? `<p class="task-description">${escHtml(task.description)}</p>` : ''}
      </div>
      ${showSelect ? `<input type="checkbox" class="task-checkbox" ${isSelected ? 'checked' : ''} data-action="select" />` : ''}
      ${showToggle ? `<input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-action="toggle" />` : ''}
    </div>

    ${task.tags && task.tags.length > 0 ? `
    <div class="task-tags">
      ${task.tags.map(t => `<span class="task-tag">${escHtml(t)}</span>`).join('')}
    </div>` : ''}

    <div class="task-meta">
      ${deadlineInfo.label ? `<span class="task-deadline ${deadlineInfo.status !== 'normal' && deadlineInfo.status !== 'none' ? 'deadline-' + deadlineInfo.status : ''}">${deadlineInfo.label}</span>` : ''}
      ${isCompleted ? `<span class="task-created-date">📅 ${createdDate}</span>` : ''}
    </div>

    <div class="task-actions">
      ${!isSelectMode ? '<button class="btn btn-ghost btn-sm" data-action="edit">✏️ 编辑</button>' : ''}
      <button class="btn btn-ghost btn-sm" data-action="delete">🗑️ 删除</button>
    </div>
  `

  card.querySelector('[data-action="toggle"]')?.addEventListener('change', () => onToggle(task.id))
  card.querySelector('[data-action="select"]')?.addEventListener('change', () => onSelect(task.id))
  card.querySelector('[data-action="delete"]').addEventListener('click', () => onDelete(task))
  card.querySelector('[data-action="edit"]')?.addEventListener('click', () => onEdit(task))

  // Mobile: click card body to edit (not when clicking checkboxes/buttons)
  if (isMobile() && !isSelectMode) {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]') || e.target.closest('.swipe-actions')) return
      onEdit(task)
    })
  }

  return card
}

function formatCreatedDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function escHtml(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML
}
