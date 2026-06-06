// 🛠️ 工具函数
// 日期格式化、ID 生成等通用工具

/**
 * 生成唯一任务 ID
 */
export function generateId() {
  return crypto.randomUUID()
}

/**
 * 获取当前时间的 ISO 字符串
 */
export function nowISO() {
  return new Date().toISOString()
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

// ─── 截止日期解析（新格式 "MM-DD HH:mm"） ───

/**
 * 将 "MM-DD" 解析为实际 Date 对象
 * 如果今年日期已过去超过183天，则推断为下一年
 * @param {string} deadline - "MM-DD" 或 "MM-DD HH:mm"
 * @returns {Date|null}
 */
function resolveDeadline(deadline) {
  if (!deadline) return null
  const [datePart, timePart] = deadline.split(' ')
  const [month, day] = datePart.split('-').map(Number)
  const now = new Date()

  let year = now.getFullYear()
  let target = new Date(year, month - 1, day)

  if (timePart) {
    const [h, m] = timePart.split(':').map(Number)
    target.setHours(h, m, 0, 0)
  } else {
    target.setHours(23, 59, 59, 999)
  }

  // 如果早于今年"今天"超过183天（≈半年），说明是跨年场景
  // 例：12月设"01-15" → 今年1月早已过去 → 跳转下一年
  if (target.getTime() < now.getTime() - 183 * 86400000) {
    year = now.getFullYear() + 1
    target = new Date(year, month - 1, day)
    if (timePart) {
      const [h, m] = timePart.split(':').map(Number)
      target.setHours(h, m, 0, 0)
    } else {
      target.setHours(23, 59, 59, 999)
    }
  }

  return target
}

/**
 * 获取当天零点
 */
function todayStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * 格式化月日为中文显示
 * @param {string} mmdd - "06-15"
 * @returns {string} "6月15日"
 */
function formatMonthDay(mmdd) {
  if (!mmdd) return ''
  const [m, d] = mmdd.split('-').map(Number)
  return `${m}月${d}日`
}

/**
 * 判断截止日期状态
 * @param {string} deadline - "MM-DD" 或 "MM-DD HH:mm" 或 null
 * @returns {{ status: string, label: string }}
 *   status: 'none' | 'overdue' | 'today' | 'soon' | 'normal'
 */
export function getDeadlineStatus(deadline) {
  if (!deadline) return { status: 'none', label: '' }

  const [datePart, timePart] = deadline.split(' ')
  const target = resolveDeadline(deadline)
  const now = new Date()
  const nowStart = todayStart()
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.round((targetStart.getTime() - nowStart.getTime()) / 86400000)

  // ── 已过期 ──
  if (diffMs < 0) {
    if (diffDays < 0) {
      return { status: 'overdue', label: `⚠️ 已过期 ${Math.abs(diffDays)} 天` }
    }
    // 同一天但时间已过（如今天17:00截止，现在18:00）
    return { status: 'overdue', label: `⚠️ 已过期 — ${formatMonthDay(datePart)} ${timePart}` }
  }

  // ── 今天 ──
  if (diffDays === 0) {
    if (timePart) {
      const diffMins = Math.floor(diffMs / 60000)
      const label = diffMins < 60
        ? `🔥 今天 ${timePart}（剩${diffMins}分钟）`
        : `🔥 今天 ${timePart} 截止`
      return { status: 'today', label }
    }
    return { status: 'today', label: '🔥 今天截止' }
  }

  // ── 明天 ──
  if (diffDays === 1) {
    return { status: 'soon', label: timePart ? `📅 明天 ${timePart}` : '📅 明天' }
  }

  // ── 3天内 ──
  if (diffDays <= 3) {
    return { status: 'soon', label: timePart
      ? `⚡ ${formatMonthDay(datePart)} ${timePart}（剩${diffDays}天）`
      : `⚡ 还剩 ${diffDays} 天`
    }
  }

  // ── 正常 ──
  return { status: 'normal', label: timePart
    ? `📅 ${formatMonthDay(datePart)} ${timePart}`
    : `📅 ${formatMonthDay(datePart)}`
  }
}

/**
 * 获取任务卡片的状态样式类名
 * @param {object} task
 * @returns {string}
 */
export function getTaskCardStatusClass(task) {
  if (task.completed) return 'completed'
  if (!task.deadline) return ''
  const { status } = getDeadlineStatus(task.deadline)
  if (status === 'overdue') return 'overdue'
  if (status === 'today') return 'due-today'
  if (status === 'soon') return 'due-soon'
  return ''
}

/**
 * 判断两个日期是否同一天
 */
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

/**
 * 获取今天的 "MM-DD" 字符串
 */
export function getTodayDateStr() {
  const d = new Date()
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 获取明天的 "MM-DD" 字符串
 */
export function getTomorrowDateStr() {
  const d = new Date(Date.now() + 86400000)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 数字补零
 */
export function pad(n) {
  return String(n).padStart(2, '0')
}

// ─── 筛选 / 排序 ───

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
        const aDate = resolveDeadline(a.deadline)
        const bDate = resolveDeadline(b.deadline)
        return aDate.getTime() - bDate.getTime()
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
