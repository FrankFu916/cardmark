# 推广渠道与文案

> 发布节奏建议：先 V2EX + 掘金（中文技术社区，对 CLI 工具最友好），
> 24 小时后 Reddit r/markdown + r/commandline，同步发 X/推特 thread。
> 工作日上午 10-11 点（北京时间）发布效果最好。

## 1. V2EX（分享创造节点）

**标题**：CardMark — 一条命令把 Markdown 变成好看的分享卡片（中日韩 + emoji 全支持）

**正文**：

写完一段笔记，想发小红书/推特，排版总是很麻烦。做了个工具 CardMark，把 Markdown 直接渲染成社交平台尺寸的卡片图：

```bash
npx cardmark note.md -t matcha -f png -o card.png
```

- 10 个主题、6 个平台尺寸（X / OG / 小红书 3:4 / Instagram / Story / 方图）
- 中日韩字体按需下载自动缓存，日文韩文有专门字体组，混排用 --font-set cjk-all
- emoji 渲染成 Twemoji 矢量，导出 PNG 不糊不丢
- 内容超长自动缩小适配，不会裁切
- --split 可以把一篇长文按 --- 切成多张卡片（做图文串很好用）
- 纯 SVG 渲染，无 headless browser，安装只有 3 个依赖

在线版（无需安装）：https://frankfu916.github.io/cardmark/
GitHub：https://github.com/FrankFu916/cardmark
npm：https://www.npmjs.com/package/cardmark

开源 MIT，欢迎提 issue / PR。求 star ✨

## 2. 掘金

**标题**：开源了一个 Markdown 转卡片图工具：一行命令，笔记变海报

**正文**：（V2EX 版本基础上增加技术细节章节）

技术栈：marked 解析 → satori 生成 SVG（文字转矢量路径）→ resvg 转 PNG。

几个踩过的坑值得分享：

1. satori 按字体名+字重索引字体，注册两个同名文件会导致 CJK 缺字回退失效
2. satori 的 opentype 解析器不支持 .ttc 集合，只能用 .ttf/.otf/.woff 单文件
3. emoji 靠 loadAdditionalAsset 钩子内联 Twemoji data URI，这样 SVG 自包含，resvg 光栅化不丢图
4. 国旗 emoji 是两个 regional indicator 组合，不属于 Extended_Pictographic，正则要单独匹配 \p{RI}
5. 矮尺寸卡片（OG 1200x630）内容溢出问题：先无高度测量一次内容高度，超出就整体 transform: scale

（然后放功能列表 + 截图 + 链接，同上）

## 3. Reddit

**r/markdown / r/commandline / r/webdev**：

**Title**: CardMark — turn Markdown into beautiful share-ready card images (PNG/SVG) from the CLI. CJK + emoji support, no headless browser.

I built a tool that renders Markdown notes as social-media-sized cards: `npx cardmark note.md -t matcha -f png`. 10 themes, 6 platform presets (X, OG, Xiaohongshu, Instagram, Story), on-demand Noto font downloads with caching, Twemoji inlined as vectors so emoji survive PNG export, auto-fit scaling for long content, and a `--split` mode that turns one file into a card deck. Pure SVG pipeline (satori + resvg), only 3 deps, no Puppeteer.

Try online: https://frankfu916.github.io/cardmark
Source: https://github.com/FrankFu916/cardmark

Feedback welcome — what would make you actually use this?

## 4. X / Twitter thread 骨架

**Tweet 1**：I kept losing nice Markdown notes in .md files nobody reads.

So I built CardMark: one command turns them into share-ready cards.

npx cardmark note.md -t matcha -f png

10 themes. CJK + emoji. Zero browser. Open source 🧵

**Tweet 2**：（截图：同一内容 4 个主题对比图）
Same note, 4 themes. All rendered as pure SVG — no headless Chrome, no font setup.

**Tweet 3**：（截图：小红书/story 尺寸）
Every platform size preset: X, OG cards, Xiaohongshu 3:4, Instagram, Story 9:16. Long content auto-shrinks to fit.

**Tweet 4**：（截图：三语卡片）
Chinese, Japanese, Korean — dedicated Noto font sets, downloaded on demand and cached. Flags and ZWJ emoji render as inline Twemoji vectors.

**Tweet 5**：Try it without installing:
https://frankfu916.github.io/cardmark

GitHub: https://github.com/FrankFu916/cardmark
Star if useful ⭐

## 5. 小红书 / 即刻（可选，偏生活化）

标题：程序员的浪漫：把笔记一键变成小红书图
正文：写了个开源小工具，Markdown 粘进去直接出图，10 个配色、尺寸全配好。发学习笔记/书摘超级方便。免费开源，网页版直接用：frankfu916.github.io/cardmark

## 6. awesome 列表投稿（PR 模板）

目标列表（按优先级）：

- sindresorhus/awesome-markdown → Tools 部分
- matiassingers/awesome-readme
- awesome-selfhosted（如果后续加 server 模式）
- 中文：awesome-cheatsheets / 各语言 awesome 仓库的工具区

**PR 描述**：

Adds [CardMark](https://github.com/FrankFu916/cardmark) — a CLI + JS library that turns Markdown into beautiful share-ready card images (PNG/SVG). 10 themes, social platform size presets, CJK & emoji support, pure SVG rendering without a headless browser. MIT licensed. Online demo: https://frankfu916.github.io/cardmark

建议条目格式（awesome-markdown）：

```markdown
- [CardMark](https://github.com/FrankFu916/cardmark) - Turn Markdown into beautiful shareable card images (PNG/SVG). CLI + library, CJK & emoji ready. ![Open-Source Software][OSS]
```

## 7. GitHub Trending 策划

Trending 算法看：短时 star 增速 + 独立 star 用户数。发布日集中引导：

- 所有渠道文案统一放 GitHub 链接（不是 npm 链接）
- 请朋友/同事在发布当天 star（真实账号，勿刷）
- README 首屏即在线 demo 链接 + hero 图，降低跳出率
- 发布时间选北京时间周二/周四上午（欧美还在周一下午，双时区覆盖）

## 8. 后续内容营销（每周 1-2 条）

- 「用 CardMark 做读书笔记卡片」教程（小红书/即刻）
- 「satori 踩坑记」技术文（掘金/知乎，吸引贡献者）
- 每个新主题/字体组发一条 X 展示图
- GitHub Discussions 开 Show and tell 板块，让用户晒卡片
