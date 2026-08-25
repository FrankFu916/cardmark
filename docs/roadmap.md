# CardMark Roadmap

> 优先级原则：先做「让用户留下来」的（编辑器体验、导出质量），再做「让用户多起来」的（生态、集成）。
> 每个版本聚焦一个主题，避免摊大饼。

## v0.3.x — 编辑器体验（拉新转化，预计 1-2 周）

在线编辑器是 star 转化的第一触点，先把这里做到「哇」。

- [ ] **代码语法高亮**（shiki 主题子集，按 theme 配色映射）— 技术用户的第一眼卖点
- [ ] **主题实时缩略图**：主题 chip 上直接显示该主题的迷你预览，不用逐个点击试
- [ ] **本地持久化**：内容/主题/字体选择存 localStorage，刷新不丢
- [ ] **分享链接**：内容压缩进 URL hash（`?md=…&theme=…`），一键把编辑好的卡片发给朋友
- [ ] **键盘快捷键**：Cmd+Enter 导出 PNG、Cmd+K 命令面板
- [ ] 移动端适配（响应式布局，手机上也能改字导出）

## v0.4.x — 渲染能力（深度用户留存）

- [ ] **图片嵌入** `![alt](url)`（http(s) 拉取 + data URI 内联，SVG 保持自包含）
- [ ] **表格增强**：列宽自适应、斑马纹优化
- [ ] **脚注 / 任务列表**（- [x]）支持
- [ ] **自定义字体上传**：编辑器拖入 .ttf/.woff 直接用（FileReader → ArrayBuffer，无需服务器）
- [ ] **水印模式**：平铺淡色水印，防搬运场景
- [ ] 批量导出：多卡片 zip 打包下载

## v0.5.x — 生态集成（传播放大器）

- [ ] **GitHub Action**：`uses: cardmark-labs/cardmark-action@v1`，README 徽章/发布笔记自动渲染
- [ ] **Figma 插件**：设计师人群导入 Markdown 卡片
- [ ] **Raycast / Alfred 扩展**：剪贴板 Markdown 一键出图
- [ ] **VS Code 插件**：编辑器内预览 + 导出
- [ ] **MCP Server**：AI 编辑器（Cursor 等）里让 Agent 直接生成卡片图 — 顺 AI 流量
- [ ] OG 图片服务模式（可选自托管 server）：`https://your-host/og?md=…` 直接当博客 meta 图

## v0.6+ — 平台化探索

- [ ] 模板市场：用户提交主题/布局 JSON，社区投票
- [ ] 多卡片布局：2x2 拼图、长图拼接模式
- [ ] 动画导出（SVG SMIL / GIF，做动态卡片）
- [ ] i18n 编辑器界面（en/zh/ja/ko）

## 技术优化清单（穿插进行）

| 项           | 现状                   | 动作                                                              |
| ------------ | ---------------------- | ----------------------------------------------------------------- |
| 首次渲染速度 | CDN 字体串行下载 ~2-7s | 字体子集化（只打包用到的字形）或 preload 提示；编辑器加骨架屏     |
| bundle 体积  | 主 chunk 614KB         | satori 动态 import（首屏只加载编辑器，输入后才加载渲染引擎）      |
| 测试覆盖     | 35 个单测              | 补 layout 快照测试（每个主题/尺寸 golden file）                   |
| 错误上报     | 无                     | 编辑器加轻量错误采样（自愿提交，无第三方 SDK）                    |
| 无障碍       | 基础 aria              | 对比度审计、焦点管理                                              |
| SEO          | Pages 无 meta          | 编辑器 index.html 加 og meta + JSON-LD（用 CardMark 自己生成 😄） |

## 运营节奏

- **每周**：1-2 条内容（见 docs/promotion.md §8），回复所有 issue < 24h
- **每两周**：一个 minor 版本，changelog 写进 GitHub Release
- **每月**：看 npm 下载数 + Pages 访问，找留存点；在 Discussions 办「卡片挑战」（用 CardMark 做某主题卡片，点赞最高送定制主题）
- **里程碑**：100 star → 发 V2EX 二次更新帖；500 star → 申请 awesome 列表收录 + 域名（cardmark.app 之类）；1000 star → 考虑 OpenCollective
