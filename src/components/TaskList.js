// 📋 任务列表组件
// 渲染任务卡片列表或空状态

import { createTaskItem } from './TaskItem.js'

/**
 * 创建任务列表
 * @param {object[]} tasks - 已筛选排序好的任务
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
        <p class="empty-state-message">点击上方的「新建任务」按钮开始吧！</p>
      </div>
    `
    return container
  }

  tasks.forEach(task => {
    container.appendChild(createTaskItem(task, { onToggle, onDelete, onEdit }))
  })

  return container
}
