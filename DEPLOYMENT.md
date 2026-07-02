# Deployment

这个项目现在推荐用 GitHub 管理源码，并用 GitHub Pages 发布静态网页。

## 当前推荐架构

```
GitHub repository
  -> GitHub Actions
  -> GitHub Pages 静态网页
  -> 浏览器继续连接 CloudBase 数据库和云存储
```

这样做之后，网页发布不再依赖 `tcb app deploy`。CloudBase 仍然只负责动态数据：

- 照片列表和照片云存储
- 留言板
- 云端情话
- 云端时间线

## 第一次发布

1. 准备 GitHub 仓库名，例如 `ading-lili-website`。

2. 本地推送。

   如果你已经安装并登录 GitHub CLI，脚本会自动创建仓库、推送代码并尝试启用 GitHub Pages：

   ```bash
   scripts/publish-github-pages.sh ading-lili-website public
   ```

   当前机器如果没有 `gh`，先安装并登录：

   ```bash
   brew install gh
   gh auth login
   ```

   或者先在 GitHub 手动创建同名仓库，再手动推送：

   ```bash
   git remote add origin git@github.com:<your-user>/ading-lili-website.git
   git branch -M main
   git push -u origin main
   ```

3. 打开 GitHub 仓库：

   `Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`

4. Actions 跑完后，网页地址通常是：

   ```text
   https://<your-user>.github.io/ading-lili-website/
   ```

## 后续更新

修改代码后提交并推送到 `main` 分支：

```bash
git add index.html config.js css js images music README.md DEPLOYMENT.md .github/workflows/deploy-pages.yml .nojekyll scripts/publish-github-pages.sh
git commit -m "Update website"
git push
```

GitHub Actions 会自动重新发布。

## 隐私提醒

GitHub Pages 页面默认是公开网页。`config.js`、前端密码、公开照片和音乐都不应被当作真正保密内容。

如果只想让 Lili 能访问，可以继续保留当前页面暗号作为轻量入口；如果需要真正权限控制，应使用带登录鉴权的托管方案，而不是纯静态 GitHub Pages。

## 旧 CloudBase 发布方式

旧方式仍可作为备用：

```bash
tcb app deploy -f --framework static --install-command "" --build-command "" --output-dir "./" --env-id ading-d1g2dcqrs47be3e97
```
