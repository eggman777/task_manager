// 🎓 学习任务管理器 - 主控制器

import { getAllTasks, createTask, updateTask, toggleTask, deleteTask } from './core/taskManager.js'
import { saveTasks } from './core/storage.js'
import { searchTasks, sortTasks, isMobile } from './core/utils.js'
import { createTaskForm } from './components/TaskForm.js'
import { createTaskList } from './components/TaskList.js'
import { createFilterBar } from './components/FilterBar.js'
import { createStatsBar } from './components/StatsBar.js'
import { createConfirmDialog } from './components/ConfirmDialog.js'
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
    this.colorPickerOpen = false
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
    // 切后台 / 关标签页时保存
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
      if (!e.target.closest('input, textarea')) {
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
  }

  setAccent(hex, animate = true) {
    this.accent = hex
    applyAccent(hex, this.theme)
    saveAccent(hex)
    this.colorPickerOpen = false
    this.render()
    if (animate) {
      requestAnimationFrame(() => {
        const dot = document.querySelector('.color-dot')
        if (dot) {
          dot.classList.add('animating')
          dot.addEventListener('animationend', () => dot.classList.remove('animating'), { once: true })
        }
      })
    }
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
    const presetName = PRESETS.find(p => p.hex.toLowerCase() === this.accent.toLowerCase())?.name || '自定'
    const mobile = isMobile()

    appEl.innerHTML = `
      <header class="app-header">
        <div class="header-tools">
          ${mobile ? '' : '<button class="btn btn-primary btn-sm" data-action="new-task">📝 新建</button>'}
          <button class="theme-toggle" data-action="theme" title="切换深色模式">
            <span class="theme-icon">${this.theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button class="color-toggle" data-action="color" title="主题色 · ${presetName}">
            <span class="color-dot" style="background:${this.accent}"></span>
          </button>
        </div>
        <h1 class="app-title">🎓 学习任务管理器</h1>
        <p class="app-subtitle">轻松管理你的学习计划 ✨</p>
      </header>

      <main class="app-main">
        <div data-region="stats"></div>
        ${this.filter === 'completed' ? `
        <div class="batch-bar">
          <label class="batch-select-all"><input type="checkbox" class="batch-checkbox" data-action="select-all" ${this.selectMode && this.selectedIds.size === displayTasks.length && displayTasks.length > 0 ? 'checked' : ''} /> 全选</label>
          <span class="batch-count">
            ${this.selectMode ? `已选 ${this.selectedIds.size}/${displayTasks.length}` : '多选模式'}
          </span>
          ${this.selectMode ? '<button class="btn btn-danger btn-sm batch-delete-btn">🗑️ 删除已选</button>' : ''}
          <button class="btn btn-ghost btn-sm batch-mode-btn">${this.selectMode ? '退出多选' : '☑ 批量操作'}</button>
        </div>` : ''}
        <div data-region="filter-bar"></div>
        <div data-region="task-list"></div>
      </main>

      <div class="color-picker-panel" id="color-panel" style="display:${this.colorPickerOpen ? 'block' : 'none'}">
        <div class="color-picker-header"><span>🎨 主题色</span><button class="form-modal-close" data-action="close-color">&times;</button></div>
        <div class="color-presets">
          ${PRESETS.map(p => `<button class="color-swatch ${p.hex.toLowerCase() === this.accent.toLowerCase() ? 'active' : ''}" data-color="${p.hex}" title="${p.name}"><span class="swatch-fill" style="background:${p.hex}"></span><span class="swatch-name">${p.name}</span></button>`).join('')}
        </div>
        <div class="color-custom"><label class="color-custom-label">自定义</label><input type="color" class="color-picker-input" id="custom-color" value="${this.accent}" /></div>
      </div>
    `

    // 事件绑定（部分元素移动端不存在，用 ?. 安全取）
    appEl.querySelector('[data-action="new-task"]')?.addEventListener('click', () => this.openNewTaskForm(null))
    appEl.querySelector('[data-action="theme"]')?.addEventListener('click', () => { this.toggleTheme(); this.render() })
    appEl.querySelector('[data-action="color"]')?.addEventListener('click', () => { this.colorPickerOpen = !this.colorPickerOpen; this.render() })
    appEl.querySelector('[data-action="close-color"]')?.addEventListener('click', () => { this.colorPickerOpen = false; this.render() })
    appEl.querySelectorAll('.color-swatch').forEach(btn => btn.addEventListener('click', () => this.setAccent(btn.dataset.color)))
    const colorInput = appEl.querySelector('#custom-color')
    if (colorInput) colorInput.addEventListener('input', e => { applyAccent(e.target.value, this.theme); saveAccent(e.target.value); this.accent = e.target.value })

    // 批量操作
    appEl.querySelector('[data-action="select-all"]')?.addEventListener('change', e => {
      if (e.target.checked) { displayTasks.forEach(t => this.selectedIds.add(t.id)) }
      else { this.selectedIds.clear() }
      this.render()
    })
    appEl.querySelector('.batch-mode-btn')?.addEventListener('click', () => {
      this.selectMode = !this.selectMode
      if (!this.selectMode) this.selectedIds.clear()
      this.render()
    })
    appEl.querySelector('.batch-delete-btn')?.addEventListener('click', () => {
      if (this.selectedIds.size === 0) return
      const deleted = this.tasks.filter(t => this.selectedIds.has(t.id))
      const ids = [...this.selectedIds]
      ids.forEach(id => deleteTask(id))
      const count = ids.length
      this.selectedIds.clear()
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
        onSearchChange: q => { this.searchQuery = q; this.render() }
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

    // 卡片离开动画后重新渲染
    const card = document.querySelector(`.task-card[data-id="${id}"]`)
    if (card) {
      card.classList.add('task-leaving')
      setTimeout(() => this.render(), 260)
    } else {
      this.render()
    }
  }

  handleDelete(task) {
    const mobile = isMobile()
    if (mobile) {
      this.undoStack = { ...task }
      deleteTask(task.id)
      this.tasks = getAllTasks()
      this.render()
      if (navigator.vibrate) navigator.vibrate(10)
      showToast('任务已删除', {
        actionLabel: '撤销',
        onAction: () => { if (this.undoStack) { createTask(this.undoStack); this.tasks = getAllTasks(); this.render(); this.undoStack = null } }
      })
    } else {
      const dialog = createConfirmDialog({
        title: '确认删除', message: `确定要删除「${task.title}」吗？`,
        onConfirm: () => { deleteTask(task.id); this.tasks = getAllTasks(); this.render() },
        onCancel: () => {}
      })
      document.body.appendChild(dialog)
    }
  }
}

const app = new App()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init())
} else {
  app.init()
}

export default app
