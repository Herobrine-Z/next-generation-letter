# 音乐播放 UI 保护清单

## 文件与节点

- DOM：`index.html` 中 `button.audio-player.audio-toggle.js-only`。
- 样式：`src/styles/components.css` 中 `.audio-player`、`.audio-player__disc`、`.audio-player__label`、`.audio-player__hole`、`.audio-player.is-playing`；`src/styles/responsive.css` 中既有尺寸规则。
- 逻辑：`src/scripts/audio-controller.js`。
- class/id/data：未修改音乐播放器 class、id、data 属性。
- z-index：`.audio-player` 仍为 `22`。
- 位置：仍由 `audio-controller.js` 中 Draggable 与本地存储控制，未移动、未重新包裹。

## 本次结果

- 未修改 `src/scripts/audio-controller.js`。
- 未修改 `index.html` 中 `.audio-player` DOM。
- 未修改 `.audio-player*` 选择器声明。
- 新增 `story-shell` 使用 `z-index: 21`，低于音乐播放器。
- 手机章节抽屉收短为 `max-height: min(38dvh, 360px)`；390x844 验收中音乐按钮与抽屉几何重叠为 `false`。

