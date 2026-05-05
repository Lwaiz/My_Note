# Leo's Blog
- 📌 访问网址：👉  [Leo's Blog](https://lwaiz.github.io/My_Note/index.html)  👈
- ✨ 基于 GitHub Pages 搭建的静态个人博客 

- ✨ 配套本地 Flask 写作管理工具

## 📖 项目介绍
本项目分为两部分：
1. /docs 目录：GitHub Pages 静态博客站点（线上展示）

2. /app 目录：本地 Flask 写作工具（用于博客 / 随笔编辑、发布、管理）

一站式解决博客写作、素材管理、线上发布的全流程需求，纯本地操作，安全便捷，自动同步至 GitHub 博客。

## ✨ 功能特性

1. 博客站点
  - 响应式布局，适配电脑 / 手机端
  - 博客文章展示 + 随笔动态发布
  - 个人主页、图片管理、社交链接跳转
  - 统一素材管理，目录规范整洁
  - 支持本地音乐播放器
  - 支持背景切换
2. 本地写作工具
  - 可视化编辑博客 / 随笔，支持 Markdown
  - 图片上传、素材统一管理
  - 一键 Git 同步，自动更新线上博客
  - 自定义图标、跳转链接、悬浮提示

## 📁 项目目录结构

```plaintext
My_Note/                   # Leo's Blog 根目录
├── app/
│     ├── app.py            # 工具主程序
│     ├── .env              # 本地私有配置（不上传）
│     ├── templates
│     │   └── index.html    # 管理前端页面
│     │
│     └── static
│         ├── style.css     # 样式文件
│         └── script.js     # 交互脚本
│
└── docs/                   # GitHub Pages 博客根目录（线上站点）
      ├── assets/            # 博客静态资源目录
      │   ├── background/    # 背景图片素材文件夹
      │   ├── images/        # 博客统一图片资源
      │   ├── app.js         # 博客核心交互脚本
      │   ├── music_player.js # 音乐播放器功能脚本
      │   ├── style.css      # 全局样式文件
      │   └── switch_bg.js   # 背景切换脚本
      │
      ├── notes/             # 博客文章存储目录
      │   ├── images/        # 博客配图素材
      │   ├── *.md           # 博客Markdown文件
      │   └── posts.json     # 博客索引配置文件
      │
      ├── pyq/               # 随笔内容存储目录
      │   ├── images/        # 随笔配图素材
      │   ├── *.md           # 随笔Markdown文件
      │   └── pyq_list.json  # 随笔索引配置文件
      │
      ├── index.html         # 博客首页
      ├── post.html          # 文章详情页
      ├── profile.html       # 个人主页
      └── pyq.html           # 随笔列表页
│
├── .nojekyll   # 防止 GitHub Pages 忽略以 _ 开头目录
└──README.md    # 使用说明
```

---
## 🚀 使用方法
- 打开Github仓库设置，启用 GitHub Pages，选择 `docs/` 文件夹作为发布源。
- 可直接使用 app 功能进行博客、随笔的本地写作，再通过集成的 Git 操作上传至 Github。等待 1min 左右刷新页面更新。
- 也可通过以下操作手动处理博客、随笔。

### 1. 博客写作

1. 将 Markdown 文件 `template.md` 放到 `docs/notes/`文件夹内。
2. 如果有图片资源
    - 在 `docs/notes/images/`文件夹下新建的 Markdown 同名文件夹 `template`。
    - 将 Markdown 中的图片资源 `image.png` 放到 `docs/notes/images/template` 文件夹下。
    - Markdown文件中图片加载路径设置为 `![image.png](images/template/image.png)`

3. 在 `docs/notes/posts.json` 中添加对应文章索引：

    ```json
    {
      "slug": "template",        // 与Markdown文件同名
      "title": "文章标题",        // 在主页文章列表展示
      "description": "文章摘要",  // 在主页文章列表展示
      "date": "2026-05-01"       // 文章发布时间
    }
    ```

4. 提交到 GitHub 仓库，等待 1min 左右刷新页面更新。

**注意**
- 可直接在本地打开 `docs/index.html` 直接查看，也可以使用本地静态服务器预览。
- 需要手动在 `posts.json` 中维护文章索引；这是因为 GitHub Pages 静态网站无法自动列出目录内容。
- 文章文件名应与 `slug` 对应，例如：`hello-world.md` 对应 `slug: "hello-world"`。

### 2. 随笔写作

1. 将 Markdown 文件 `20260501_1200_pyq.md` 放到 `docs/notes/`文件夹内。
2. 如果有图片资源
    - 在 `docs/notes/images/` 文件夹下新建文件夹 `20260501_1200`。
    - 将图片放置在 `docs/notes/images/20260501_1200` 文件夹下。(图片会自动按照九宫格排列)
3. 在 `docs/notes/posts.json` 中添加对应文章索引：

    ```json
    {
      "file": "20260501_1200_pyq.md",  // 用于索引md文件
      "timeCode": "20260501_1200",     // 用于展示时间戳
      "content": "",
      "images": [                      // 用于索引图片资源
                 "image_1.jpg", 
                 "image_2.png"
                ]
    }
    ```

4. 提交到 GitHub 仓库，等待 1min 左右刷新页面更新。

### 🌐 博客部署说明
- 本项目已配置 GitHub Pages，站点根目录为 /docs
- 推送代码至 GitHub 后，自动部署更新
- 访问地址：你的 GitHub Pages 链接

## 🛠️ 技术栈
- 前端：HTML5 + CSS3 + JavaScript（实现动态背景、音乐播放器、响应式布局）
- 本地写作：Python Flask（本地写作工具，提供可视化编辑与 Git 同步功能）
- 部署：GitHub Pages
- 版本控制：Git