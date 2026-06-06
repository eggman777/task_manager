// 📋 任务管理
// 任务的 CRUD 操作（增删改查）

import { loadTasks, saveTasks } from './storage.js'
import { generateId, nowISO } from './utils.js'

/**
 * 获取所有任务
 * @returns {object[]}
 */
export function getAllTasks() {
  return loadTasks()
}

/**
 * 根据 ID 获取单个任务
 * @param {string} id
 * @returns {object|null}
 */
export function getTaskById(id) {
  const tasks = getAllTasks()
  return tasks.find(t => t.id === id) || null
}

/**
 * 创建新任务
 * @param {object} taskData
 * @param {string} taskData.title - 标题（必填）
 * @param {string} [taskData.description] - 描述
 * @param {string|null} [taskData.deadline] - 截止日期 "MM-DD" 或 "MM-DD HH:mm"
 * @param {string} [taskData.priority] - 优先级
 * @param {string[]} [taskData.tags] - 标签
 * @returns {object} 创建的任务对象
 */
export function createTask(taskData) {
  const tasks = getAllTasks()

  const newTask = {
    id: generateId(),
    title: taskData.title.trim(),
    description: (taskData.description || '').trim(),
    deadline: taskData.deadline || null,
    priority: taskData.priority || 'medium',
    tags: taskData.tags || [],
    completed: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  }

  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

/**
 * 更新任务
 * @param {string} id
 * @param {object} updates - 要更新的字段
 * @returns {object|null} 更新后的任务，未找到返回 null
 */
export function updateTask(id, updates) {
  const tasks = getAllTasks()
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return null

  // 不允许覆盖 id、createdAt
  const allowed = ['title', 'description', 'deadline', 'priority', 'tags', 'completed']
  for (const key of allowed) {
    if (key in updates) {
      tasks[index][key] = key === 'title' ? updates[key].trim() : updates[key]
    }
  }
  tasks[index].updatedAt = nowISO()

  saveTasks(tasks)
  return tasks[index]
}

/**
 * 切换任务完成状态
 * @param {string} id
 * @returns {object|null}
 */
export function toggleTask(id) {
  const tasks = getAllTasks()
  const task = tasks.find(t => t.id === id)
  if (!task) return null

  task.completed = !task.completed
  task.updatedAt = nowISO()
  saveTasks(tasks)
  return task
}

/**
 * 删除任务
 * @param {string} id
 * @returns {boolean}
 */
export function deleteTask(id) {
  const tasks = getAllTasks()
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return false

  tasks.splice(index, 1)
  saveTasks(tasks)
  return true
}

/**
 * 获取统计信息
 * @returns {{ total: number, completed: number, active: number, progress: number }}
 */
export function getStats() {
  const tasks = getAllTasks()
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active = total - completed
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, active, progress }
}
