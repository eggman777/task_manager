// 💾 数据持久化
// localStorage 读写封装

const STORAGE_KEY = 'learningTasks'

/**
 * 从 localStorage 加载所有任务
 * @returns {object[]}
 */
export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const tasks = JSON.parse(data)
    return Array.isArray(tasks) ? tasks : []
  } catch (e) {
    console.warn('⚠️ 读取数据失败:', e)
    return []
  }
}

/**
 * 保存所有任务到 localStorage
 * @param {object[]} tasks
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('❌ 保存数据失败:', e)
  }
}

/**
 * 清空所有任务（谨慎使用）
 */
export function clearTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('❌ 清空数据失败:', e)
  }
}
