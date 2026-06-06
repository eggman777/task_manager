// 📝 任务表单组件
// 新建 / 编辑任务（支持优先级、标签）

import { getTodayDateStr, getTomorrowDateStr, pad } from '../core/utils.js'

const PRESET_TAGS = ['🏫 课堂', '💻 编程', '📚 阅读', '📝 作业', '📖 复习']

/**
 * 创建任务表单
 * @param {object} options
 * @param {object|null} options.task - 编辑模式传已有任务
 * @param {Function} options.onSubmit - 提交回调
 * @param {Function} options.onCancel - 取消回调
 * @returns {HTMLElement}
 */
export function createTaskForm({ task, onSubmit, onCancel }) {
  const isEdit = !!task

  // 解析已有 deadline
  const parsed = parseDeadlineForForm(isEdit ? task.deadline : null)

  // 编辑模式的标签
  const initialTags = isEdit ? [...(task.tags || [])] : []

  // 去掉预设标签前缀 "🏫 " 用于比较
  const tagLabel = t => t.replace(/^[^\s]+\s/, '')

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
            value="${isEdit ? escHtml(task.title) : ''}"
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
          >${isEdit ? escHtml(task.description || '') : ''}</textarea>
        </div>

        <!-- 优先级 -->
        <div class="form-row">
          <label class="form-label">🔴 优先级</label>
          <div class="priority-selector">
            <label class="priority-option ${(!isEdit || task.priority === 'high') ? 'selected' : ''}" data-priority="high">
              <input type="radio" name="priority" value="high" ${(!isEdit || task.priority === 'high') ? 'checked' : ''} />
              <span class="priority-dot high"></span> 高优先
            </label>
            <label class="priority-option ${isEdit && task.priority === 'medium' ? 'selected' : ''}" data-priority="medium">
              <input type="radio" name="priority" value="medium" ${isEdit && task.priority === 'medium' ? 'checked' : ''} />
              <span class="priority-dot medium"></span> 中优先
            </label>
            <label class="priority-option ${isEdit && task.priority === 'low' ? 'selected' : ''}" data-priority="low">
              <input type="radio" name="priority" value="low" ${isEdit && task.priority === 'low' ? 'checked' : ''} />
              <span class="priority-dot low"></span> 低优先
            </label>
          </div>
        </div>

        <!-- 标签 -->
        <div class="form-row">
          <label class="form-label">🏷️ 标签</label>
          <div class="tag-presets">
            ${PRESET_TAGS.map(t => {
              const label = tagLabel(t)
              const active = initialTags.some(ut => tagLabel(ut) === label)
              return `<button type="button" class="tag-preset-btn ${active ? 'active' : ''}" data-tag="${escHtml(label)}">${t}</button>`
            }).join('')}
          </div>
          <div class="tag-custom-row">
            <input class="form-input tag-custom-input" type="text" placeholder="输入自定义标签，按 Enter 添加" maxlength="20" />
          </div>
          <div class="tag-list" id="tag-list">
            ${initialTags.map(t => `<span class="tag-chip" data-tag="${escHtml(t)}">${escHtml(t)}<button type="button" class="tag-chip-remove" data-tag="${escHtml(t)}">&times;</button></span>`).join('')}
          </div>
          <input type="hidden" name="tags" id="tags-value" value="${escHtml(JSON.stringify(initialTags))}" />
        </div>

        <!-- 截止时间 -->
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

  // ─── DOM ───
  const form = overlay.querySelector('[data-action="form"]')
  const monthSelect = overlay.querySelector('#dl-month')
  const daySelect = overlay.querySelector('#dl-day')
  const timeInput = overlay.querySelector('#dl-time')
  const hiddenDeadline = overlay.querySelector('#dl-value')
  const customPicker = overlay.querySelector('#dl-custom')
  const quickBtns = overlay.querySelectorAll('.quick-btn[data-mode]')
  const tagList = overlay.querySelector('#tag-list')
  const hiddenTags = overlay.querySelector('#tags-value')
  const customTagInput = overlay.querySelector('.tag-custom-input')
  const priorityOptions = overlay.querySelectorAll('.priority-option')

  // ─── 优先级选择 ───
  priorityOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      priorityOptions.forEach(o => o.classList.remove('selected'))
      opt.classList.add('selected')
      opt.querySelector('input[type="radio"]').checked = true
    })
  })

  // ─── 标签：预设 ───
  const presetBtns = overlay.querySelectorAll('.tag-preset-btn')
  function getCurrentTags() {
    try {
      return JSON.parse(hiddenTags.value)
    } catch { return [] }
  }
  function setCurrentTags(tags) {
    hiddenTags.value = JSON.stringify(tags)
    renderTagChips(tags)
  }
  function renderTagChips(tags) {
    tagList.innerHTML = tags.map(t =>
      `<span class="tag-chip">${escHtml(t)}<button type="button" class="tag-chip-remove" data-tag="${escHtml(t)}">&times;</button></span>`
    ).join('')
    tagList.querySelectorAll('.tag-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag
        const current = getCurrentTags().filter(t => t !== tag)
        setCurrentTags(current)
        // 同步预设按钮状态
        presetBtns.forEach(b => {
          if (b.dataset.tag === tagLabel(tag)) b.classList.remove('active')
        })
      })
    })
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.tag
      const current = getCurrentTags()
      const idx = current.findIndex(t => tagLabel(t) === label)
      if (idx > -1) {
        current.splice(idx, 1)
        btn.classList.remove('active')
      } else {
        // 还原预设标签全名保存
        const fullName = PRESET_TAGS.find(pt => tagLabel(pt) === label) || label
        current.push(fullName)
        btn.classList.add('active')
      }
      setCurrentTags(current)
    })
  })

  // ─── 标签：自定义输入 ───
  customTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = customTagInput.value.trim()
      if (!val) return
      const current = getCurrentTags()
      if (!current.some(t => tagLabel(t) === val)) {
        current.push(`🏷️ ${val}`)
        setCurrentTags(current)
      }
      customTagInput.value = ''
    }
  })

  // ─── 截止日期 ───
  function updateDeadline() {
    const activeBtn = overlay.querySelector('.quick-btn.active')
    const mode = activeBtn?.dataset.mode
    if (mode === 'today') {
      const v = getTodayDateStr()
      hiddenDeadline.value = timeInput.value ? `${v} ${timeInput.value}` : v
    } else if (mode === 'tomorrow') {
      const v = getTomorrowDateStr()
      hiddenDeadline.value = timeInput.value ? `${v} ${timeInput.value}` : v
    } else if (mode === 'custom') {
      const m = monthSelect.value; const d = daySelect.value
      if (m && d) {
        hiddenDeadline.value = timeInput.value ? `${m}-${d} ${timeInput.value}` : `${m}-${d}`
      } else { hiddenDeadline.value = '' }
    } else {
      hiddenDeadline.value = ''
    }
  }

  function setQuickMode(mode) {
    quickBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode))
    customPicker.style.display = mode === 'custom' ? 'flex' : 'none'
    updateDeadline()
  }
  quickBtns.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.mode === 'clear') {
      quickBtns.forEach(x => x.classList.remove('active'))
      customPicker.style.display = 'none'; hiddenDeadline.value = ''
    } else { setQuickMode(b.dataset.mode) }
  }))
  monthSelect.addEventListener('change', updateDeadline)
  daySelect.addEventListener('change', updateDeadline)
  timeInput.addEventListener('change', updateDeadline)
  timeInput.addEventListener('input', updateDeadline)

  // ─── 提交 ───
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const title = fd.get('title').trim()
    if (!title) return

    onSubmit({
      title,
      description: fd.get('description')?.trim() || '',
      priority: fd.get('priority') || 'medium',
      tags: getCurrentTags(),
      deadline: hiddenDeadline.value || null
    })
    overlay.remove()
  })

  // ─── 关闭 ───
  overlay.querySelector('[data-action="close"]').addEventListener('click', () => { overlay.remove(); onCancel?.() })
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => { overlay.remove(); onCancel?.() })
  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); onCancel?.() } })
  const esc = e => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); onCancel?.() } }
  document.addEventListener('keydown', esc)

  return overlay
}

function parseDeadlineForForm(deadline) {
  const r = { mode: 'none', month: '', day: '', time: '', combined: '' }
  if (!deadline) return r
  const [dp, tp] = deadline.split(' '); const [m, d] = dp.split('-')
  r.month = m; r.day = d; r.time = tp || ''; r.combined = deadline
  r.mode = dp === getTodayDateStr() ? 'today' : dp === getTomorrowDateStr() ? 'tomorrow' : 'custom'
  return r
}

function escHtml(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML
}
