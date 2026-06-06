// 🔍 筛选栏组件
// 状态筛选（全部/进行中/已完成）

/**
 * 创建筛选栏
 * @param {object} options
 * @param {string} options.currentFilter - 当前筛选 "all" | "active" | "completed"
 * @param {Function} options.onFilterChange - 筛选变更回调
 * @returns {HTMLElement} 筛选栏 DOM 元素
 */
export function createFilterBar({ currentFilter, onFilterChange }) {
  const filters = [
    { key: 'all', label: '📋 全部' },
    { key: 'active', label: '🔄 进行中' },
    { key: 'completed', label: '✅ 已完成' }
  ]

  const bar = document.createElement('div')
  bar.className = 'filter-bar'

  filters.forEach(f => {
    const btn = document.createElement('button')
    btn.className = 'filter-btn'
    if (f.key === currentFilter) {
      btn.classList.add('active')
    }
    btn.textContent = f.label
    btn.addEventListener('click', () => onFilterChange(f.key))
    bar.appendChild(btn)
  })

  return bar
}
