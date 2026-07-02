# 网站复现提示词

将此提示词发给 AI 编程工具，即可复现当前 GitHub-only 版本网站。

---

请帮我创建一个情侣纪念网站 "Our Love Journey"，源码托管在 GitHub，静态页面通过 GitHub Pages 发布。不要使用自建后端、云函数或对象存储。永久留言使用 giscus + GitHub Discussions。

## 技术栈

- 纯静态 HTML5 + CSS3 + Vanilla JS (ES6)，不使用前端框架
- 部署: GitHub Pages + GitHub Actions
- 发布流程自动运行照片预处理脚本，生成编号照片和缩略图
- CDN 加载: Google Fonts、exif-js
- 留言: giscus + GitHub Discussions
- 本地存储: localStorage 保存登录状态、情话轮播顺序

## 配色方案

- 页面背景: `#f5f5f5`
- 卡片背景: `#ffffff`
- 品牌强调色: `#ff6f61`
- 主文字: `#333`
- 辅助文字: `#777`
- 边框: `#e0e0e0`
- 卡片圆角: `10px`
- 卡片阴影: `0 4px 6px rgba(0,0,0,0.1)`
- 防深色模式: `<meta name="color-scheme" content="light only">`

## 功能清单

### 1. 登录保护

- 全屏登录页，渐变背景，居中白色卡片
- 密码输入框 + 进入按钮，回车可提交
- 密码在 `config.js` 中配置
- 登录状态 localStorage 持久化
- 错误抖动动画

### 2. Canvas 爱心粒子动画

- 独立 IIFE (`js/hearts.js`)
- 贝塞尔曲线绘制爱心形状
- 底部自动飘升 + 鼠标移动/点击触发
- `pointer-events: none` 不阻挡交互

### 3. 恋爱天数计时

- 从 `config.js` 配置的纪念日起自动计算天数
- 大号珊瑚色数字显示

### 4. 重要日期卡片

- 三张白色卡片: 他的生日、她的生日、在一起的那天
- 悬停上浮效果 + 依次淡入动画

### 5. 照片墙

- GitHub Actions 发布时对 `dist/images` 自动生成 `images/thumbs/0.jpg` ~ N.jpg
- 前端从 `images/thumbs/0.jpg` ~ N.jpg 顺序加载缩略图
- 缩略图不存在时 fallback 到 `images/0.jpg` ~ N.jpg
- EXIF 提取拍摄日期
- 图片弹窗浏览，左右箭头 + 键盘方向键切换，ESC 关闭
- 滚动懒加载

### 6. 留言板

- 使用 giscus 嵌入 GitHub Discussions 评论
- `data-repo` 指向网站仓库
- `data-mapping="specific"`，固定到同一个留言板 Discussion
- `data-theme` 指向 GitHub Pages 上的自定义 CSS 文件
- 输入框在顶部，语言 `zh-CN`，浅色主题
- 用户登录 GitHub 后可留言、编辑、删除
- 留言在不同设备之间同步显示

### 7. 今日情话

- 从 `config.js` 的 `dailyQuotes` 读取
- 支持多行诗词（`\n` 换行 + `white-space: pre-line`）
- 使用 localStorage 保存洗牌顺序，每次访问显示下一句
- 无数据时隐藏整个 section

### 8. 歌单播放器

- 自定义播放器 UI
- 播放/暂停按钮用 CSS 伪元素绘制
- 歌曲名 CSS marquee 跑马灯滚动
- 歌单面板展开/收起，点击切歌，当前播放高亮
- 自动连播
- 歌单文件放在 `music/`，路径写在 `config.js`

### 9. 恋爱时间线

- 从 `config.js` 的 `timeline` 读取
- 左右交错卡片布局

### 10. 响应式设计

- 768px 断点: 导航/标题缩小，照片 160px，登录表单纵向
- 480px 断点: 照片 150px，播放器收窄

## 文件结构

```
project/
├── index.html
├── config.js
├── css/style.css
├── js/
│   ├── app.js
│   └── hearts.js
├── images/
│   └── thumbs/
├── music/
├── scripts/
│   ├── preprocess.py   # 支持 --images-dir，发布时自动运行
│   └── publish-github-pages.sh
├── .github/workflows/deploy-pages.yml
├── README.md
├── DEPLOYMENT.md
└── ARCHITECTURE.md
```

## config.js 结构

```javascript
const CONFIG = {
  names: { him: "...", her: "...", display: "..." },
  dates: {
    loveDate: "YYYY-MM-DD",
    hisBirthday: "YYYY-MM-DD",
    herBirthday: "YYYY-MM-DD",
    anniversary: "YYYY-MM-DD"
  },
  dateLabels: { ... },
  timeline: [{ date: "YYYY.MM.DD", title: "...", desc: "..." }],
  accessPassword: "...",
  siteTitle: "Our Love Journey",
  playlist: [{ name: "...", artist: "...", file: "music/..." }],
  photos: {
    batchSize: 10,
    initialBatches: 5,
    scrollDistance: 1000,
    folder: "images",
    thumbFolder: "images/thumbs"
  },
  dailyQuotes: [{ text: "...", source: "..." }]
};
```
