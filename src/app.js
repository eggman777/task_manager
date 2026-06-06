// 🎓 学习任务管理器 - 主控制器
// 协调所有组件和事件处理

import { getAllTasks, createTask, toggleTask, deleteTask } from './core/taskManager.js'
import { searchTasks, sortTasks } from './core/utils.js'
import { createTaskForm } from './components/TaskForm.js'
import { createTaskList } from './components/TaskList.js'
import { createFilterBar } from './components/FilterBar.js'
import { createConfirmDialog } from './components/ConfirmDialog.js'

class App {
  constructor() {
    this.tasks = []
    this.filter = 'all' // 'all' | 'active' | 'completed'
    this.isLoaded = false
  }

  init() {
    this.tasks = getAllTasks()
    this.isLoaded = true
    this.render()
  }

  getFilteredTasks() {
    let result = [...this.tasks]

    // 状态筛选
    if (this.filter === 'active') {
      result = result.filter(t => !t.completed)
    } else if (this.filter === 'completed') {
      result = result.filter(t => t.completed)
    }

    return result
  }

  render() {
    const appEl = document.querySelector('#app')
    if (!appEl) return

    const filteredTasks = this.getFilteredTasks()

    appEl.innerHTML = `
      <header class="app-header">
        <h1 class="app-title">🎓 学习任务管理器</h1>
        <p class="app-subtitle">轻松管理你的学习计划 ✨</p>
      </header>
      <main class="app-main">
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="btn btn-primary" data-action="new-task">📝 新建任务</button>
          </div>
        </div>
        <div data-region="filter-bar"></div>
        <div data-region="task-list"></div>
      </main>
    `

    // 绑定新建任务按钮
    appEl.querySelector('[data-action="new-task"]').addEventListener('click', () => {
      this.openNewTaskForm()
    })

    // 渲染筛选栏
    const filterRegion = appEl.querySelector('[data-region="filter-bar"]')
    if (filterRegion) {
      const filterBar = createFilterBar({
        currentFilter: this.filter,
        onFilterChange: (newFilter) => {
          this.filter = newFilter
          this.render()
        }
      })
      filterRegion.appendChild(filterBar)
    }

    // 渲染任务列表
    const listRegion = appEl.querySelector('[data-region="task-list"]')
    if (listRegion) {
      const taskList = createTaskList(filteredTasks, {
        onToggle: (id) => this.handleToggle(id),
        onDelete: (task) => this.handleDelete(task)
      })
      listRegion.appendChild(taskList)
    }
  }

  // =========== 事件处理 ===========

  openNewTaskForm() {
    const form = createTaskForm({
      task: null,
      onSubmit: (data) => this.handleCreate(data),
      onCancel: () => {}
    })
    document.body.appendChild(form)
  }

  handleCreate(data) {
    createTask(data)
    this.tasks = getAllTasks()
    this.render()
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
document.addEventListener('DOMContentLoaded', () => app.init())

export default app
