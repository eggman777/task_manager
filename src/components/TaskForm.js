// 📝 任务表单组件
// 新建任务的内联表单

/**
 * 创建任务表单
 * @param {object} options
 * @param {object|null} options.task - 编辑模式时传入已有任务；新建时为 null
 * @param {Function} options.onSubmit - 提交回调，接收 FormData
 * @param {Function} options.onCancel - 取消回调
 * @returns {HTMLElement} 表单 DOM 元素
 */
export function createTaskForm({ task, onSubmit, onCancel }) {
  const isEdit = !!task
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
          <label class="form-label" for="task-deadline">截止日期</label>
          <input
            class="form-input"
            type="date"
            id="task-deadline"
            name="deadline"
            value="${isEdit && task.deadline ? task.deadline : ''}"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">取消</button>
          <button type="submit" class="btn btn-primary">${isEdit ? '保存修改' : '创建任务'}</button>
        </div>
      </form>
    </div>
  `

  const form = overlay.querySelector('[data-action="form"]')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const title = formData.get('title').trim()
    if (!title) return

    onSubmit({
      title,
      description: formData.get('description')?.trim() || '',
      deadline: formData.get('deadline') || null
    })
    overlay.remove()
  })

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

  // ESC 键关闭
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

/**
 * 简单的 HTML 转义，防止 XSS
 */
function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
