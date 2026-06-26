# 《下一代，来信了》

2026 重庆青年写给红岩英烈的一封回信。页面采用 Vite、原生 HTML/CSS/JavaScript、GSAP 与 ScrollTrigger 构建，适合本地浏览、GitHub Pages 部署和 1440px 长图导出。

## 安装与运行

```bash
npm install
npm run dev
npm run build
npm run preview
npm run capture
```

`npm run capture` 会打开 `?capture=1`，导出 `dist/next-generation-letter-1440x31600.png`。

## 修改入口

- 文案、章节、图片 alt、史料说明：`src/scripts/content.js`
- 章节高度：`src/styles/variables.css` 与 `content.js` 中对应 `height`
- 图片焦点：`content.js` 的 `position` 字段，最终写入 `object-position`
- 样式：`src/styles/`
- 动画：`src/scripts/scroll-scenes.js`
- 信封开场：`src/scripts/envelope-intro.js` 与 `src/styles/envelope-intro.css`

## 素材替换

素材位于 `src/assets/`。保留目录和文件名后直接替换即可；图片加载失败会显示同位置占位，不会破坏页面结构。真实照片与 AI 情境图已在 `ASSET_MAP.md` 中区分。

第二批素材已接入校园、普通生活、轨道交通和纪念空间章节。未使用素材及原因记录在 `ASSET_MAP.md`。

## 信封开场

默认从页面顶部进入时播放约 5 秒信封展开开场。支持：

- 点击“跳过开场”
- 按 `Esc`
- `?intro=0`
- `?capture=1`
- 带章节 hash 的链接
- 浏览器恢复到页面中部

减弱动态模式会使用简化过渡，不影响正文阅读。

## GitHub Pages

项目 `vite.config.js` 使用 `base: "./"`，构建后可将 `dist/` 发布到 GitHub Pages。若使用仓库根目录部署，也可提交源码并让 Pages/Actions 执行 `npm run build`。

## AI 与史料边界

本页面不生成英烈正面肖像、不伪造历史档案、不伪造亲笔信。AI 图仅用于象征性场景、转场和视觉氛围；真实照片应保留署名、许可链接和必要备注。

## 移动端测试

重点断点：1440、1024、768、390、375。移动端为单列阅读，正文不小于 16px，右侧章节导航折叠为右下角进度按钮。

## 已知限制

部分章节缺少对应真实人物/手部/实验室照片时，以现有 AI 情境图或开放许可城市照片承载视觉节奏。后续可按 `ASSET_MAP.md` 的建议替换同名素材。
