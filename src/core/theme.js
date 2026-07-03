// 🎨 主题色管理
// 预设色板 + 自定义颜色 + 衍生色计算

const STORAGE_KEY = 'accentColor'

export const PRESETS = [
  { name: '赤陶', hex: '#C2673D' },
  { name: '海蓝', hex: '#3B82F6' },
  { name: '松绿', hex: '#059669' },
  { name: '梅紫', hex: '#7C3AED' },
  { name: '琥珀', hex: '#D97706' },
  { name: '岩灰', hex: '#64748B' }
]

/**
 * 将 hex 颜色加深指定比例
 */
function darken(hex, ratio = 0.85) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.round(r * ratio),
    Math.round(g * ratio),
    Math.round(b * ratio)
  )
}

/**
 * hex 混入白色（用于浅色背景）
 */
function tint(hex, ratio = 0.12) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.round(r + (255 - r) * (1 - ratio)),
    Math.round(g + (255 - g) * (1 - ratio)),
    Math.round(b + (255 - b) * (1 - ratio))
  )
}

/**
 * hex 混入黑色（用于深色背景）
 */
function shade(hex, ratio = 0.85) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.round(r * ratio),
    Math.round(g * ratio),
    Math.round(b * ratio)
  )
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ]
}

function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, v))
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map(v => clamp(v).toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 从主色计算一整套衍生色
 */
export function computePalette(hex, theme) {
  const isDark = theme === 'dark'
  return {
    accent: hex,
    accentHover: isDark
      ? tint(hex, 0.92) // dark mode: slightly lighter
      : darken(hex, 0.85), // light mode: darker
    accentBg: isDark
      ? shade(hex, 0.22) // dark mode: dark tinted
      : tint(hex, 0.12), // light mode: very light
    accentLight: isDark
      ? shade(hex, 0.30)
      : tint(hex, 0.20),
    // 高优先级 = 主题色
    colorHigh: hex,
    colorHighBg: isDark
      ? shade(hex, 0.22)
      : tint(hex, 0.12),
    // 卡片边框 = 极淡的主题色
    cardBorder: isDark
      ? shade(hex, 0.35)
      : tint(hex, 0.06)
  }
}

/**
 * 应用主题色到 :root
 */
export function applyAccent(hex, theme) {
  const p = computePalette(hex, theme)
  const root = document.documentElement
  root.style.setProperty('--accent', p.accent)
  root.style.setProperty('--accent-hover', p.accentHover)
  root.style.setProperty('--accent-bg', p.accentBg)
  root.style.setProperty('--accent-light', p.accentLight)
  // 高优先级跟随主题色
  root.style.setProperty('--color-high', p.colorHigh)
  root.style.setProperty('--color-high-bg', p.colorHighBg)
  // 卡片边框跟随主题色
  root.style.setProperty('--card-border', p.cardBorder)
}

/**
 * 保存到 localStorage
 */
export function saveAccent(hex) {
  localStorage.setItem(STORAGE_KEY, hex)
}

/**
 * 读取保存的主题色
 */
export function loadAccent() {
  return localStorage.getItem(STORAGE_KEY) || PRESETS[0].hex
}

/**
 * 是否为预设色
 */
export function isPreset(hex) {
  return PRESETS.some(p => p.hex.toLowerCase() === hex.toLowerCase())
}
