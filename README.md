# Ading & Lili - Our Love Journey

情侣纪念网站。纯静态 HTML/CSS/JS，源码托管在 GitHub，网页通过 GitHub Pages 发布。

## 功能

- **密码登录**：暗号保护，登录状态 localStorage 持久化
- **爱心粒子动画**：Canvas 浮动爱心（底部飘升 + 鼠标/点击触发）
- **恋爱天数计时**：从纪念日起自动计算
- **重要日期卡片**：双方生日、纪念日
- **照片墙**：从仓库内 `images/` 加载照片，支持缩略图、EXIF 拍摄日期、弹窗浏览、键盘切换
- **留言板**：双人身份切换，本机 localStorage 保存
- **歌单播放器**：自定义播放器 UI，歌单列表展开/收起，点击切歌，歌曲名跑马灯滚动，自动连播
- **今日情话**：从 `config.js` 读取情话/诗词，支持多行文本，访问时洗牌轮播
- **恋爱时间线**：从 `config.js` 读取重要事件并渲染
- **响应式设计**：适配桌面、平板、手机（768px / 480px 断点）
- **防深色模式**：`<meta name="color-scheme" content="light only">` 确保浅色风格一致

## 项目结构

```
├── index.html          # 主页面
├── config.js           # 配置（名字、日期、密码、歌单、照片参数、情话、时间线）
├── css/style.css       # 样式
├── js/
│   ├── app.js          # 主逻辑（登录、照片、留言、播放器）
│   └── hearts.js       # 爱心粒子动画
├── images/
│   ├── 0.jpg ~ N.jpg   # 照片（按拍摄时间排序）
│   └── thumbs/         # 缩略图（预处理脚本自动生成）
├── music/              # 音乐文件
├── scripts/
│   ├── preprocess.py   # 照片预处理脚本（发布时自动运行）
│   └── publish-github-pages.sh
├── .github/workflows/  # GitHub Pages 自动部署
├── DEPLOYMENT.md       # 发布说明
└── ARCHITECTURE.md     # 架构说明
```

## 配置

编辑 `config.js`：

| 字段 | 说明 |
|------|------|
| `names` | 双方名字 |
| `dates.loveDate` | 恋爱开始日期 `YYYY-MM-DD` |
| `dates.hisBirthday` / `herBirthday` | 生日 |
| `dates.anniversary` | 纪念日 |
| `accessPassword` | 登录密码 |
| `playlist` | 歌单数组，每项含 `name`, `artist`, `file` |
| `photos.batchSize` | 每批尝试加载的照片数量 |
| `photos.initialBatches` | 首次加载批数 |
| `photos.folder` / `thumbFolder` | 原图和缩略图目录 |
| `dailyQuotes` | 情话数组，每项含 `text`（支持 `\n` 多行）和 `source`（可选） |
| `timeline` | 恋爱时间线事件 |

## 照片管理

照片完全走 GitHub 仓库。

1. 将照片放入 `images/`。
2. 提交并推送：

   ```bash
   git add images
   git commit -m "Update photos"
   git push
   ```

3. GitHub Actions 发布时会自动运行照片预处理：按拍摄时间排序，转换为 `0.jpg`, `1.jpg`, `2.jpg`，并生成 `images/thumbs/`。

本地预览时，如果想马上看到新照片，可以手动运行：

```bash
python3 scripts/preprocess.py
```

## 音乐管理

音乐文件完全走 GitHub 仓库。

1. 将音乐文件放入 `music/`。
2. 编辑 `config.js` 的 `playlist`：

   ```javascript
   { name: "歌名", artist: "歌手", file: "music/文件名.mp3" },
   ```

3. 提交并推送：

   ```bash
   git add music config.js
   git commit -m "Update playlist"
   git push
   ```

GitHub 普通仓库单文件不要超过 100MB。更大的音乐文件需要压缩、换格式或使用其他静态文件托管。

## 留言说明

当前留言板只使用浏览器 localStorage：

- 你写的留言只保存在你自己的浏览器
- Lili 写的留言只保存在她自己的浏览器
- 纯 GitHub Pages 不能安全地把网页表单直接写回 GitHub 仓库

如果以后需要两个人共享留言，需要再接入一个真正的后端或数据库。

## 部署

当前线上地址：

https://LuckyKingADing.github.io/ading-lili-website/

后续更新：

```bash
git add .
git commit -m "Update website"
git push
```

推送到 `main` 后，GitHub Actions 会自动发布到 GitHub Pages。

详细说明见 `DEPLOYMENT.md`。

## 后续方向

### 简单

- **照片瀑布流**：Pinterest 风格瀑布流布局，照片保持原始比例展示
- **照片加载动画**：模糊渐变清晰 + 淡入效果
- **纪念日倒计时**：页面显示“距离 Lili 生日还有 X 天”等多组倒计时
- **纪念日特效**：恋爱纪念日/生日当天，页面弹出特殊祝福动画
- **恋爱进度条**：“在一起的第 X 天 / 目标：一辈子”，游戏成就风格
- **照片轮播**：弹窗浏览照片时支持自动播放
- **悄悄话彩蛋**：交互触发隐藏彩蛋弹窗

### 中等

- **心情日记**：两人写简短日记，按日期展示，交换日记风格
- **打卡挑战**：一起完成 100 件事清单，完成一项点亮一项
- **恋爱地图**：标记一起去过的地方
- **照片标签分类**：给照片打标签（旅行、日常、纪念日），按分类筛选

### 工程

- **自定义域名**：绑定专属域名
- **夜间主题**：支持切换深色模式
- **共享留言后端**：如果确实需要多人同步留言，再选择合适的数据服务
