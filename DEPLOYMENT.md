# Deployment

这个项目现在完全通过 GitHub 管理源码，并通过 GitHub Pages 发布静态网页。

## 当前架构

```
GitHub repository
  -> GitHub Actions
  -> GitHub Pages
```

没有服务器、数据库、云函数或对象存储。网页加载的 HTML、CSS、JS、照片和音乐都来自 GitHub Pages。

## 仓库和线上地址

Repository:

```text
https://github.com/LuckyKingADing/ading-lili-website
```

Pages:

```text
https://LuckyKingADing.github.io/ading-lili-website/
```

## 自动发布

项目内置 GitHub Actions 工作流：

```text
.github/workflows/deploy-pages.yml
```

每次 push 到 `main` 分支后，GitHub Actions 会自动部署。

## 日常发布流程

```bash
cd /Users/ading/Code_Projects/Projects_for_VibeCoding/ading-lili-website

git add .
git commit -m "Update website"
git push
```

几秒到几十秒后，GitHub Pages 会刷新。

## 第一次发布或重新绑定远程

当前仓库已经绑定远程。如果以后换电脑或重新配置，可以使用：

```bash
git remote add origin https://github.com/LuckyKingADing/ading-lili-website.git
git branch -M main
git push -u origin main
```

或者使用脚本：

```bash
scripts/publish-github-pages.sh ading-lili-website public
```

## 内容管理

- 修改文字、日期、歌单、情话、时间线：编辑 `config.js`
- 修改页面结构：编辑 `index.html`
- 修改样式：编辑 `css/style.css`
- 添加照片：放入 `images/`，运行 `python3 scripts/preprocess.py`，提交并推送
- 添加音乐：放入 `music/`，更新 `config.js` 的 `playlist`，提交并推送

## 限制

GitHub Pages 是静态托管：

- 不能安全地从网页直接写 GitHub 仓库
- 留言只能保存在当前浏览器的 localStorage
- 共享留言、后台上传、访问统计等功能需要额外后端
- 仓库内单个文件不要超过 100MB
