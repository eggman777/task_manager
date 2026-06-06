// 📋 任务列表组件
// 渲染任务卡片列表或空状态

import { createTaskItem } from './TaskItem.js'

/**
 * 创建任务列表
 * @param {object[]} tasks - 要显示的任务数组
 * @param {object} handlers - 事件处理回调
 * @param {Function} handlers.onToggle - 切换完成状态
 * @param {Function} handlers.onDelete - 删除任务
 * @returns {HTMLElement} 列表 DOM 元素
 */
export function createTaskList(tasks, { onToggle, onDelete }) {
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

  // 先显示未完成，再显示已完成
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return 0
  })

  sorted.forEach(task => {
    const item = createTaskItem(task, { onToggle, onDelete })
    container.appendChild(item)
  })

  return container
}
