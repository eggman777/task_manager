// ⚡ FAB 浮动按钮组件
// 新建任务的快捷入口

/**
 * 创建 FAB
 * @param {Function} onClick
 * @returns {HTMLElement}
 */
export function createFAB(onClick) {
  const fab = document.createElement('button')
  fab.className = 'fab'
  fab.setAttribute('aria-label', '新建任务')
  fab.innerHTML = '+'

  fab.addEventListener('click', () => {
    fab.classList.remove('ripple')
    // 触发 reflow 以重启动画
    void fab.offsetWidth
    fab.classList.add('ripple')
    onClick()
  })

  return fab
}
