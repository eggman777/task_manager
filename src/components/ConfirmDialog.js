// 🗑️ 确认对话框组件
// 删除任务前弹出确认，防止误操作

/**
 * 创建确认对话框
 * @param {object} options
 * @param {string} options.title - 标题
 * @param {string} options.message - 提示信息
 * @param {Function} options.onConfirm - 确认回调
 * @param {Function} options.onCancel - 取消回调
 * @returns {HTMLElement} 对话框 DOM 元素
 */
export function createConfirmDialog({ title, message, onConfirm, onCancel }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'

  overlay.innerHTML = `
    <div class="modal-content confirm-dialog">
      <div class="confirm-dialog-icon">⚠️</div>
      <h3 class="confirm-dialog-title">${title}</h3>
      <p class="confirm-dialog-message">${message}</p>
      <div class="confirm-dialog-actions">
        <button class="confirm-btn-cancel" data-action="cancel">取消</button>
        <button class="confirm-btn-delete" data-action="confirm">确定删除</button>
      </div>
    </div>
  `

  overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    overlay.remove()
    onCancel?.()
  })

  overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    overlay.remove()
    onConfirm?.()
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
