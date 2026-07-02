# 代码架构

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 原生 HTML5 + CSS3 + Vanilla JS (ES6) | 无框架 |
| 托管 | GitHub Pages | 发布静态网页 |
| 自动化 | GitHub Actions | push 到 `main` 后自动部署 |
| 字体 | Google Fonts (Montserrat, Pacifico, Noto Sans SC, Ma Shan Zheng) | CDN 加载 |
| EXIF | exif-js (CDN) | 读取本地照片拍摄时间 |
| 留言 | giscus + GitHub Discussions | 永久保存共享留言，自定义主题 CSS |
| 本地存储 | localStorage | 登录状态、情话轮播顺序 |

## 架构模式

```
GitHub repository
  -> GitHub Actions
  -> 自动预处理 dist/images 照片和缩略图
  -> GitHub Pages
  -> 浏览器加载静态 HTML/CSS/JS/图片/音乐
  -> giscus 连接 GitHub Discussions 留言
```

- **无自建后端**：没有自建数据库、云函数或服务端 API
- **单页应用 (SPA)**：登录页和主页面通过 `display` 切换，无路由
- **静态内容**：照片、音乐、时间线、情话都随仓库一起发布
- **永久留言**：留言保存在 GitHub Discussions，登录 GitHub 后可写入和管理

## 数据流

### 登录

```
用户输入密码 -> 与 CONFIG.accessPassword 比对 -> localStorage 记录登录状态 -> 显示主页面
```

### 照片加载

```
showMainPage()
  -> loadImages()
  -> 顺序尝试发布产物里的 images/thumbs/0.jpg ~ N.jpg
  -> 缩略图缺失时尝试 images/0.jpg ~ N.jpg
  -> EXIF 提取拍摄日期
  -> 渲染照片墙
```

### 留言

```
giscus iframe 加载
  -> 按 data-term 找到或创建 GitHub Discussion
  -> GitHub 登录后发表评论
  -> GitHub Discussions 持久保存
  -> giscus 渲染评论和后续编辑
```

### 歌单

```
initPlaylist()
  -> 读取 CONFIG.playlist
  -> 渲染歌单 DOM
  -> 加载第一首到 <audio>
  -> 点击歌曲切换播放
  -> ended 事件自动切下一首
```

### 今日情话

```
renderDailyQuote()
  -> 读取 CONFIG.dailyQuotes
  -> localStorage 保存洗牌顺序和当前索引
  -> 每次访问显示下一句
```

### 时间线

```
renderTimeline()
  -> 读取 CONFIG.timeline
  -> 渲染时间线卡片
```

## 文件职责

```
ading-lili-website/
├── index.html          # 唯一页面: 登录 + 主内容
├── config.js           # 全局配置: 名字/日期/密码/歌单/照片参数/情话/时间线
├── css/style.css       # 全部样式: 登录/导航/照片墙/giscus 外框/播放器/弹窗/响应式
├── css/giscus-love.css # giscus iframe 内部自定义主题
├── js/
│   ├── app.js          # 主逻辑: 初始化/登录/照片/播放器
│   └── hearts.js       # Canvas 爱心粒子动画
├── scripts/
│   ├── preprocess.py   # 照片预处理脚本，发布时对 dist/images 自动运行
│   └── publish-github-pages.sh
├── images/             # 原图和缩略图
├── music/              # 歌单音频文件
├── .github/workflows/  # GitHub Pages 部署 workflow
├── README.md           # 功能文档
├── DEPLOYMENT.md       # 发布说明
└── ARCHITECTURE.md     # 本文件
```

## CSS 架构

- **变量体系**：`:root` 定义颜色、背景、边框
- **布局**：Flexbox 为主
- **响应式**：两个断点 `768px` / `480px`
- **动画**：`@keyframes`（fadeInUp, rotateBackground, shake, marquee）
- **主题**：浅色模式强制 (`color-scheme: light only`)

## 部署流水线

```
本地修改
  -> git commit
  -> git push origin main
  -> GitHub Actions 打包静态文件
  -> 自动生成照片编号和缩略图
  -> GitHub Pages 发布
```

线上地址：

```text
https://LuckyKingADing.github.io/ading-lili-website/
```
