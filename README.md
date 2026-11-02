# Personal Homepage

基于 [Astro](https://astro.build) 的个人学术主页，推送到 GitHub 后由 GitHub Actions 自动构建并部署到 GitHub Pages。

## 本地开发

```sh
npm install        # 第一次
npm run dev        # http://localhost:4321，改内容会自动刷新
npm run check      # 类型和内容格式检查（CI 也会跑）
npm run build      # 生成 dist/
```

需要 Node.js 22 或更新版本（推荐 24），具体要求见 `package.json` 的 `engines`。

## 日常更新：改哪个文件

| 想做的事 | 改这里 |
|---|---|
| 姓名、简介、研究方向、邮箱、社交链接、头像、CV PDF | `src/site.config.ts` |
| 主色、首页 banner 图、动画开关 | `src/site.config.ts` 里的 `theme` |
| 加一篇论文 | `src/content/publications.yaml` 加一条，主图放进 `src/content/figures/` |
| 加一个研究项目 | `src/content/projects/<id>.md` 新建一个文件 |
| 写博客 | `src/content/posts/<slug>.md` 新建一个文件 |
| 教育、科研、实习、助教经历 | `src/content/experience.yaml` |
| 首页动态（News） | `src/content/news.yaml` |
| 其他颜色、字体、圆角 | `src/styles/global.css` 顶部的变量 |
| 图片、PDF 等静态文件 | 放进 `public/`，用 `/文件名` 引用 |

改完后 `git push`，大约一分钟后网站更新。字段写错时 `npm run check` 和 CI 会直接报出哪个文件哪个字段有问题。

### 论文（publications.yaml）

```yaml
- id: lastname2026keyword        # 唯一，用作锚点
  title: "Paper Title"
  image: ./figures/lastname2026keyword.png   # 可选，论文主图，相对 publications.yaml 的路径
  authors: ["Your Name*", "Co Author*", "Advisor"]   # 名字会按 site.config.ts 里的 authorNames 自动加粗
  equalContribution: true        # 有共同一作时显示 "* Equal contribution"
  venue: "International Conference on ..."
  venueShort: "ICML 2026"        # 左侧徽章
  year: 2026
  type: conference               # conference | journal | workshop | preprint | thesis | other
  selected: true                 # 显示在首页
  award: "Oral"                  # 可选
  project: example-project       # 可选，关联到 projects/ 下的项目
  links: { arxiv: "...", pdf: "...", code: "...", slides: "...", video: "...", poster: "...", doi: "...", project: "..." }
  bibtex: |                      # 可选，页面上会有 BibTeX 展开/复制按钮
    @inproceedings{...}
```

**论文主图**：把图（PNG / JPG / WebP / SVG）放进 `src/content/figures/`，在条目里写 `image: ./figures/文件名`。列表里会显示 16:10 的缩略图，点击可以放大查看。构建时会自动压缩成 WebP，原图直接放高清版即可。建议选横向、白底、在小尺寸下也能看清的图，一般是方法总览图（teaser 或 Figure 1）。没有配图的论文会显示一个会议名色块，在手机上则直接隐藏。

### 项目（projects/*.md）

文件名就是网址：`projects/my-project.md` 对应 `/projects/my-project/`。front matter 里的 `summary` 和 `contributions` 会显示在卡片上，正文是详情页。`featured: true` 会显示在首页，`order` 越小越靠前。图片可以放在 md 旁边用相对路径引用，也可以设置 `cover: ./cover.png` 作为封面。

### 博客（posts/）

一篇文章可以是单个文件 `posts/my-post.md`，也可以是文件夹 `posts/my-post/index.md`，图片放在同一个文件夹里用相对路径引用。两种写法的网址都是 `/blog/my-post/`。

```yaml
---
title: 标题
description: 一句话摘要（列表、文章页和 RSS 会用到）
date: 2026-01-01
tags: [research]
cover: ./cover.jpg   # 可选，封面图，也会作为分享链接时的预览图
toc: true            # 宽屏时在右侧显示目录（至少两个 ## 或 ### 标题时才出现）
draft: true          # 草稿：本地 dev 能看到，正式构建不发布
---
```

文章页会自动加上：阅读时长（中文按字数估算）、顶部阅读进度条、右侧目录（滚动时高亮当前小节）、标题旁的 `#` 锚点链接、代码块复制按钮，以及上一篇/下一篇。博客列表最新一篇显示为大卡片，可以按标签筛选，也可以通过 `/blog/?tag=xxx` 直接链接到某个标签。

旧的 Hexo 文章基本可以直接复制进 `src/content/posts/`，只需确认 front matter 里有 `title` 和 `date`，并删除 Hexo 专用的标签语法（如 `{% ... %}`）。

## 个性化：主色、banner 和动画

`src/site.config.ts` 里的 `theme`：

- `accent`：主色。默认 `'auto'`，构建时从 banner 图里自动提取（见下文）；也可以手动指定 `{ light: '#1f5f8b', dark: '#7db7e0' }`。浅色背景、卡片悬停边框等都会根据主色自动计算。
- `accentFallback`：`accent` 为 `'auto'` 但没有 banner 图、或图片基本是灰色时使用的主色。
- `banner.image`：首页顶部的横幅图。把图片放进 `src/assets/`，填文件名（如 `'banner.jpg'`）。建议尺寸 2400×800 左右，构建时会自动生成多种尺寸。填 `''` 则显示缓慢流动的主色渐变。`banner.height` 是桌面端高度，`banner.position` 控制裁切时保留图片的哪一部分。深色模式下 banner 会自动调暗。
- **动态 SVG banner**：`banner.image` 也可以填 `.svg`，例如默认的 `lab-banner.svg`（扁平风格的机器人 + 生物实验室：机械臂从传送带抓取样品管架放进料箱；3D 打印机、离心机、磁力搅拌器、DNA 双螺旋海报、遥测曲线等也会动，另外还有显微镜、培养皿、试管架、试剂瓶）。SVG 会直接内联进页面，所以它自带的 CSS 动画能播放，深色模式下会切换成夜间配色。场景按 banner 高度缩放并居中：宽屏时，画在 viewBox 以外的墙面和桌面会继续往两侧延伸；手机上则裁掉两侧。banner 滚出屏幕后动画会暂停；`motion: false` 或访客开启了“减少动态效果”时，只显示静态画面。这张图由 `scripts/lab-banner.mjs` 生成，机械臂的关节角是用逆运动学算出来的。要改布局、配色或动作，就改这个脚本，再运行 `node scripts/lab-banner.mjs`（深色模式的颜色在脚本 `<style>` 里 `k-*` 类的第二组）。
- `motion`：滚动渐入、页面切换过渡、banner 视差等动画的总开关。系统设置了“减少动态效果”的访客不会看到这些动画。

**主色自动适配 banner**（`src/lib/palette.ts`）：构建时把 banner 缩小，在感知均匀的 OKLCH 色彩空间里按色相统计，选出面积和饱和度综合最突出的颜色。然后保留这个色相，分别为浅色和深色模式调整亮度，直到它作为文字颜色时和页面背景的对比度达到 WCAG AA 标准（≥ 4.5:1），保证链接始终清晰可读。因此提取出的颜色会比图片里的原色更深（浅色模式）或更浅（深色模式）。黄色这类本身很亮的颜色在白底上会变成橄榄色，这是为了可读性而做的取舍；如果不喜欢，可以改为手动指定主色。构建日志里会打印选出的颜色，例如 `[theme] accent from banner.jpg: light #2c7498, dark #72a6c4`，看中了也可以直接把这两个值填进 `accent` 固定下来。

字体在 `src/styles/global.css` 顶部的 `--font-sans`、`--font-serif` 中修改。标题和名字用的是衬线字体 `--font-serif`。

动画都写在 `global.css` 的 “Motion” 部分。想让某个元素滚动到视口时渐入，给它加 `data-reveal` 属性即可；想要卡片悬停上浮，加 `class="lift"`。

## 常见问题

- **改了 `content.config.ts` 的字段后，新字段在 `npm run dev` 里不生效**：停掉 dev server，删除 `.astro` 文件夹，再重新运行 `npm run dev`。正式构建不受影响。

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库，推荐命名为 `<你的用户名>.github.io`（网址就是 `https://<用户名>.github.io`）。
2. 修改 `astro.config.mjs` 里的 `SITE` 和 `BASE`：
   - 仓库名是 `<用户名>.github.io`：`SITE = 'https://<用户名>.github.io'`，`BASE = '/'`
   - 仓库名是其他名字，比如 `homepage`：`BASE = '/homepage'`
   - 用自定义域名：`SITE = 'https://你的域名'`，`BASE = '/'`，并新建 `public/CNAME`，内容写域名
3. 仓库 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。
4. 推送到 `main` 分支，`.github/workflows/deploy.yml` 会自动构建和发布。

## 目录结构

```
src/
  site.config.ts          个人信息
  content.config.ts       各类内容的字段定义（schema）
  content/                所有内容（日常只需要改这里）
  components/             页面组件（论文条目、项目卡片、时间线等）
  layouts/BaseLayout.astro  通用页面框架、SEO、深色模式
  pages/                  路由：/、/publications、/projects、/blog、/cv、/rss.xml
  lib/                    工具函数和内容排序
  styles/global.css       全局样式和配色
  assets/                 banner 等需要构建时处理的图片
scripts/lab-banner.mjs    生成动态 banner（lab-banner.svg）
public/                   原样复制到网站根目录的文件
```
