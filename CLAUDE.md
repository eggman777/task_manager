# CLAUDE.md

本文档为 Claude Code（claude.ai/code）在本仓库中工作时提供指引。

## 项目概览

🎓 **学习任务管理器** — 一个 PWA 待办工具，专为学习场景设计。可安装到手机主屏幕，支持创建/编辑/完成/删除任务，带优先级、标签、截止日期管理。纯前端，数据存于 browser localStorage。

## 技术栈

| 类别 | 选型 |
|------|------|
| 前端 | 原生 JavaScript（ES Modules），无框架 |
| 构建 | Vite 6（HMR，<250ms 构建） |
| 样式 | 纯 CSS（CSS 变量 + Flexbox） |
| 字体 | Fraunces（标题）+ DM Sans（正文），通过 Google Fonts 加载 |
| 存储 | 浏览器 localStorage，键名 `learningTasks` |
| PWA | manifest.json + Service Worker（Network First 策略） |
| 运行环境 | Node.js ≥ 18 |

## 常用命令

```bash
npm install       # 安装依赖
npm run dev       # 启动开发服务器（HMR，localhost:5173）
npm run build     # 构建生产版本到 dist/（~16KB gzip）
npm run preview   # 本地预览构建产物
```

## 架构

### 单向数据流

```
localStorage ←→ storage.js ←→ taskManager.js ←→ app.js → UI 组件（DOM）
```

1. `app.js` 在 `init()` 中从 `storage.js` 加载任务到 `this.tasks[]`
2. `render()` 过滤/排序后传给 `TaskList`
3. 用户操作（创建/编辑/删除/完成）通过回调通知 `app.js`
4. `app.js` 更新数据 → 写 localStorage → 重新渲染

### 分层职责

- **`src/core/`** — 纯逻辑层，不操作 DOM。
  - `storage.js`：localStorage 封装（loadTasks / saveTasks / clearTasks）
  - `taskManager.js`：CRUD（createTask / updateTask / toggleTask / deleteTask / getStats）
  - `utils.js`：工具函数（generateId / getDeadlineStatus / sortTasks / searchTasks / isMobile）
  - `theme.js`：主题色管理（computePalette / applyAccent / 12 色预设）
- **`src/components/`** — UI 组件。每个文件导出一个工厂函数 `createXxx({...})`，返回 DOM 元素。组件通过回调接收数据，不直接读取 storage。
- **`src/app.js`** — 主控制器。持有 `this.tasks[]`、筛选/排序状态、主题状态，串联所有组件。
- **`src/styles/`** — 5 个 CSS 文件按职责拆分。

### 组件树

```
App
├── StatsBar          ← tasks[] → 渲染统计 + 进度条
├── FilterBar         ← filter/sort/search/selectMode → 渲染筛选按钮、搜索框、排序下拉、多选入口
├── TaskList          ← tasks[] + handlers → 渲染列表
│   ├── TaskItem[]    ← 单个任务卡片（支持多选选中态）
│   └── SwipeableTask[] ← 包裹 TaskItem（移动端，带滑动手势）
├── TaskForm          ← 表单（桌面用 Modal，移动端用 Bottom Sheet）
├── Toast             ← 删除撤销通知（桌面+移动端统一使用，3秒自动消失）
├── FAB               ← 移动端右下角浮动新建按钮
├── HeaderDropdown    ← ⚙️ 下拉菜单（主题切换 + 6色选择 + 导出/导入 JSON）
├── SelectBottomBar   ← 多选模式底部操作栏（全选 / 删除 / 退出）
└── ScrollTopBtn      ← 滚动超过一屏后显示的回顶按钮
```

### 数据模型

```js
{
  id: string,              // crypto.randomUUID()
  title: string,           // 必填，最长 100 字
  description: string,     // 选填，最长 500 字
  deadline: string|null,   // "MM-DD" 或 "MM-DD HH:mm"，年份可跨年推断
  priority: "high" | "medium" | "low",  // 默认 "medium"
  tags: string[],          // 预设标签（课堂/编程/阅读/作业/复习）+ 自定义
  completed: boolean,
  createdAt: string,       // ISO 时间戳
  updatedAt: string
}
```

## 设计规范

- **UI 风格**：Warm Studio — 赤陶暖色调、Fraunces 衬线标题、DM Sans 正文、噪点纹理、克制阴影
- **CSS 变量**：定义在 `base.css` 的 `:root` 和 `[data-theme="dark"]` 中。主题色通过 `theme.js` 运行时覆盖 `--accent` 系列变量
- **组件实现**：每个组件导出 `createXxx(options)` 工厂函数，返回 DOM 节点。不使用类组件或 Web Components
- **纯 JavaScript**：不涉及 TypeScript
- **中文界面**：所有用户可见文字使用中文

## 关键约定

- `data-action` 属性用于事件绑定（如 `[data-action="toggle"]`）
- `data-region` 属性用于渲染占位（如 `[data-region="task-list"]`）
- 移动端/桌面端切换：通过 `isMobile()` 检测（`'ontouchstart' in window`），分别使用不同 UI 容器（swipeable vs plain、Bottom Sheet vs Modal）
- 主题色变更是通过 CSS 变量覆盖实现，所有使用 `--accent` 的地方会自动跟随

## 文件索引

### 入口
| 文件 | 说明 |
|------|------|
| `index.html` | HTML 入口，加载 Google Fonts + manifest |
| `src/main.js` | 加载样式 + 注册 Service Worker |
| `src/app.js` | 主控制器 ~360 行 |

### 核心逻辑
| 文件 | 说明 |
|------|------|
| `src/core/storage.js` | localStorage 封装 + 数据导出/导入 |
| `src/core/taskManager.js` | 任务 CRUD |
| `src/core/utils.js` | 日期解析、排序、搜索、isMobile |
| `src/core/theme.js` | 主题色 + 衍生色计算（6 色预设）|

### UI 组件
| 文件 | 说明 |
|------|------|
| `src/components/TaskForm.js` | 表单（桌面弹窗 / 移动端 Bottom Sheet）|
| `src/components/TaskItem.js` | 任务卡片（支持多选模式）|
| `src/components/TaskList.js` | 任务列表 + 智能空状态 |
| `src/components/FilterBar.js` | 筛选 + 搜索 + 排序（200ms debounce）|
| `src/components/StatsBar.js` | 统计栏 + 进度条 |
| `src/components/Toast.js` | 撤销删除通知（桌面+移动端统一使用）|
| `src/components/FAB.js` | 浮动按钮（移动端）|
| `src/components/SwipeableTask.js` | 滑动删除（移动端）|

### 样式
| 文件 | 说明 |
|------|------|
| `src/styles/base.css` | CSS 变量、重置、深色模式变量、噪点纹理、滚动条 |
| `src/styles/layout.css` | 页面布局、header、响应式 |
| `src/styles/components.css` | 所有组件样式 |
| `src/styles/state.css` | 动画 keyframes、颜色过渡 |
| `src/styles/mobile.css` | 触控热区、安全区域、PTR、FAB、Bottom Sheet、安装引导 |

### PWA
| 文件 | 说明 |
|------|------|
| `public/manifest.json` | PWA 清单 |
| `public/sw.js` | Service Worker（Network First）|
| `public/icon-192.svg` | PWA 图标 |
| `public/icon-512.svg` | PWA 图标 |

## 项目状态

当前为 **v0.8**，迭代内容包括：Header ⚙️ 下拉菜单（主题切换 + 6 色预设 + JSON 导出/导入）、统一 Toast 撤销删除、多选入口与底部操作栏、滚动回顶按钮。
