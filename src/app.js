// 🎓 学习任务管理器 - 主控制器

import { getAllTasks, createTask, updateTask, toggleTask, deleteTask } from './core/taskManager.js'
import { searchTasks, sortTasks } from './core/utils.js'
import { createTaskForm } from './components/TaskForm.js'
import { createTaskList } from './components/TaskList.js'
import { createFilterBar } from './components/FilterBar.js'
import { createStatsBar } from './components/StatsBar.js'
import { createConfirmDialog } from './components/ConfirmDialog.js'
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
  }

  init() {
    this.initTheme()
    this.tasks = getAllTasks()
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

    // 主题色
    this.accent = loadAccent()
    applyAccent(this.accent, this.theme)
  }

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

    // 颜色切换后脉冲动画
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

    const currentPresetName = PRESETS.find(p => p.hex.toLowerCase() === this.accent.toLowerCase())?.name || '自定'

    appEl.innerHTML = `
      <header class="app-header">
        <div class="header-tools">
          <button class="theme-toggle" data-action="theme" title="切换深色模式">
            <span class="theme-icon">${this.theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button class="color-toggle" data-action="color" title="主题色 · ${currentPresetName}">
            <span class="color-dot" style="background:${this.accent}"></span>
          </button>
        </div>
        <h1 class="app-title">🎓 学习任务管理器</h1>
        <p class="app-subtitle">轻松管理你的学习计划 ✨</p>
      </header>

      <main class="app-main">
        <div data-region="stats"></div>
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="btn btn-primary" data-action="new-task">📝 新建任务</button>
          </div>
        </div>
        <div data-region="filter-bar"></div>
        <div data-region="task-list"></div>
      </main>

      <div class="color-picker-panel" id="color-panel" style="display:${this.colorPickerOpen ? 'block' : 'none'}">
        <div class="color-picker-header">
          <span>🎨 主题色</span>
          <button class="form-modal-close" data-action="close-color">&times;</button>
        </div>
        <div class="color-presets">
          ${PRESETS.map(p => `
            <button class="color-swatch ${p.hex.toLowerCase() === this.accent.toLowerCase() ? 'active' : ''}"
              data-color="${p.hex}" title="${p.name}">
              <span class="swatch-fill" style="background:${p.hex}"></span>
              <span class="swatch-name">${p.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="color-custom">
          <label class="color-custom-label">自定义</label>
          <input type="color" class="color-picker-input" id="custom-color" value="${this.accent}" />
        </div>
      </div>
    `

    // 新建任务
    appEl.querySelector('[data-action="new-task"]').addEventListener('click', () => this.openNewTaskForm(null))

    // 主题切换
    appEl.querySelector('[data-action="theme"]').addEventListener('click', () => { this.toggleTheme(); this.render() })

    // 颜色面板切换
    appEl.querySelector('[data-action="color"]').addEventListener('click', () => {
      this.colorPickerOpen = !this.colorPickerOpen
      this.render()
    })
    appEl.querySelector('[data-action="close-color"]')?.addEventListener('click', () => {
      this.colorPickerOpen = false
      this.render()
    })

    // 预设色块点击
    appEl.querySelectorAll('.color-swatch').forEach(btn => {
      btn.addEventListener('click', () => this.setAccent(btn.dataset.color))
    })

    // 自定义取色器
    const colorInput = appEl.querySelector('#custom-color')
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        applyAccent(e.target.value, this.theme)
        saveAccent(e.target.value)
        this.accent = e.target.value
      })
    }

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
        onFilterChange: f => { this.filter = f; this.render() },
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
        onEdit: task => this.handleEdit(task)
      }))
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

  handleToggle(id) { toggleTask(id); this.tasks = getAllTasks(); this.render() }

  handleDelete(task) {
    const dialog = createConfirmDialog({
      title: '确认删除',
      message: `确定要删除「${task.title}」吗？此操作不可撤销。`,
      onConfirm: () => { deleteTask(task.id); this.tasks = getAllTasks(); this.render() },
      onCancel: () => {}
    })
    document.body.appendChild(dialog)
  }
}

const app = new App()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init())
} else {
  app.init()
}

export default app
