// 🎓 学习任务管理器 - 主控制器

import { getAllTasks, createTask, updateTask, toggleTask, deleteTask } from './core/taskManager.js'
import { searchTasks, sortTasks } from './core/utils.js'
import { createTaskForm } from './components/TaskForm.js'
import { createTaskList } from './components/TaskList.js'
import { createFilterBar } from './components/FilterBar.js'
import { createStatsBar } from './components/StatsBar.js'
import { createConfirmDialog } from './components/ConfirmDialog.js'

class App {
  constructor() {
    this.tasks = []
    this.filter = 'all'
    this.searchQuery = ''
    this.sortBy = 'deadline'
    this.theme = 'light'
  }

  init() {
    this.initTheme()
    this.tasks = getAllTasks()
    this.render()
  }

  initTheme() {
    // 从 localStorage 读取用户偏好
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      this.theme = saved
    } else {
      // 没有保存 → 跟随系统
      this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', this.theme)
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', this.theme)
    localStorage.setItem('theme', this.theme)
  }

  getFilteredSortedTasks() {
    let result = [...this.tasks]

    // 状态筛选
    if (this.filter === 'active') result = result.filter(t => !t.completed)
    else if (this.filter === 'completed') result = result.filter(t => t.completed)

    // 搜索
    result = searchTasks(result, this.searchQuery)

    // 排序
    result = sortTasks(result, this.sortBy)

    // 已完成排最后
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

    appEl.innerHTML = `
      <header class="app-header">
        <h1 class="app-title">🎓 学习任务管理器</h1>
        <p class="app-subtitle">轻松管理你的学习计划 ✨</p>
        <button class="theme-toggle" data-action="theme" title="切换深色模式">
          <span class="theme-icon">${this.theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
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
    `

    // 新建任务
    appEl.querySelector('[data-action="new-task"]').addEventListener('click', () => this.openNewTaskForm(null))

    // 主题切换
    const themeBtn = appEl.querySelector('[data-action="theme"]')
    if (themeBtn) themeBtn.addEventListener('click', () => { this.toggleTheme(); this.render() })

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

  handleCreate(data) {
    createTask(data)
    this.tasks = getAllTasks()
    this.render()
  }

  handleUpdate(id, data) {
    updateTask(id, data)
    this.tasks = getAllTasks()
    this.render()
  }

  handleEdit(task) {
    this.openNewTaskForm(task)
  }

  handleToggle(id) {
    toggleTask(id)
    this.tasks = getAllTasks()
    this.render()
  }

  handleDelete(task) {
    const dialog = createConfirmDialog({
      title: '确认删除',
      message: `确定要删除「${task.title}」吗？此操作不可撤销。`,
      onConfirm: () => {
        deleteTask(task.id)
        this.tasks = getAllTasks()
        this.render()
      },
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
