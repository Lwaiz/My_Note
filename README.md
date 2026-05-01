# Markdown 博客（GitHub Pages）

这是一个可以直接部署到 GitHub Pages 的静态博客站点。你可以把 Markdown 笔记放到 `docs/notes` 目录，然后通过 `docs/notes/posts.json` 管理文章列表。

## 目录结构

- `docs/index.html` - 文章列表页
- `docs/post.html` - 单文章页面
- `docs/assets/` - 样式与脚本
- `docs/notes/` - 存放 Markdown 笔记和 `posts.json`

## 使用方法

1. 将你的 Markdown 文件放到 `docs/notes/`。
2. 在 `docs/notes/posts.json` 中添加对应文章：

```json
{
  "slug": "your-post-slug",
  "title": "文章标题",
  "description": "文章摘要",
  "date": "2026-05-01"
}
```

3. 提交到 GitHub 仓库。
4. 打开仓库设置，启用 GitHub Pages，选择 `docs/` 文件夹作为发布源。

## 预览

可直接在本地打开 `docs/index.html` 查看，也可以使用本地静态服务器预览。

## 注意

- 需要手动在 `posts.json` 中维护文章索引；这是因为 GitHub Pages 静态网站无法自动列出目录内容。
- 文章文件名应与 `slug` 对应，例如：`hello-world.md` 对应 `slug: "hello-world"`。



## 文件列表
index.html - 文章列表页
post.html - 文章阅读页
style.css - 样式
app.js - Markdown 渲染与页面逻辑
posts.json - 文章目录索引
hello-world.md - 示例 Markdown 文章
.nojekyll - 防止 GitHub Pages 忽略以 _ 开头目录
README.md - 使用说明