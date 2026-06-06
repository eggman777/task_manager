// 🍞 Toast 通知组件
// 用于撤销删除等临时提示

/**
 * 弹出 Toast
 * @param {string} message
 * @param {object} [options]
 * @param {string} [options.actionLabel] - 操作按钮文字，如"撤销"
 * @param {Function} [options.onAction] - 点击操作按钮的回调
 * @param {number} [options.duration] - 自动消失时间(ms)，默认 3000
 */
export function showToast(message, { actionLabel, onAction, duration = 3000 } = {}) {
  // 确保容器存在
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  toast.className = 'toast'

  toast.innerHTML = `
    <span>${message}</span>
    ${actionLabel ? `<button class="toast-action">${actionLabel}</button>` : ''}
  `

  if (actionLabel && onAction) {
    toast.querySelector('.toast-action').addEventListener('click', () => {
      onAction()
      dismiss(toast)
    })
  }

  container.appendChild(toast)

  // 自动消失
  const timer = setTimeout(() => dismiss(toast), duration)

  function dismiss(el) {
    clearTimeout(timer)
    if (!el.parentNode) return
    el.classList.add('leaving')
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }
}
