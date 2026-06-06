// 🔍 筛选栏组件
// 状态筛选 + 搜索 + 排序

/**
 * 创建筛选栏
 * @param {object} options
 * @param {string} options.currentFilter
 * @param {string} options.currentSort
 * @param {string} options.searchQuery
 * @param {Function} options.onFilterChange
 * @param {Function} options.onSortChange
 * @param {Function} options.onSearchChange
 * @returns {HTMLElement}
 */
export function createFilterBar({ currentFilter, currentSort, searchQuery, onFilterChange, onSortChange, onSearchChange }) {
  const filters = [
    { key: 'all', label: '📋 全部' },
    { key: 'active', label: '🔄 进行中' },
    { key: 'completed', label: '✅ 已完成' }
  ]

  const sorts = [
    { key: 'deadline', label: '截止日期' },
    { key: 'priority', label: '优先级' },
    { key: 'createdAt', label: '创建时间' }
  ]

  const bar = document.createElement('div')
  bar.className = 'toolbar'

  bar.innerHTML = `
    <div class="toolbar-left">
      <div class="filter-bar">
        ${filters.map(f =>
          `<button class="filter-btn ${f.key === currentFilter ? 'active' : ''}" data-filter="${f.key}">${f.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="toolbar-right">
      <input class="search-input" type="text" placeholder="🔍 搜索任务..." value="${escHtml(searchQuery)}" data-action="search" />
      <select class="sort-select" data-action="sort">
        ${sorts.map(s =>
          `<option value="${s.key}" ${s.key === currentSort ? 'selected' : ''}>排序：${s.label}</option>`
        ).join('')}
      </select>
    </div>
  `

  // 筛选按钮
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => onFilterChange(btn.dataset.filter))
  })

  // 搜索（带 debounce）
  const searchInput = bar.querySelector('[data-action="search"]')
  let searchTimer
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => onSearchChange(searchInput.value), 200)
  })

  // 排序
  bar.querySelector('[data-action="sort"]').addEventListener('change', (e) => {
    onSortChange(e.target.value)
  })

  return bar
}

function escHtml(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML
}
