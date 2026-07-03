// 🎓 学习任务管理器 - 主控制器

import { getAllTasks, createTask, updateTask, toggleTask, deleteTask } from './core/taskManager.js'
import { saveTasks, exportTasks, importTasks } from './core/storage.js'
import { searchTasks, sortTasks, isMobile } from './core/utils.js'
import { createTaskForm } from './components/TaskForm.js'
import { createTaskList } from './components/TaskList.js'
import { createFilterBar } from './components/FilterBar.js'
import { createStatsBar } from './components/StatsBar.js'
import { createFAB } from './components/FAB.js'
import { showToast } from './components/Toast.js'
import { PRESETS, applyAccent, saveAccent, loadAccent } from './core/theme.js'

class App {
  constructor() {
    this.tasks = []
    this.filter = 'all'
    this.searchQuery = ''
    this.sortBy = 'deadline'
    this.theme = 'light'
    this.accent = '#C2673D'
    this.menuOpen = false
    this.undoStack = null
    this.selectMode = false
    this.selectedIds = new Set()
  }

  init() {
    this.initTheme()
    this.tasks = getAllTasks()
    this.setupDataGuard()
    this.setupInstallPrompt()
    this.setupPullToRefresh()
    this.setupKeyboardDismiss()
    this.render()
  }

  initTheme() {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      this.theme = saved
    } else {
      this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', this.theme)
    this.accent = loadAccent()
    applyAccent(this.accent, this.theme)
  }

  // ━━━ 数据双保险 ━━━
  setupDataGuard() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveTasks(this.tasks)
    })
    window.addEventListener('beforeunload', () => saveTasks(this.tasks))
  }

  // ━━━ PWA 安装引导 ━━━
  setupInstallPrompt() {
    let deferredPrompt = null
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      const dismissed = localStorage.getItem('installPromptDismissed')
      if (!dismissed || Date.now() - parseInt(dismissed) > 86400000 * 7) {
        this.showInstallBanner(deferredPrompt)
      }
    })
  }

  // ━━━ 下拉刷新 ━━━
  setupPullToRefresh() {
    const el = document.querySelector('#app')
    if (!el || !isMobile()) return
    let startY = 0
    let pulling = false
    let indicator = null
    el.addEventListener('touchstart', e => { startY = e.touches[0].clientY; pulling = true }, { passive: true })
    el.addEventListener('touchmove', e => {
      if (!pulling || el.scrollTop > 0) return
      const dy = e.touches[0].clientY - startY
      if (dy > 30 && dy < 120) {
        if (!indicator) { indicator = document.createElement('div'); indicator.className = 'ptr-indicator'; el.prepend(indicator) }
        const progress = Math.min((dy - 30) / 60, 1)
        indicator.textContent = progress >= 1 ? '🔄 松手刷新' : '⬇️ 下拉刷新'
        indicator.style.opacity = progress
        indicator.style.transform = `translateY(${-20 + progress * 10}px)`
      }
    }, { passive: true })
    el.addEventListener('touchend', () => {
      if (!pulling) return; pulling = false
      if (indicator && indicator.textContent === '🔄 松手刷新') {
        indicator.textContent = '🔄 刷新中...'
        this.tasks = getAllTasks(); this.render()
      } else if (indicator) { indicator.remove(); indicator = null }
    }, { passive: true })
  }

  // ━━━ 点击空白收起键盘 ━━━
  setupKeyboardDismiss() {
    document.addEventListener('click', e => {
      if (!e.target.closest('input, textarea, select')) {
        document.activeElement?.blur()
      }
    })
  }

  showInstallBanner(dp) {
    const banner = document.createElement('div')
    banner.className = 'install-prompt'
    banner.innerHTML = `
      <span class="install-prompt-text">📲 添加到主屏幕，像 App 一样使用</span>
      <button class="install-prompt-btn">安装</button>
      <button class="install-prompt-close">&times;</button>
    `
    banner.querySelector('.install-prompt-btn').addEventListener('click', () => {
      dp.prompt()
      dp.userChoice.then(() => banner.remove())
    })
    banner.querySelector('.install-prompt-close').addEventListener('click', () => {
      banner.remove()
      localStorage.setItem('installPromptDismissed', Date.now().toString())
    })
    document.body.appendChild(banner)
    setTimeout(() => { if (banner.parentNode) banner.remove() }, 10000)
  }

  // ━━━ 状态 ━━━
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', this.theme)
    localStorage.setItem('theme', this.theme)
    applyAccent(this.accent, this.theme)
    this.render()
  }

  setAccent(hex) {
    this.accent = hex
    applyAccent(hex, this.theme)
    saveAccent(hex)
    this.render()
  }

  getFilteredSortedTasks() {
    let result = [...this.tasks]
    if (this.filter === 'active') result = result.filter(t => !t.completed)
    else if (this.filter === 'completed') result = result.filter(t => t.completed)
    result = searchTasks(result, this.searchQuery)
    result = sortTasks(result, this.sortBy)
    result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return 0
    })
    return result
  }

  render() {
    const appEl = document.querySelector('#app')
    if (!appEl) return

    const displayTasks = this.getFilteredSortedTasks()
    const mobile = isMobile()

    // ───── 清除旧的菜单外点击监听 ─────
    if (this._closeHandler) {
      document.removeEventListener('click', this._closeHandler)
      this._closeHandler = null
    }

    appEl.innerHTML = `
      <header class="app-header">
        <div class="header-tools">
          ${mobile ? '' : '<button class="btn btn-primary btn-sm" data-action="new-task">📝 新建</button>'}
          <div class="header-menu-trigger">
            <button class="menu-toggle-btn" data-action="menu-toggle" title="设置">⚙️</button>
            <div class="header-dropdown" id="header-menu" style="display:${this.menuOpen ? 'block' : 'none'}">
              <div class="dropdown-item" data-action="theme">
                <span>${this.theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>${this.theme === 'dark' ? '浅色模式' : '深色模式'}</span>
              </div>
              <div class="dropdown-section">🎨 主题色</div>
              <div class="dropdown-colors">
                ${PRESETS.map(p => `
                  <button class="dd-color-swatch ${p.hex.toLowerCase() === this.accent.toLowerCase() ? 'active' : ''}" data-color="${p.hex}" title="${p.name}">
                    <span class="dd-swatch-fill" style="background:${p.hex}"></span>
                  </button>
                `).join('')}
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" data-action="export">📤 导出数据（JSON）</div>
              <div class="dropdown-item" data-action="import">📥 导入数据（JSON）</div>
            </div>
          </div>
        </div>
        <h1 class="app-title">🎓 学习任务管理器</h1>
        <p class="app-subtitle">轻松管理你的学习计划 ✨</p>
      </header>

      <main class="app-main">
        <div data-region="stats"></div>
        <div data-region="filter-bar"></div>
        <div data-region="task-list"></div>
      </main>

      ${this.selectMode ? `
      <div class="select-bottom-bar">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox" data-action="select-all-bottom" ${displayTasks.length > 0 && this.selectedIds.size === displayTasks.length ? 'checked' : ''} />
          全选
        </label>
        <span class="select-count">已选 ${this.selectedIds.size}/${displayTasks.length}</span>
        <button class="btn btn-danger btn-sm" data-action="delete-selected">🗑️ 删除</button>
        <button class="btn btn-ghost btn-sm" data-action="exit-select">✕ 退出</button>
      </div>` : ''}

      <button class="scroll-top-btn" id="scroll-top-btn" style="display:none" title="回顶部">⬆</button>
    `

    // ━━━ 事件绑定 ━━━
    appEl.querySelector('[data-action="new-task"]')?.addEventListener('click', () => this.openNewTaskForm(null))

    // 下拉菜单 — 切换
    appEl.querySelector('[data-action="menu-toggle"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.menuOpen = !this.menuOpen
      this.render()
    })

    // 下拉菜单 — 点击外部关闭
    if (this.menuOpen) {
      this._closeHandler = (e) => {
        if (!e.target.closest('.header-menu-trigger')) {
          this.menuOpen = false
          this.render()
        }
      }
      setTimeout(() => document.addEventListener('click', this._closeHandler), 0)
    }

    // 菜单项
    appEl.querySelector('[data-action="theme"]')?.addEventListener('click', () => { this.menuOpen = false; this.toggleTheme() })
    appEl.querySelectorAll('.dd-color-swatch').forEach(btn => {
      btn.addEventListener('click', () => { this.menuOpen = false; this.setAccent(btn.dataset.color) })
    })
    appEl.querySelector('[data-action="export"]')?.addEventListener('click', () => {
      this.menuOpen = false
      this.render()
      exportTasks(this.tasks)
    })
    appEl.querySelector('[data-action="import"]')?.addEventListener('click', () => {
      this.menuOpen = false
      this.render()
      importTasks().then(imported => {
        if (!imported) return
        const overwrite = confirm(`导入 ${imported.length} 个任务？\n「确定」覆盖现有数据\n「取消」合并追加`)
        if (overwrite) {
          this.tasks = imported
        } else {
          this.tasks.push(...imported)
        }
        saveTasks(this.tasks)
        this.tasks = getAllTasks()
        this.render()
        showToast(`已导入 ${imported.length} 个任务`)
      })
    })

    // 多选底部栏
    appEl.querySelector('[data-action="select-all-bottom"]')?.addEventListener('change', e => {
      if (e.target.checked) { displayTasks.forEach(t => this.selectedIds.add(t.id)) }
      else { this.selectedIds.clear() }
      this.render()
    })
    appEl.querySelector('[data-action="delete-selected"]')?.addEventListener('click', () => {
      if (this.selectedIds.size === 0) return
      const deleted = this.tasks.filter(t => this.selectedIds.has(t.id))
      const ids = [...this.selectedIds]
      ids.forEach(id => deleteTask(id))
      const count = ids.length
      this.selectedIds.clear()
      this.selectMode = false
      this.tasks = getAllTasks()
      this.render()
      showToast(`已删除 ${count} 个任务`, {
        actionLabel: '撤销',
        onAction: () => {
          deleted.forEach(t => createTask(t))
          this.tasks = getAllTasks()
          this.render()
        }
      })
    })
    appEl.querySelector('[data-action="exit-select"]')?.addEventListener('click', () => {
      this.selectMode = false
      this.selectedIds.clear()
      this.render()
    })

    // 统计栏
    const statsRegion = appEl.querySelector('[data-region="stats"]')
    if (statsRegion) statsRegion.appendChild(createStatsBar())

    // 筛选栏
    const filterRegion = appEl.querySelector('[data-region="filter-bar"]')
    if (filterRegion) {
      filterRegion.appendChild(createFilterBar({
        currentFilter: this.filter,
        currentSort: this.sortBy,
        searchQuery: this.searchQuery,
        onFilterChange: f => { this.filter = f; this.selectMode = false; this.selectedIds.clear(); this.render() },
        onSortChange: s => { this.sortBy = s; this.render() },
        onSearchChange: q => { this.searchQuery = q; this.render() },
        selectMode: this.selectMode,
        onToggleSelect: () => {
          this.selectMode = !this.selectMode
          if (!this.selectMode) this.selectedIds.clear()
          this.render()
        }
      }))
    }

    // 任务列表
    const listRegion = appEl.querySelector('[data-region="task-list"]')
    if (listRegion) {
      listRegion.appendChild(createTaskList(displayTasks, {
        onToggle: id => this.handleToggle(id),
        onDelete: task => this.handleDelete(task),
        onEdit: task => this.handleEdit(task),
        isSelectMode: this.selectMode,
        selectedIds: this.selectedIds,
        onSelect: id => {
          if (this.selectedIds.has(id)) this.selectedIds.delete(id)
          else this.selectedIds.add(id)
          this.render()
        },
        emptyFilter: this.filter
      }))
    }

    // FAB
    document.querySelectorAll('.fab').forEach(el => el.remove())
    if (mobile) {
      const fab = createFAB(() => this.openNewTaskForm(null))
      fab.id = 'app-fab'
      appEl.appendChild(fab)
    }

    // 滚动回顶
    this.setupScrollTop()
  }

  // ━━━ 滚动回顶 ━━━
  setupScrollTop() {
    const btn = document.querySelector('#scroll-top-btn')
    if (!btn) return
    const handleScroll = () => {
      btn.style.display = document.documentElement.scrollTop > 300 ? 'flex' : 'none'
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // ─── 事件处理 ───

  openNewTaskForm(task) {
    const form = createTaskForm({
      task,
      onSubmit: data => task ? this.handleUpdate(task.id, data) : this.handleCreate(data),
      onCancel: () => {}
    })
    document.body.appendChild(form)
  }

  handleCreate(data) { createTask(data); this.tasks = getAllTasks(); this.render() }
  handleUpdate(id, data) { updateTask(id, data); this.tasks = getAllTasks(); this.render() }
  handleEdit(task) { this.openNewTaskForm(task) }

  handleToggle(id) {
    toggleTask(id)
    if (isMobile() && navigator.vibrate) navigator.vibrate(8)
    this.tasks = getAllTasks()
    this.render()
  }

  handleDelete(task) {
    this.undoStack = { ...task }
    deleteTask(task.id)
    this.tasks = getAllTasks()
    this.render()
    if (navigator.vibrate) navigator.vibrate(10)
    showToast('任务已删除', {
      actionLabel: '撤销',
      onAction: () => {
        if (this.undoStack) {
          createTask(this.undoStack)
          this.tasks = getAllTasks()
          this.render()
          this.undoStack = null
        }
      }
    })
  }
}

const app = new App()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init())
} else {
  app.init()
}

export default app
