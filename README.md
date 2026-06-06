# 🎓 学习任务管理器

一个可直接安装到手机的 PWA 待办工具，专为学习场景设计。

> **随手记、随手清** — 不做重管理，只帮你记住今天要做什么。

---

## ✨ 功能

### 核心
| 功能 | 说明 |
|------|------|
| 📝 **新建任务** | 标题 + 描述 + 截止日期 + 优先级 + 标签 |
| ✅ **完成任务** | 点击复选框，卡片向右滑出消失 |
| ✏️ **编辑任务** | 随时修改任何字段 |
| 🗑️ **删除 + 撤销** | 桌面确认弹窗 / 移动端即时删除 + 3秒可撤销 |

### 增强
| 功能 | 说明 |
|------|------|
| 🔴🟡🟢 **优先级** | 高/中/低，卡片左边条 + 标签颜色区分 |
| 🏷️ **标签** | 预设（课堂/编程/阅读/作业/复习）+ 自定义标签 |
| 🔍 **搜索** | 实时关键词搜索标题和描述 |
| 📊 **排序** | 按截止日期 / 优先级 / 创建时间 |
| 📈 **统计栏** | 总任务 / 已完成 / 进行中 + 进度条 |
| ☑️ **批量删除** | 切换到已完成 → 多选→批量删除（可撤销） |

### 视觉
| 功能 | 说明 |
|------|------|
| 🌙 **深色模式** | 手动切换，自动跟随系统 |
| 🎨 **自定义主题色** | 12 种预设 + 任意自定义颜色，即时生效 |
| 📱 **PWA 安装** | 添加到主屏幕，像原生 App 一样使用 |
| 👆 **滑动操作** | 移动端左滑展开删除按钮 |
| 🍞 **撤销 Toast** | 删除后底部弹出，3秒内可恢复 |

---

## 🛠️ 技术栈

| 类别 | 选型 |
|------|------|
| **前端** | 原生 JavaScript (ES Modules)，无框架 |
| **构建** | Vite 6（HMR 热更新，<250ms 构建） |
| **样式** | 纯 CSS（CSS 变量 + Flexbox） |
| **字体** | Fraunces（标题）+ DM Sans（正文） |
| **存储** | 浏览器 localStorage |
| **PWA** | Service Worker + manifest.json，离线可用 |
| **部署** | 构建产物静态文件 ~16KB gzip |

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（带热更新）
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

---

## 🗺️ 架构

### 单向数据流

```
localStorage ←→ storage.js ←→ taskManager.js ←→ app.js → UI 组件 (DOM)
```

1. `app.js` 从 `storage.js` 加载任务到 `this.tasks[]`
2. `app.js` 过滤/排序后传给 `TaskList`
3. 用户操作通过回调通知 `app.js`
4. `app.js` 更新数据 → 写 localStorage → 重新渲染

### 组件树

```
App
├── StatsBar          ← 完成统计 + 进度条
├── FilterBar         ← 状态筛选 + 搜索框 + 排序
├── TaskList          ← 任务列表（移动端嵌套 SwipeableTask）
│   └── TaskItem[]    ← 单张任务卡片
├── TaskForm          ← 新建/编辑（桌面弹窗 / 移动端 Bottom Sheet）
├── ConfirmDialog     ← 桌面删除确认弹窗
├── Toast             ← 移动端撤销删除通知
├── FAB               ← 移动端右下角浮动按钮
└── SwipeableTask     ← 移动端滑动删除
```

### 数据模型

```js
{
  id: string,              // crypto.randomUUID()
  title: string,           // 必填
  description: string,     // 选填
  deadline: string|null,   // "MM-DD" 或 "MM-DD HH:mm"
  priority: "high" | "medium" | "low",
  tags: string[],
  completed: boolean,
  createdAt: string,       // ISO 时间戳
  updatedAt: string
}
```

---

## 📁 项目结构

```
task_manager/
├── index.html              # HTML 入口 + Google Fonts + PWA meta
├── package.json
├── vite.config.js
├── README.md
├── tm.md                   # 原始需求文档
│
├── public/
│   ├── manifest.json       # PWA 配置（standalone 模式）
│   ├── sw.js               # Service Worker（离线缓存）
│   ├── icon-192.svg        # PWA 图标 192px
│   └── icon-512.svg        # PWA 图标 512px
│
└── src/
    ├── main.js             # 入口：加载样式 + 注册 Service Worker
    ├── app.js              # 主控制器
    │
    ├── core/
    │   ├── storage.js      # localStorage 封装
    │   ├── taskManager.js  # CRUD 业务逻辑
    │   ├── utils.js        # 日期解析、排序、搜索、工具函数
    │   └── theme.js        # 主题色管理 + 12 色预设
    │
    ├── components/
    │   ├── TaskForm.js     # 新建/编辑表单（桌面 Modal / 移动端 Bottom Sheet）
    │   ├── TaskList.js     # 任务列表容器
    │   ├── TaskItem.js     # 单张任务卡片
    │   ├── FilterBar.js    # 筛选 + 搜索 + 排序
    │   ├── StatsBar.js     # 统计栏
    │   ├── ConfirmDialog.js# 确认弹窗
    │   ├── Toast.js        # 撤销 Toast
    │   ├── FAB.js          # 浮动按钮
    │   └── SwipeableTask.js# 移动端滑动
    │
    └── styles/
        ├── base.css        # CSS 变量、重置、深色模式、滚动条、噪点纹理
        ├── layout.css      # 页面布局、响应式
        ├── components.css  # 组件样式
        ├── state.css       # 动画、状态颜色
        └── mobile.css      # 触控热区、安全区域、PTR、FAB、Bottom Sheet
```

---

## 📝 开发日志

| 日期 | 版本 | 内容 |
|------|------|------|
| 2026-06-06 | v0.1 | 项目骨架 + 数据层 + 核心 UI |
| 2026-06-06 | v0.2 | 截止日期去年份 + 可选时分 |
| 2026-06-06 | v0.3 | 优先级、标签、编辑、搜索、排序、统计 |
| 2026-06-06 | v0.4 | UI 重构 Warm Studio（赤陶调 + 字体 + 噪点）|
| 2026-06-06 | v0.5 | 自定义主题色 + 动画 |
| 2026-06-06 | v0.6 | PWA + 移动端滑动 + FAB + Toast |
| 2026-06-06 | v0.7 | 批量删除、Bottom Sheet、安装引导、下拉刷新 |

---

*🤖 本项目由 Claude Code 辅助开发*
