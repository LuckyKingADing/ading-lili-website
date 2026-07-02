# 代码架构

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 原生 HTML5 + CSS3 + Vanilla JS (ES6) | 无框架，零依赖 |
| 后端 | 腾讯云 CloudBase (BaaS) | 云数据库 + 云存储 + 静态托管 + 云函数 |
| 字体 | Google Fonts (Montserrat, Pacifico, Noto Sans SC) | CDN 加载 |
| EXIF | exif-js (CDN) | 读取照片拍摄时间（本地模式） |
| 部署 | CloudBase CLI (`tcb app deploy`) | 版本管理 + 自动构建 |
| 云函数 | CloudBase SCF (Node.js 18) | syncPhotos: 照片同步；syncStorage: 存储文件同步 |
| 图片处理 | CloudBase 万象优图 | URL 参数实时缩放缩略图，无需本地预处理 |

## 架构模式

```
纯静态前端 (HTML/CSS/JS)
    │
    ├── 本地音乐文件 ──→ 随部署上传到 CloudBase 静态托管 CDN
    │
    ├── 云存储 (照片 + 音乐) ──→ CloudBase CDN 直链
    │       │
    │       └── syncPhotos 云函数 ──→ 写入 photos 数据库集合
    │
    └── CloudBase SDK (JS) ──→ 云数据库 (留言 + photos 集合)
                                  │
                                  └── 失败自动 fallback: localStorage / 本地文件
```

- **无服务端渲染**：所有页面逻辑在浏览器端执行
- **渐进增强**：CloudBase 不可用时，留言降级 localStorage，照片降级本地 `images/`
- **单页应用 (SPA)**：登录页和主页面通过 `display` 切换，无路由
- **匿名登录**：前端通过 CloudBase 匿名认证访问数据库

## 数据流

### 登录
```
用户输入密码 → localStorage 比对 → 显示主页面
```

### 照片加载
```
showMainPage()
  → dbReady (等 CloudBase 匿名登录完成)
  → 优先: CloudBase DB photos 集合 → 获取 {url, thumbUrl, date} → 渲染
  → 缩略图: url + "?imageMogr2/thumbnail/400x400" (万象优图实时缩放)
  → 降级: 本地 images/ 顺序加载 → EXIF 提取日期 → 渲染
  → 一次性加载全部（云模式下无懒加载）
```

### 照片同步 (云端)
```
用户上传到云存储 ading-lili/photos/
  → 运行 syncPhotos 云函数 (传入文件名列表)
  → 云函数构造 URL + 万象优图缩略图参数
  → 写入 / 增量更新 photos 数据库集合
  → 网站刷新后从数据库读取
```

### 留言
```
发送留言 → 优先 CloudBase DB messages 集合
         → 失败降级 localStorage
读取留言 → 优先 CloudBase → 降级 localStorage
```

### 歌单
```
initPlaylist() → 读取 CONFIG.playlist (本地配置)
  → 渲染歌单 DOM → 加载第一首到 <audio>
点击歌曲 → playSong(i) → 切换 src → 播放
播放结束 → ended 事件 → nextSong() → 循环
```

### 今日情话
```
renderDailyQuote() → 优先 CloudBase DB dailyQuotes 集合
  → 降级: CONFIG.dailyQuotes (本地配置)
  → 基于 dayOfYear 确定性选择一条
  → 渲染到 #quoteSection (无数据时隐藏)
```

## 文件职责

```
ading-lili-website/
├── index.html          # 唯一页面: 登录 + 主内容 (SPA)
├── config.js           # 全局配置: 名字/日期/密码/歌单/CloudBase
├── css/style.css       # 全部样式 (~700行): 登录/导航/照片墙/留言/播放器/弹窗/响应式
├── js/
│   ├── app.js          # 主逻辑 (~450行): 初始化/登录/照片/留言/播放器/CloudBase
│   └── hearts.js       # Canvas 爱心粒子动画 (独立 IIFE)
├── cloudfunctions/
│   ├── syncPhotos/     # 照片同步云函数 (文件名 → 数据库)
│   └── syncStorage/    # 存储事件同步云函数
├── cloudbaserc.json    # CloudBase 部署配置 (app deploy 格式)
├── scripts/
│   └── preprocess.py   # 照片预处理脚本 (本地 fallback)
├── images/             # 照片 + thumbs/ 缩略图 (本地 fallback)
├── music/              # 歌单音频文件
├── README.md           # 功能文档
├── CLAUDE.md           # 项目规则
└── ARCHITECTURE.md     # 本文件
```

## CSS 架构

- **变量体系**: `:root` 定义 8 个 CSS 自定义属性 (颜色/背景/边框)
- **布局**: Flexbox 为主，无 Grid
- **响应式**: 两个断点 `768px` / `480px`，移动优先的渐进增强
- **动画**: `@keyframes` (fadeInUp, rotateBackground, shake, marquee)
- **主题**: 浅色模式强制 (`color-scheme: light only`)

## 部署流水线

```
本地开发 → tcb app deploy → CloudBase 云端构建 → 静态托管 CDN
                                    │
                              版本快照 (支持回滚)
```

- 命令: `tcb app deploy -f --framework static --install-command "" --build-command "" --output-dir "./" --env-id ading-d1g2dcqrs47be3e97`
- 主地址: `https://ading-lili-website-ading-d1g2dcqrs47be3e97.webapps.tcloudbase.com/` (app deploy, 版本管理)
- 备用地址: `https://ading-d1g2dcqrs47be3e97-1353717227.tcloudbaseapp.com/` (hosting deploy)
- 版本管理: `tcb app versions` / `tcb app rollback`
