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

/**
 * 导出任务为 JSON 文件下载
 * @param {object[]} tasks
 */
export function exportTasks(tasks) {
  const data = JSON.stringify(tasks, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `learning-tasks-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 导入 JSON 文件，返回任务数组或 null
 * @returns {Promise<object[]|null>}
 */
export function importTasks() {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.addEventListener('change', () => {
      const file = input.files[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const tasks = JSON.parse(e.target.result)
          resolve(Array.isArray(tasks) ? tasks : null)
        } catch {
          alert('❌ JSON 解析失败，请确认文件格式正确')
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    })
    input.click()
  })
}
