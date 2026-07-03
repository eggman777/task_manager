// 📝 任务表单组件
// 新建 / 编辑任务（移动端用 Bottom Sheet）

import { getTodayDateStr, getTomorrowDateStr, pad, isMobile } from '../core/utils.js'

const PRESET_TAGS = ['🏫 课堂', '💻 编程', '📚 阅读', '📝 作业', '📖 复习']

export function createTaskForm({ task, onSubmit, onCancel }) {
  const isEdit = !!task
  const mobile = isMobile()
  const parsed = parseDeadlineForForm(isEdit ? task.deadline : null)
  const initialTags = isEdit ? [...(task.tags || [])] : []
  const tagLabel = t => t.replace(/^[^\s]+\s/, '')

  // ─── Mobile: Bottom Sheet ───
  if (mobile) {
    return createBottomSheet({ task, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel })
  }

  // ─── Desktop: Modal ───
  return createModal({ task, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Desktop Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createModal({ task, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = buildFormHTML({ isEdit, task, parsed, initialTags, tagLabel })
  wireFormLogic({ overlay, task, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel })
  return overlay
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mobile Bottom Sheet
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createBottomSheet({ task, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel }) {
  const overlay = document.createElement('div')
  overlay.className = 'bottom-sheet-overlay'

  overlay.innerHTML = `
    <div class="bottom-sheet">
      <div class="sheet-handle"></div>
      ${buildFormHTML({ isEdit, task, parsed, initialTags, tagLabel })}
    </div>
  `

  const sheet = overlay.querySelector('.bottom-sheet')

  // 下滑关闭
  let startY = 0, dragging = false
  sheet.addEventListener('touchstart', e => {
    if (sheet.scrollTop > 0) return // 只在顶部才响应下滑
    startY = e.touches[0].clientY
    dragging = true
    sheet.classList.add('dragging')
  }, { passive: true })

  sheet.addEventListener('touchmove', e => {
    if (!dragging) return
    const dy = e.touches[0].clientY - startY
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`
  }, { passive: true })

  sheet.addEventListener('touchend', () => {
    if (!dragging) return
    dragging = false
    sheet.classList.remove('dragging')
    const currentY = parseFloat(sheet.style.transform.match(/[\d.]+/)?.[0] || 0)
    if (currentY > 100) { overlay.remove(); onCancel?.() }
    else sheet.style.transform = ''
  })

  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); onCancel?.() } })

  wireFormLogic({ overlay, task, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel, isBottomSheet: true })
  return overlay
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared Form HTML
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildFormHTML({ isEdit, task, parsed, initialTags, tagLabel }) {
  return `
    <div class="form-modal-header">
      <h2 class="form-modal-title">${isEdit ? '✏️ 编辑任务' : '📝 新建任务'}</h2>
      <button class="form-modal-close" data-action="close">&times;</button>
    </div>
    <form class="task-form" data-action="form">
      <div class="form-row">
        <label class="form-label" for="task-title">任务标题 *</label>
        <input class="form-input" type="text" id="task-title" name="title"
          placeholder="输入任务标题..." maxlength="100"
          value="${isEdit ? escHtml(task.title) : ''}" required autofocus />
      </div>
      <div class="form-row">
        <label class="form-label" for="task-description">任务描述</label>
        <textarea class="form-input form-textarea" id="task-description" name="description"
          placeholder="添加详细描述（选填）..." maxlength="500">${isEdit ? escHtml(task.description || '') : ''}</textarea>
      </div>
      <div class="form-row">
        <label class="form-label">🔴 优先级</label>
        <div class="priority-selector">
          <label class="priority-option ${(!isEdit || task.priority === 'high') ? 'selected' : ''}"><input type="radio" name="priority" value="high" ${(!isEdit || task.priority === 'high') ? 'checked' : ''} /><span class="priority-dot high"></span> 高优先</label>
          <label class="priority-option ${isEdit && task.priority === 'medium' ? 'selected' : ''}"><input type="radio" name="priority" value="medium" ${isEdit && task.priority === 'medium' ? 'checked' : ''} /><span class="priority-dot medium"></span> 中优先</label>
          <label class="priority-option ${isEdit && task.priority === 'low' ? 'selected' : ''}"><input type="radio" name="priority" value="low" ${isEdit && task.priority === 'low' ? 'checked' : ''} /><span class="priority-dot low"></span> 低优先</label>
        </div>
      </div>
      <div class="form-row">
        <label class="form-label">🏷️ 标签</label>
        <div class="tag-presets">
          ${PRESET_TAGS.map(t => {
            const label = tagLabel(t)
            const active = initialTags.some(ut => tagLabel(ut) === label)
            return `<button type="button" class="tag-preset-btn ${active ? 'active' : ''}" data-tag="${escHtml(label)}">${t}</button>`
          }).join('')}
        </div>
        <div class="tag-custom-row"><input class="form-input tag-custom-input" type="text" placeholder="输入自定义标签，按 Enter 添加" maxlength="20" /></div>
        <div class="tag-list" id="tag-list">${initialTags.map(t => `<span class="tag-chip">${escHtml(t)}<button type="button" class="tag-chip-remove" data-tag="${escHtml(t)}">&times;</button></span>`).join('')}</div>
        <input type="hidden" name="tags" id="tags-value" value="${escHtml(JSON.stringify(initialTags))}" />
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
          <select class="dl-select" id="dl-month"><option value="">月</option>${Array.from({length:12},(_,i)=>{const v=pad(i+1);return`<option value="${v}" ${parsed.month===v?'selected':''}>${i+1}月</option>`}).join('')}</select>
          <select class="dl-select" id="dl-day"><option value="">日</option>${Array.from({length:31},(_,i)=>{const v=pad(i+1);return`<option value="${v}" ${parsed.day===v?'selected':''}>${i+1}日</option>`}).join('')}</select>
        </div>
        <div class="deadline-time">
          <span class="time-label">⏰</span>
          <input type="time" class="dl-time-input" id="dl-time" value="${parsed.time||''}" />
          <span class="time-hint">（选填）</span>
        </div>
        <input type="hidden" name="deadline" id="dl-value" value="${parsed.mode!=='none'?parsed.combined:''}" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-action="cancel">取消</button>
        <button type="submit" class="btn btn-primary">${isEdit?'保存修改':'创建任务'}</button>
      </div>
    </form>
  `
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared Form Logic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function wireFormLogic({ overlay, isEdit, parsed, initialTags, tagLabel, onSubmit, onCancel, isBottomSheet }) {
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

  // 移动端：输入框聚焦时滚动到可视区域，避免被键盘遮挡
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('focus', () => {
      if ('ontouchstart' in window) {
        setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
      }
    })
  })

  priorityOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      priorityOptions.forEach(o => o.classList.remove('selected'))
      opt.classList.add('selected')
      opt.querySelector('input').checked = true
    })
  })

  const presetBtns = overlay.querySelectorAll('.tag-preset-btn')
  function getCurrentTags() { try { return JSON.parse(hiddenTags.value) } catch { return [] } }
  function setCurrentTags(tags) { hiddenTags.value = JSON.stringify(tags); renderTagChips(tags) }
  function renderTagChips(tags) {
    tagList.innerHTML = tags.map(t => `<span class="tag-chip">${escHtml(t)}<button type="button" class="tag-chip-remove" data-tag="${escHtml(t)}">&times;</button></span>`).join('')
    tagList.querySelectorAll('.tag-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.tag
        setCurrentTags(getCurrentTags().filter(x => x !== t))
        presetBtns.forEach(b => { if (b.dataset.tag === tagLabel(t)) b.classList.remove('active') })
      })
    })
  }
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.tag
      const cur = getCurrentTags()
      const idx = cur.findIndex(x => tagLabel(x) === label)
      if (idx > -1) { cur.splice(idx, 1); btn.classList.remove('active') }
      else { cur.push(PRESET_TAGS.find(pt => tagLabel(pt) === label) || label); btn.classList.add('active') }
      setCurrentTags(cur)
    })
  })
  customTagInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      const v = customTagInput.value.trim()
      if (v && !getCurrentTags().some(x => tagLabel(x) === v)) {
        const cur = getCurrentTags()
        cur.push(`🏷️ ${v}`)
        setCurrentTags(cur)
      }
      customTagInput.value = ''
    }
  })

  function updateDeadline() {
    const mode = overlay.querySelector('.quick-btn.active')?.dataset.mode
    if (mode === 'today') hiddenDeadline.value = getTodayDateStr() + (timeInput.value ? ' ' + timeInput.value : '')
    else if (mode === 'tomorrow') hiddenDeadline.value = getTomorrowDateStr() + (timeInput.value ? ' ' + timeInput.value : '')
    else if (mode === 'custom') { const m = monthSelect.value, d = daySelect.value; if (m && d) hiddenDeadline.value = timeInput.value ? `${m}-${d} ${timeInput.value}` : `${m}-${d}`; else hiddenDeadline.value = '' }
    else hiddenDeadline.value = ''
  }
  function setQuickMode(mode) { quickBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode)); customPicker.style.display = mode === 'custom' ? 'flex' : 'none'; updateDeadline() }
  quickBtns.forEach(b => b.addEventListener('click', () => { if (b.dataset.mode === 'clear') { quickBtns.forEach(x => x.classList.remove('active')); customPicker.style.display = 'none'; hiddenDeadline.value = '' } else setQuickMode(b.dataset.mode) }))
  monthSelect.addEventListener('change', updateDeadline)
  daySelect.addEventListener('change', updateDeadline)
  timeInput.addEventListener('change', updateDeadline)
  timeInput.addEventListener('input', updateDeadline)

  form.addEventListener('submit', e => {
    e.preventDefault()
    const fd = new FormData(form)
    const title = fd.get('title').trim()
    if (!title) return
    onSubmit({ title, description: fd.get('description')?.trim() || '', priority: fd.get('priority') || 'medium', tags: getCurrentTags(), deadline: hiddenDeadline.value || null })
    overlay.remove()
  })

  overlay.querySelector('[data-action="close"]').addEventListener('click', () => { overlay.remove(); onCancel?.() })
  overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => { overlay.remove(); onCancel?.() })
  if (!isBottomSheet) {
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); onCancel?.() } })
  }
  const esc = e => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); onCancel?.() } }
  document.addEventListener('keydown', esc)
}

function parseDeadlineForForm(deadline) {
  const r = { mode: 'none', month: '', day: '', time: '', combined: '' }
  if (!deadline) return r
  const [dp, tp] = deadline.split(' '); const [m, d] = dp.split('-')
  r.month = m; r.day = d; r.time = tp || ''; r.combined = deadline
  r.mode = dp === getTodayDateStr() ? 'today' : dp === getTomorrowDateStr() ? 'tomorrow' : 'custom'
  return r
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML }
