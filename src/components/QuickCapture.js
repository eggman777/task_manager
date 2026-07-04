// ⚡ 内联快速捕获条
// 桌面端常驻，替代高频新建弹窗
// 收起态：药丸形提示条 → 展开态：轻量内联表单

import { getTodayDateStr, getTomorrowDateStr } from '../core/utils.js'

const PRIORITIES = [
  { key: 'high', dotClass: 'qc-dot-high' },
  { key: 'medium', dotClass: 'qc-dot-medium' },
  { key: 'low', dotClass: 'qc-dot-low' }
]

/**
 * 创建内联快速捕获条
 * @param {{ onSubmit: Function }} options
 * @returns {HTMLElement}
 */
export function createQuickCapture({ onSubmit }) {
  let expanded = false
  let selectedDeadline = null   // 'today' | 'tomorrow' | null
  let selectedPriority = 'medium'

  const wrapper = document.createElement('div')
  wrapper.className = 'quick-capture'

  // 收起态 DOM
  const collapsed = document.createElement('div')
  collapsed.className = 'qc-collapsed'
  collapsed.textContent = '写下新任务，按 Enter 创建...'

  // 展开态 DOM
  const expandedEl = document.createElement('form')
  expandedEl.className = 'qc-expanded'
  expandedEl.setAttribute('data-action', 'qc-form')
  expandedEl.style.display = 'none'

  function buildExpandedHTML() {
    const todayActive = selectedDeadline === 'today' ? ' active' : ''
    const tomorrowActive = selectedDeadline === 'tomorrow' ? ' active' : ''
    const priorityDots = PRIORITIES.map(p => {
      const active = selectedPriority === p.key ? ' active' : ''
      return `<span class="qc-dot ${p.dotClass}${active}" data-priority="${p.key}" data-action="qc-priority"></span>`
    }).join('')

    expandedEl.innerHTML = `
      <input class="qc-input" type="text" placeholder="任务标题..." maxlength="100" data-action="qc-input" autofocus />
      <div class="qc-actions">
        <button type="button" class="qc-quick-btn${todayActive}" data-deadline="today" data-action="qc-deadline">今天</button>
        <button type="button" class="qc-quick-btn${tomorrowActive}" data-deadline="tomorrow" data-action="qc-deadline">明天</button>
        <div class="qc-priority-dots">${priorityDots}</div>
        <button type="submit" class="btn btn-primary btn-sm">创建</button>
      </div>
    `
  }

  function collapse() {
    expanded = false
    expandedEl.style.display = 'none'
    collapsed.style.display = ''
    selectedDeadline = null
    selectedPriority = 'medium'
    // Remove document click listener
    document.removeEventListener('mousedown', handleOutsideClick)
  }

  function expand() {
    expanded = true
    collapsed.style.display = 'none'
    expandedEl.style.display = ''
    buildExpandedHTML()
    // Auto-focus input
    const input = expandedEl.querySelector('[data-action="qc-input"]')
    if (input) setTimeout(() => input.focus(), 50)
    // Bind internal event handlers
    bindExpandedHandlers()
    // Listen for outside clicks
    setTimeout(() => document.addEventListener('mousedown', handleOutsideClick), 0)
  }

  function handleOutsideClick(e) {
    if (!wrapper.contains(e.target)) {
      collapse()
    }
  }

  function bindExpandedHandlers() {
    // Deadline quick buttons
    expandedEl.querySelectorAll('[data-action="qc-deadline"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dl = btn.dataset.deadline
        // Toggle: click again to deselect
        selectedDeadline = selectedDeadline === dl ? null : dl
        buildExpandedHTML()
        bindExpandedHandlers()
        // Re-focus input
        const input = expandedEl.querySelector('[data-action="qc-input"]')
        if (input) input.focus()
      })
    })

    // Priority dots
    expandedEl.querySelectorAll('[data-action="qc-priority"]').forEach(dot => {
      dot.addEventListener('click', () => {
        selectedPriority = dot.dataset.priority
        buildExpandedHTML()
        bindExpandedHandlers()
        const input = expandedEl.querySelector('[data-action="qc-input"]')
        if (input) input.focus()
      })
    })

    // Form submit
    expandedEl.addEventListener('submit', e => {
      e.preventDefault()
      const input = expandedEl.querySelector('[data-action="qc-input"]')
      const title = input?.value.trim()
      if (!title) return

      let deadline = null
      if (selectedDeadline === 'today') {
        deadline = getTodayDateStr()
      } else if (selectedDeadline === 'tomorrow') {
        deadline = getTomorrowDateStr()
      }

      onSubmit({
        title,
        deadline,
        priority: selectedPriority,
        tags: []
      })

      // Reset and collapse
      collapse()
    })

    // Escape key to collapse
    const escHandler = e => {
      if (e.key === 'Escape') {
        collapse()
        document.removeEventListener('keydown', escHandler)
      }
    }
    document.addEventListener('keydown', escHandler)
  }

  // Click collapsed bar to expand
  collapsed.addEventListener('click', expand)

  wrapper.appendChild(collapsed)
  wrapper.appendChild(expandedEl)

  return wrapper
}
