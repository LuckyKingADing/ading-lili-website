# 网站复现提示词

将此提示词发给 AI 编程工具，即可复现完整网站。

---

请帮我创建一个情侣纪念网站 "Our Love Journey"，部署到腾讯云 CloudBase。以下是完整需求。

## 技术栈

- 纯静态 HTML5 + CSS3 + Vanilla JS (ES6)，不使用任何前端框架
- 后端: 腾讯云 CloudBase (云数据库 + 云存储 + 静态托管 + 云函数)
- CSS 变量定义色板，Flexbox 布局，两个响应式断点 768px / 480px
- CDN 加载: Google Fonts (Montserrat, Pacifico, Noto Sans SC)、exif-js、CloudBase JS SDK (`https://static.cloudbase.net/cloudbase-js-sdk/latest/cloudbase.full.js`)

## 配色方案

- 页面背景: `#f5f5f5` 浅灰
- 卡片背景: `#ffffff` 白色
- 品牌强调色: `#ff6f61` 珊瑚红
- 主文字: `#333`，辅助文字: `#777`
- 边框: `#e0e0e0`
- 卡片圆角: `10px`
- 卡片阴影: `0 4px 6px rgba(0,0,0,0.1)` 中性灰
- 底部旋转径向渐变: `rgba(255,111,97,0.2)` 珊瑚色
- 防深色模式: `<meta name="color-scheme" content="light only">`
- 所有图片圆角: `10px`

## 功能清单

### 1. 登录保护
- 全屏登录页，渐变背景，居中白色卡片
- 密码输入框 + 进入按钮，回车可提交
- 密码在 config.js 中配置
- 登录状态 localStorage 持久化
- 错误抖动动画

### 2. Canvas 爱心粒子动画
- 独立 IIFE (`js/hearts.js`)
- 贝塞尔曲线绘制爱心形状
- 底部自动飘升 + 鼠标移动/点击触发
- `pointer-events: none` 不阻挡交互，z-index: 99

### 3. 恋爱天数计时
- 从 config.js 配置的纪念日起自动计算天数
- 大号珊瑚色数字显示

### 4. 重要日期卡片
- 三张白色卡片: 他的生日、她的生日、在一起的那天
- 悬停上浮效果 + 依次淡入动画

### 5. 照片墙
- 支持两种模式: CloudBase 云端数据库 或 本地文件 fallback
- 云端模式: 从 CloudBase photos 集合读取 URL，缩略图用万象优图 `?imageMogr2/thumbnail/400x400` 实时缩放
- 本地模式: 顺序加载 `images/thumbs/0.jpg` ~ N.jpg，EXIF 提取拍摄日期
- 图片弹窗浏览，左右箭头 + 键盘方向键切换，ESC 关闭
- 本地模式下滚动懒加载

### 6. 留言板
- 双人身份切换按钮 (珊瑚色激活态 + 左侧边框)
- 优先 CloudBase messages 集合，失败降级 localStorage
- 留言卡片带作者、时间、内容

### 7. 今日情话
- 每日展示一句情话/诗词，基于年内第几天确定性轮换
- 支持多行诗词（`\n` 换行 + `white-space: pre-line`）
- 数据优先从 CloudBase `dailyQuotes` 集合读取，降级至 `config.js` 本地配置
- 无数据时整个 section 隐藏

### 8. 歌单播放器
- 自定义播放器 UI，替换浏览器原生 audio 控件
- 播放/暂停按钮: CSS 伪元素绘制图标 (三角播放、双竖线暂停)，44px 圆形按钮
- 歌曲名 CSS marquee 跑马灯滚动
- 歌单面板: 展开/收起，点击切歌，当前播放高亮 + 珊瑚色左边框
- 自动连播，播放结束切下一首
- 歌单配置在 config.js

### 9. 页脚
- 居中灰色文字 "Made with 💕 by Ading & Lili"

### 10. 响应式设计
- 768px 断点: 导航/标题缩小，照片 160px，登录表单纵向
- 480px 断点: 照片 150px，播放器收窄

## 文件结构

```
project/
├── index.html          # 唯一页面，所有 HTML
├── config.js           # 全局配置
├── css/style.css       # 全部样式
├── js/
│   ├── app.js          # 主逻辑
│   └── hearts.js       # 爱心粒子动画
├── cloudfunctions/
│   ├── syncPhotos/     # 照片同步云函数
│   └── syncStorage/    # 存储事件同步云函数
├── cloudbaserc.json    # CloudBase app deploy 配置
├── images/             # 本地照片 fallback
│   └── thumbs/         # 本地缩略图
├── music/              # 本地音乐文件
└── README.md
```

## config.js 结构

```javascript
const CONFIG = {
  names: { him: "...", her: "...", display: "..." },
  dates: { loveDate: "YYYY-MM-DD", hisBirthday: "...", herBirthday: "...", anniversary: "..." },
  dateLabels: { ... },
  accessPassword: "...",
  siteTitle: "...",
  playlist: [{ name: "...", artist: "...", file: "music/..." }],
  dailyQuotes: [{ text: "...", source: "..." }],  // text 支持 \n 多行，source 可选
  photos: { useCloudStorage: true/false, cloudPath: "...", batchSize: 10, initialBatches: 5, ... },
  cloudbase: { env: "...", region: "ap-shanghai" }
};
```

## CloudBase 配置

1. 开启匿名登录
2. 添加安全域名
3. photos 集合权限: ADMINWRITE (读取全部、不可修改)
4. messages 集合权限: ADMINWRITE
5. 云存储文件夹: `项目名/photos/`、`项目名/music/`，权限设为所有用户可读
6. 部署命令: `tcb app deploy -f --framework static --install-command "" --build-command "" --output-dir "./" --env-id 环境ID`

## 照片同步方案

云函数 syncPhotos: 接收文件名列表 → 构造 URL + 万象优图缩略图参数 → 增量写入 photos 数据库集合。
