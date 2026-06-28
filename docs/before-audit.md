# 修改前项目审计

## 项目结构

- 技术栈：Vite 7、原生 HTML/CSS/JS、GSAP 3.13。
- 页面入口：`index.html`，主逻辑入口为 `src/scripts/main.js`。
- GSAP 导入：npm 包导入；`src/scripts/gsap-setup.js` 单点注册 `ScrollTrigger` 与 `MotionPathPlugin`。
- 第 04 章动画：`src/scripts/narrative-markup.js` 生成 SVG，`src/scripts/narrative-animations.js` 驱动 GSAP 时序，`src/styles/narrative.css` 控制舞台尺寸与响应式。
- 全局 UI：`index.html`、`src/styles/components.css`、`src/styles/responsive.css`、`src/scripts/accessibility.js`、`src/scripts/scroll-scenes.js`。
- 音乐播放 UI：`index.html` 中 `.audio-player`，`src/scripts/audio-controller.js`，`src/styles/components.css` 中 `.audio-player*`，`src/styles/responsive.css` 中既有尺寸规则。
- 资源路径：图片、字体、音频位于 `src/assets/`，经 Vite 打包；音频由 `assetUrl()` 解析。
- 部署基础路径：`vite.config.js` 未设置特殊 `base`，默认相对站点根路径。

## Git 历史

历史中存在第 04 章桥索动画实现，最早见 `3dcbb18 接入GSAP叙事动画与授权诗作素材`。后续 `a17df73 Fix alignment frames redline and responsive assets` 对 `.ngl-bridge-stage` 与移动端 `.ngl-bridge-svg` 做过响应式收窄，当前偏移风险来自舞台使用视口宽度而不是内容容器宽度。

## 修改前风险

- 第 04 章舞台使用 `width: min(1050px, 78vw)`，移动端又使用 `max-width: calc(100vw - 32px)`，容易脱离章节内容容器中心。
- SVG 缺少显式 `preserveAspectRatio="xMidYMid meet"`。
- 第 04 章最终说明文案在动画开始时已经可见，削弱“铁窗到桥索”的转场层次。
- 移动端只有旧圆形章节按钮，缺少稳定的 H5 外壳式章节状态与目录入口。

