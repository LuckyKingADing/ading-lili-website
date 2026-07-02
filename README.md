# Ading & Lili - Our Love Journey

情侣纪念网站。纯静态 HTML/CSS/JS，推荐通过 GitHub Pages 发布；CloudBase 继续作为照片、留言等动态数据服务。

## 功能

- **密码登录**：暗号保护，登录状态 localStorage 持久化
- **爱心粒子动画**：Canvas 浮动爱心（底部飘升 + 鼠标/点击触发）
- **恋爱天数计时**：从纪念日起自动计算
- **重要日期卡片**：双方生日、纪念日
- **照片墙**：滚动懒加载 + EXIF 拍摄日期 + 弹窗浏览（键盘/触摸左右切换）
- **留言板**：双人身份切换 + 腾讯云 CloudBase 数据库 + localStorage 降级
- **歌单播放器**：自定义播放器 UI，歌单列表展开/收起，点击切歌，歌曲名跑马灯滚动，自动连播
- **今日情话**：每日展示一句情话/诗词，支持多行诗词（如海桑、诗经），基于日期确定性轮换
- **响应式设计**：适配桌面、平板、手机（768px / 480px 断点）
- **防深色模式**：`<meta name="color-scheme" content="light only">` 确保浅色风格一致

## 项目结构

```
├── index.html          # 主页面
├── config.js           # 配置（名字、日期、密码、CloudBase 环境等）
├── css/style.css       # 样式
├── js/
│   ├── app.js          # 主逻辑（登录、照片、留言、CloudBase）
│   └── hearts.js       # 爱心粒子动画
├── images/
│   ├── 0.jpg ~ N.jpg   # 照片（按拍摄时间排序）
│   └── thumbs/         # 缩略图（预处理脚本自动生成）
├── music/              # 背景音乐
├── scripts/
│   └── preprocess.py   # 照片预处理脚本
├── .github/workflows/  # GitHub Pages 自动部署
├── DEPLOYMENT.md       # GitHub Pages 发布说明
├── cloudbaserc.json    # CloudBase 部署配置
└── .tcbignore          # 部署时忽略的文件
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
| `bgMusic` | （已废弃，使用 playlist 替代） |
| `photos.useCloudStorage` | 是否使用云存储（默认 false 用本地文件） |
| `dailyQuotes` | 情话数组，每项含 `text`（支持 `\n` 多行）和 `source`（可选） |
| `cloudbase.env` / `cloudbase.region` | CloudBase 环境 ID 和区域 |

## 照片管理

照片通过 CloudBase 云存储托管。`config.js` 中 `useCloudStorage: true`。

### 添加照片

1. 打开 [CloudBase 控制台 → 云存储](https://tcb.cloud.tencent.com/dev?envId=ading-d1g2dcqrs47be3e97#/storage)，进入 `ading-lili/photos/`，上传文件

2. 列出云端照片，确认新文件名：
   ```bash
   tcb storage list ading-lili/photos --env-id ading-d1g2dcqrs47be3e97 | grep -oE 'photos/[^ ]+' | sed 's|photos/||'
   ```

3. 同步到数据库：
   ```bash
   tcb fn invoke syncPhotos --env-id ading-d1g2dcqrs47be3e97 --params '{"files":["新文件1.JPG","新文件2.jpg"]}'
   ```

4. 刷新网站即可看到新照片（无需重新部署）

### 删除照片

1. [CloudBase 控制台](https://tcb.cloud.tencent.com/dev?envId=ading-d1g2dcqrs47be3e97#/storage) → `ading-lili/photos/` → 删除文件

2. 删除数据库记录：
   ```bash
   tcb db nosql execute --env-id ading-d1g2dcqrs47be3e97 --command '[{"TableName":"photos","CommandType":"DELETE","Command":"{\"delete\":\"photos\",\"deletes\":[{\"q\":{\"url\":{\"$regex\":\"文件名部分\"}},\"limit\":1}]}"}]'
   ```

## 音乐管理

歌单配置在 `config.js` 的 `playlist` 数组中。

### 添加歌曲

1. 将音乐文件放入 `music/` 文件夹（或上传到云存储 `ading-lili/music/`）

2. 编辑 `config.js`，在 `playlist` 数组添加：
   ```javascript
   { name: "歌名", artist: "歌手", file: "music/文件名.mp3" },
   ```
   如果文件只存在云端，`file` 填云 URL。

3. 部署：
   ```bash
   tcb app deploy -f --framework static --install-command "" --build-command "" --output-dir "./" --env-id ading-d1g2dcqrs47be3e97
   ```

## 部署

### GitHub Pages（推荐）

项目已内置 GitHub Actions 工作流：`.github/workflows/deploy-pages.yml`。

第一次发布：

```bash
git remote add origin git@github.com:<your-user>/ading-lili-website.git
git branch -M main
git push -u origin main
```

然后在 GitHub 仓库开启：

`Settings → Pages → Build and deployment → Source → GitHub Actions`

发布后访问地址通常是：

```text
https://<your-user>.github.io/ading-lili-website/
```

详细说明见 `DEPLOYMENT.md`。

### CloudBase（旧方式/备用）

前置条件：安装 [CloudBase CLI](https://docs.cloudbase.net/cli/install)

```bash
# 部署（带版本管理）
cd /Users/ading/Code_Projects/Projects_for_VibeCoding/ading-lili-website
tcb app deploy -f --framework static --install-command "" --build-command "" --output-dir "./" --env-id ading-d1g2dcqrs47be3e97
```

相关命令：
```bash
tcb app versions ading-lili-website --env-id ading-d1g2dcqrs47be3e97  # 查看版本列表
tcb app info ading-lili-website --env-id ading-d1g2dcqrs47be3e97       # 查看应用详情
```

## 访问地址

https://ading-lili-website-ading-d1g2dcqrs47be3e97.webapps.tcloudbase.com

## 后续方向

### ✅ 已完成

- **CloudBase 云存储照片**：照片已迁移到云端，`syncPhotos` 云函数同步数据库，新增照片无需重新部署。
- **歌单播放器**：自定义播放器 UI，歌单列表，CSS 绘制播放/暂停图标。
- **恋爱时间线**：按时间展示重要事件，云端数据库管理，控制台直接增删改。
### 简单

- **照片瀑布流**：Pinterest 风格瀑布流布局，照片保持原始比例展示。
- **照片加载动画**：模糊渐变清晰 + 淡入效果。

- **纪念日倒计时**：页面显示"距离 Lili 生日还有 X 天"等多组倒计时
- **纪念日特效**：恋爱纪念日/生日当天，页面弹出特殊祝福动画
- **今日情话**：每天随机展示一句情话/诗词
- **恋爱进度条**："在一起的第 X 天 / 目标：一辈子"，游戏成就风格
- **留言点赞**：每条留言可点 ❤️，增加互动
- **照片轮播**：弹窗浏览照片时支持自动播放（幻灯片模式）
- **悄悄话彩蛋**：交互触发隐藏彩蛋弹窗

### 中等

- **心情日记**：两人写简短日记，按日期展示，交换日记风格
- **打卡挑战**：一起完成 100 件事清单，完成一项点亮一项
- **恋爱地图**：标记一起去过的地方，嵌入地图组件
- **留言红点通知**：新留言时另一方打开网站看到未读提示
- **留言回复**：回复某条留言，形成小对话
- **照片标签分类**：给照片打标签（旅行、日常、纪念日），按分类筛选
- **访问统计**：CloudBase 数据库记录访问次数

### 工程

- **照片管理后台**：网页端直接上传/删除照片，不依赖 CloudBase 控制台
- **自定义域名与备案**：绑定专属域名（如 `adingandlili.com`），提升仪式感
- **夜间主题**：支持切换深色模式
- **更多主题风格**：支持切换多种配色方案，或按季节/节日自动更换
