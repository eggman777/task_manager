// 📝 任务表单组件
// 新建 / 编辑任务

import { getTodayDateStr, getTomorrowDateStr, pad } from '../core/utils.js'

/**
 * 创建任务表单
 * @param {object} options
 * @param {object|null} options.task - 编辑模式传已有任务；新建时为 null
 * @param {Function} options.onSubmit - 提交回调
 * @param {Function} options.onCancel - 取消回调
 * @returns {HTMLElement}
 */
export function createTaskForm({ task, onSubmit, onCancel }) {
  const isEdit = !!task

  // 解析已有 deadline（编辑模式）
  const parsed = parseDeadlineForForm(isEdit ? task.deadline : null)

  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'

  overlay.innerHTML = `
    <div class="modal-content">
      <div class="form-modal-header">
        <h2 class="form-modal-title">${isEdit ? '✏️ 编辑任务' : '📝 新建任务'}</h2>
        <button class="form-modal-close" data-action="close">&times;</button>
      </div>
      <form class="task-form" data-action="form">
        <div class="form-row">
          <label class="form-label" for="task-title">任务标题 *</label>
          <input
            class="form-input"
            type="text"
            id="task-title"
            name="title"
            placeholder="输入任务标题..."
            maxlength="100"
            value="${isEdit ? escapeHtml(task.title) : ''}"
            required
            autofocus
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="task-description">任务描述</label>
          <textarea
            class="form-input form-textarea"
            id="task-description"
            name="description"
            placeholder="添加详细描述（选填）..."
            maxlength="500"
          >${isEdit ? escapeHtml(task.description || '') : ''}</textarea>
        </div>

        <div class="form-row">
          <label class="form-label">📅 截止时间</label>

          <div class="deadline-quick-btns">
            <button type="button" class="quick-btn ${parsed.mode === 'today' ? 'active' : ''}" data-mode="today">今天</button>
            <button type="button" class="quick-btn ${parsed.mode === 'tomorrow' ? 'active' : ''}" data-mode="tomorrow">明天</button>
            <button type="button" class="quick-btn ${parsed.mode === 'custom' ? 'active' : ''}" data-mode="custom">自选</button>
            ${isEdit && parsed.mode !== 'none' ? `<button type="button" class="quick-btn quick-btn-clear" data-mode="clear">✕ 清除</button>` : ''}
          </div>

          <div class="deadline-custom" id="dl-custom" style="display:${parsed.mode === 'custom' ? 'flex' : 'none'}">
            <select class="dl-select" id="dl-month">
              <option value="">月</option>
              ${Array.from({ length: 12 }, (_, i) => {
                const v = pad(i + 1)
                return `<option value="${v}" ${parsed.month === v ? 'selected' : ''}>${i + 1}月</option>`
              }).join('')}
            </select>
            <select class="dl-select" id="dl-day">
              <option value="">日</option>
              ${Array.from({ length: 31 }, (_, i) => {
                const v = pad(i + 1)
                return `<option value="${v}" ${parsed.day === v ? 'selected' : ''}>${i + 1}日</option>`
              }).join('')}
            </select>
          </div>

          <div class="deadline-time">
            <span class="time-label">⏰</span>
            <input type="time" class="dl-time-input" id="dl-time" value="${parsed.time || ''}" />
            <span class="time-hint">（选填）</span>
          </div>

          <input type="hidden" name="deadline" id="dl-value" value="${parsed.mode !== 'none' ? parsed.combined : ''}" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">${isEdit ? '保存修改' : '创建任务'}</button>
        </div>
      </form>
    </div>
  `

  // ─── DOM 引用 ───
  const form = overlay.querySelector('[data-action="form"]')
  const monthSelect = overlay.querySelector('#dl-month')
  const daySelect = overlay.querySelector('#dl-day')
  const timeInput = overlay.querySelector('#dl-time')
  const hiddenDeadline = overlay.querySelector('#dl-value')
  const customPicker = overlay.querySelector('#dl-custom')
  const quickBtns = overlay.querySelectorAll('.quick-btn[data-mode]')

  // ─── 更新隐藏 deadline 值 ───
  function updateDeadline() {
    const activeBtn = overlay.querySelector('.quick-btn.active')
    const mode = activeBtn?.dataset.mode

    if (mode === 'today') {
      const v = getTodayDateStr()
      hiddenDeadline.value = timeInput.value ? `${v} ${timeInput.value}` : v
    } else if (mode === 'today-time') {
      // only time mode (not today/tomorrow/custom, just time)
      const v = getTodayDateStr()
      hiddenDeadline.value = timeInput.value ? `${v} ${timeInput.value}` : ''
    } else if (mode === 'tomorrow') {
      const v = getTomorrowDateStr()
      hiddenDeadline.value = timeInput.value ? `${v} ${timeInput.value}` : v
    } else if (mode === 'custom') {
      const m = monthSelect.value
      const d = daySelect.value
      if (m && d) {
        const v = timeInput.value ? `${m}-${d} ${timeInput.value}` : `${m}-${d}`
        hiddenDeadline.value = v
      } else {
        hiddenDeadline.value = timeInput.value ? `${getTodayDateStr()} ${timeInput.value}` : ''
      }
    } else {
      // not active or 'clear'
      hiddenDeadline.value = ''
    }
  }

  // ─── 快捷按钮 ───
  function setQuickMode(mode) {
    quickBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode)
    })
    customPicker.style.display = mode === 'custom' ? 'flex' : 'none'
    updateDeadline()
  }

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode
      if (mode === 'clear') {
        // 清除截止日期
        quickBtns.forEach(b => b.classList.remove('active'))
        customPicker.style.display = 'none'
        hiddenDeadline.value = ''
      } else {
        setQuickMode(mode)
      }
    })
  })

  // ─── 自选月份/日期变更 ───
  monthSelect.addEventListener('change', updateDeadline)
  daySelect.addEventListener('change', updateDeadline)
  timeInput.addEventListener('change', updateDeadline)
  timeInput.addEventListener('input', updateDeadline)

  // ─── 提交 ───
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const title = formData.get('title').trim()
    if (!title) return

    onSubmit({
      title,
      description: formData.get('description')?.trim() || '',
      deadline: hiddenDeadline.value || null
    })
    overlay.remove()
  })

  // ─── 关闭 ───
  overlay.querySelector('[data-action="close"]').addEventListener('click', () => {
    overlay.remove()
    onCancel?.()
  })
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    overlay.remove()
    onCancel?.()
  })
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove()
      onCancel?.()
    }
  })

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove()
      document.removeEventListener('keydown', escHandler)
      onCancel?.()
    }
  }
  document.addEventListener('keydown', escHandler)

  return overlay
}

// ─── 解析 deadline 供表单回填 ───

function parseDeadlineForForm(deadline) {
  const result = { mode: 'none', month: '', day: '', time: '', combined: '' }

  if (!deadline) return result

  const parts = deadline.split(' ')
  const datePart = parts[0] // "MM-DD"
  const timePart = parts[1] // "HH:mm" 或 undefined
  const [m, d] = datePart.split('-')

  result.month = m
  result.day = d
  result.time = timePart || ''
  result.combined = deadline

  // 判断是今天还是明天
  if (datePart === getTodayDateStr()) {
    result.mode = 'today'
  } else if (datePart === getTomorrowDateStr()) {
    result.mode = 'tomorrow'
  } else {
    result.mode = 'custom'
  }

  return result
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
