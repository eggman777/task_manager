// 📋 任务列表组件
// v0.9: 智能时间线分区 + SVG 空状态

import { createTaskItem } from './TaskItem.js'
import { createSwipeableTask } from './SwipeableTask.js'
import { isMobile, getDeadlineStatus } from '../core/utils.js'

/**
 * 将任务按时间线分三组：
 * - today：截止日期为今天 + 未完成
 * - upcoming：未完成且非 today
 * - archived：已完成
 */
function groupTasks(tasks) {
  const today = []
  const upcoming = []
  const archived = []

  for (const task of tasks) {
    if (task.completed) {
      archived.push(task)
      continue
    }
    const { status } = getDeadlineStatus(task.deadline)
    if (status === 'today') {
      today.push(task)
    } else {
      upcoming.push(task)
    }
  }

  return { today, upcoming, archived }
}

const GROUP_LABELS = {
  today: '📅 今天',
  upcoming: '⏳ 即将到来',
  archived: '📦 已归档'
}

/**
 * 创建粘性分区标题
 */
function createGroupHeader(key, count) {
  const header = document.createElement('div')
  header.className = 'task-group-header'
  header.textContent = `${GROUP_LABELS[key]}（${count}项）`
  return header
}

/**
 * 渲染一个分组（标题 + 任务卡片列表）
 */
function renderGroup(key, tasks, handlers, mobile) {
  const group = document.createElement('div')
  group.className = 'task-group'

  group.appendChild(createGroupHeader(key, tasks.length))

  tasks.forEach(task => {
    const card = createTaskItem(task, {
      onToggle: handlers.onToggle,
      onDelete: handlers.onDelete,
      onEdit: handlers.onEdit,
      onSelect: handlers.onSelect,
      isSelectMode: !!handlers.isSelectMode,
      isSelected: handlers.selectedIds ? handlers.selectedIds.has(task.id) : false
    })

    if (mobile && !handlers.isSelectMode) {
      group.appendChild(createSwipeableTask(task, {
        onToggle: handlers.onToggle,
        onDelete: handlers.onDelete,
        onEdit: handlers.onEdit
      }, card))
    } else {
      group.appendChild(card)
    }
  })

  return group
}

/**
 * @param {object[]} tasks
 * @param {object} handlers
 * @param {string} [handlers.emptyFilter] - 当前筛选状态，用于空状态提示
 */
export function createTaskList(tasks, {
  onToggle, onDelete, onEdit, isSelectMode, selectedIds, onSelect, emptyFilter
}) {
  const container = document.createElement('div')
  container.className = 'task-list-container'

  // ── 空状态：SVG 插画 ──
  if (!tasks || tasks.length === 0) {
    const msg = emptyFilter === 'active'
      ? '没有进行中的任务 ✅'
      : emptyFilter === 'completed'
        ? '还没有完成的任务 📝'
        : '点击「新建」开始吧！🚀'
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-svg" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 左页 -->
          <rect x="12" y="6" width="44" height="70" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <line x1="20" y1="16" x2="48" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="20" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="20" y1="32" x2="46" y2="32" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="20" y1="40" x2="40" y2="40" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <!-- 右页 -->
          <rect x="56" y="2" width="50" height="74" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <line x1="64" y1="14" x2="98" y2="14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="64" y1="22" x2="94" y2="22" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="64" y1="30" x2="96" y2="30" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="64" y1="38" x2="90" y2="38" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="64" y1="46" x2="92" y2="46" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <!-- 书脊 -->
          <line x1="58" y1="6" x2="58" y2="76" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <!-- 封面折痕 -->
          <path d="M12 6 Q14 3 16 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M56 2 Q58 -1 60 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <h2 class="empty-state-title">${msg}</h2>
      </div>
    `
    return container
  }

  // ── 按时间线分组渲染 ──
  const groups = groupTasks(tasks)
  const mobile = isMobile()

  const handlers = { onToggle, onDelete, onEdit, onSelect, isSelectMode, selectedIds }
  const order = ['today', 'upcoming', 'archived']

  order.forEach(key => {
    if (groups[key].length > 0) {
      container.appendChild(renderGroup(key, groups[key], handlers, mobile))
    }
  })

  return container
}
