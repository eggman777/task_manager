// 🛠️ 工具函数
// 日期格式化、ID 生成等通用工具

/**
 * 生成唯一任务 ID
 */
export function generateId() {
  return crypto.randomUUID()
}

/**
 * 格式化日期为友好显示
 * @param {string} dateStr - ISO 日期 "YYYY-MM-DD"
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

/**
 * 判断日期状态
 * @param {string} dateStr - ISO 日期 "YYYY-MM-DD"
 * @returns {{ status: string, label: string }} 状态和显示文本
 */
export function getDeadlineStatus(dateStr) {
  if (!dateStr) return { status: 'none', label: '' }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const deadline = new Date(dateStr + 'T00:00:00')
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return { status: 'overdue', label: `⚠️ 已过期 ${days} 天` }
  } else if (diffDays === 0) {
    return { status: 'today', label: '🔥 今天截止' }
  } else if (diffDays <= 3) {
    return { status: 'soon', label: `⚡ 还剩 ${diffDays} 天` }
  } else {
    return { status: 'normal', label: `📅 ${formatDate(dateStr)}` }
  }
}

/**
 * 获取优先级显示文本
 * @param {string} priority - "high" | "medium" | "low"
 * @returns {string}
 */
export function getPriorityLabel(priority) {
  const map = {
    high: '🔴 高优先',
    medium: '🟡 中优先',
    low: '🟢 低优先'
  }
  return map[priority] || ''
}

/**
 * 获取任务当前状态
 * @param {object} task
 * @returns {string}
 */
export function getTaskCardStatusClass(task) {
  if (task.completed) return 'completed'

  if (!task.deadline) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const deadline = new Date(task.deadline + 'T00:00:00')
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due-today'
  if (diffDays <= 3) return 'due-soon'
  return ''
}

/**
 * 根据查询文本过滤任务
 * @param {object[]} tasks
 * @param {string} query
 * @returns {object[]}
 */
export function searchTasks(tasks, query) {
  if (!query.trim()) return tasks
  const q = query.toLowerCase()
  return tasks.filter(t =>
    t.title.toLowerCase().includes(q) ||
    (t.description && t.description.toLowerCase().includes(q))
  )
}

/**
 * 根据条件排序任务
 * @param {object[]} tasks
 * @param {string} sortBy - "deadline" | "priority" | "createdAt"
 * @returns {object[]}
 */
export function sortTasks(tasks, sortBy) {
  const sorted = [...tasks]
  const priorityOrder = { high: 0, medium: 1, low: 2 }

  switch (sortBy) {
    case 'deadline':
      sorted.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
      break
    case 'priority':
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      break
    case 'createdAt':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }
  return sorted
}

/**
 * 获取当前时间的 ISO 字符串
 */
export function nowISO() {
  return new Date().toISOString()
}
