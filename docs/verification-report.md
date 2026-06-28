# 验收记录

## 构建

- `npm run build`：通过。
- 本地运行：`npm run dev -- --host 127.0.0.1 --port 4173`。

## 第 04 章居中数据

| 视口 | 舞台中心 | 容器中心 | 偏差 | 横向溢出 | ScrollTrigger |
|---|---:|---:|---:|---:|---:|
| 360x800 | 180 | 180 | 0 | 0 | 25 |
| 375x812 | 187.5 | 187.5 | 0 | 0 | 25 |
| 390x844 | 195 | 195 | 0 | 0 | 25 |
| 430x932 | 215 | 215 | 0 | 0 | 25 |
| 768x1024 | 384 | 384 | 0 | 0 | 25 |
| 1366x768 | 683 | 683 | 0 | 0 | 55 |
| 1440x900 | 720 | 720 | 0 | 0 | 55 |
| 1920x1080 | 960 | 960 | 0 | 0 | 55 |

## UI 与音乐播放器

- 390x844 手机端：音乐按钮可见。
- 音乐按钮矩形：`left 328, top 462.6, right 378, bottom 512.6`。
- 章节抽屉矩形：`left 0, top 523.3, right 390, bottom 844`。
- 抽屉与音乐按钮重叠：`false`。
- 横向溢出：`0`。

## 截图

- `docs/screenshots/after/chapter-04/chapter-04-390x844.png`
- `docs/screenshots/after/chapter-04/chapter-04-1440x900.png`
- `docs/screenshots/after/ui/mobile-story-shell.png`
- `docs/screenshots/after/ui/mobile-chapter-drawer-stable.png`
- `docs/screenshots/after/ui/desktop-audio-and-shell.png`

## 修改摘要

- 第 04 章从视口宽度居中改为容器内结构居中。
- SVG 增加 `preserveAspectRatio="xMidYMid meet"`。
- 第 04 章动画恢复为铁窗、晨光、桥索、红线路径、标题落位的完整时序。
- 新增 story shell 顶部 UI 和手机章节抽屉。
- 核心正文、章节顺序、史料来源、AI 辅助说明、音乐播放器逻辑均未改动。

