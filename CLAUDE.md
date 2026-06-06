# CLAUDE.md

本文档为 Claude Code（claude.ai/code）在本仓库中工作时提供指引。

## 项目概览

🎓 **学习任务管理器** — 一个活泼友好的网页版学习任务管理小工具。学生可以创建、查看、编辑、完成和删除学习任务，支持截止日期、优先级和标签分类。数据存储于浏览器 localStorage。

## 技术栈

| 类别 | 选型 |
|------|------|
| 前端语言 | JavaScript（ES Modules），无框架 |
| 构建工具 | Vite 6（HMR 热更新，开发体验好） |
| 样式 | 纯 CSS（CSS 变量 + Flexbox + Grid） |
| 数据存储 | 浏览器 localStorage，键名 `learningTasks` |
| 运行环境 | Node.js ≥ 18（当前 v24.16.0） |

## 常用命令

```bash
npm install       # 首次运行或拉取更新后安装依赖
npm run dev       # 启动 Vite 开发服务器（带 HMR，自动打开浏览器）
npm run build     # 构建生产版本到 dist/
npm preview       # 本地预览构建产物
```

## 项目状态

- Phase 1（项目骨架）✅ 已完成
- Phase 2（数据层）✅ 已完成
- Phase 3-5（UI 组件及打磨）⏳ 待实现

## 架构

### 单向数据流

```
localStorage ←→ storage.js ←→ taskManager.js ←→ app.js → UI 组件（DOM）
```

1. `app.js` 在初始化时从 `storage.js` 加载任务到 `this.tasks[]`
2. `app.js` 将过滤和排序后的数据传递给 `TaskList` 等组件
3. 用户操作（创建/编辑/删除/切换完成）通过回调通知 `app.js`
4. `app.js` 更新 `this.tasks[]` → 写入 localStorage → 重新渲染受影响的组件

### 分层职责

- **`src/core/`** — 纯逻辑层，不操作 DOM。
  - `storage.js`：封装 localStorage 读写（loadTasks / saveTasks / clearTasks）
  - `taskManager.js`：任务 CRUD 操作（createTask / updateTask / toggleTask / deleteTask / getStats）
  - `utils.js`：工具函数（generateId / formatDate / getDeadlineStatus / sortTasks / searchTasks）
- **`src/components/`** — UI 组件（待创建）。每个文件导出一个类或函数，管理自己的 DOM 子树，通过回调接收数据，不直接读取 storage。
- **`src/app.js`** — 主控制器，持有任务数组，协调组件之间的连接和渲染周期。
- **`src/styles/`** — 按职责拆分。
  - `base.css`：CSS 变量、重置样式
  - `layout.css`：页面布局、响应式
  - `components.css`：组件样式
  - `state.css`：状态颜色（过期、优先级、动画）

### 预设组件树（待实现）

```
App
├── StatsBar        ← tasks[] → 渲染完成统计
├── TaskForm        ← onSubmit 回调 → 创建/更新任务
├── FilterBar       ← onFilterChange → 状态筛选 + 搜索 + 排序
└── TaskList        ← tasks[], filter, sort → 渲染列表
    └── TaskItem[]  ← 单个任务 + onToggle/onEdit/onDelete 回调
```

### 数据模型（Task）

```js
{
  id: string,              // crypto.randomUUID() 生成
  title: string,           // 必填，最长 100 字
  description: string,     // 选填，最长 500 字
  deadline: string|null,   // "YYYY-MM-DD" 格式，选填
  priority: "high" | "medium" | "low",  // 默认 "medium"
  tags: string[],          // 预设标签 + 自定义标签
  completed: boolean,      // 默认 false
  createdAt: string,       // ISO 时间戳
  updatedAt: string        // ISO 时间戳
}
```

## 设计规范

- **UI 风格**：活泼友好风 — 暖色调、圆角（12-16px）、Emoji 图标、柔和渐变、完成动画
- **CSS 变量**：定义在 `base.css` 中（颜色、间距、圆角），必须使用变量而非硬编码值
- **组件实现**：使用普通 JS 类或模块函数，不引入框架或 Web Components
- **纯 JavaScript**：不涉及 TypeScript
- **中文本地化**：用户界面全部使用中文（标签、占位符、空状态提示等）

## 当前已存在的关键文件

| 文件 | 说明 |
|------|------|
| `index.html` | HTML 页面入口 |
| `package.json` | 项目配置和依赖 |
| `vite.config.js` | Vite 配置 |
| README.md | 项目说明文档 |
| tm.md | 原始需求文档 |
| `src/main.js` | 应用入口，加载样式和启动 App |
| `src/app.js` | 主控制器 |
| `src/core/storage.js` | localStorage 数据持久化 |
| `src/core/taskManager.js` | 任务 CRUD 业务逻辑 |
| `src/core/utils.js` | 工具函数 |
| `src/styles/base.css` | CSS 变量和重置样式 |
| `src/styles/layout.css` | 页面布局 |
| `src/styles/components.css` | 组件样式 |
| `src/styles/state.css` | 状态颜色和动画 |

## 待实现的文件（Phase 3-5）

```
src/components/
├── TaskForm.js        # 新建/编辑任务表单
├── TaskList.js        # 任务列表容器
├── TaskItem.js        # 单个任务卡片
├── FilterBar.js       # 状态筛选 + 搜索 + 排序
├── StatsBar.js        # 顶部统计栏
└── ConfirmDialog.js   # 删除确认弹窗
```
