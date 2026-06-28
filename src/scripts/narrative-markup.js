import { assetUrl, imageAttributes } from "./asset-loader.js";

export function renderNarrativeBlock(chapter) {
  if (chapter.id === "archive") return renderArchiveDevelop();
  if (chapter.id === "three-days") return renderHistoryTimeline();
  if (chapter.id === "city-answer") return renderBarsToBridge();
  if (chapter.id === "ordinary-life") return renderCityRoute();
  return null;
}

export function renderFinalLetterUnfold(chapter) {
  const section = document.createElement("div");
  section.className = "narrative-slot narrative-slot--letter";
  section.dataset.narrative = "final-letter";
  section.innerHTML = `
    <div class="ngl-letter-stage" data-narrative-stage="letterUnfold">
      <div class="ngl-letter-dawn" aria-hidden="true"></div>
      <article class="ngl-letter-shell" aria-label="完整回信展开">
        <div class="ngl-letter-fold ngl-letter-fold--top" aria-hidden="true"></div>
        <div class="ngl-letter-fold ngl-letter-fold--bottom" aria-hidden="true"></div>
        <svg class="ngl-letter-thread" viewBox="0 0 38 680" aria-hidden="true">
          <path d="M19 8 C11 78 27 132 18 204 C10 280 28 354 18 430 C8 514 28 594 19 672" />
        </svg>
        <div class="ngl-letter-content">
          <p class="ngl-letter-kicker">致未能看见黎明的人</p>
          ${chapter.letter.map((line) => `<p>${line}</p>`).join("")}
        </div>
      </article>
    </div>
  `;
  const paper = chapter.assets.find((asset) => asset.role === "paper");
  if (paper) {
    section.querySelector(".ngl-letter-shell")?.style.setProperty("--paper-image", `url("${assetUrl(paper.src)}")`);
  }
  return section;
}

function renderArchiveDevelop() {
  const block = document.createElement("div");
  block.className = "narrative-slot narrative-slot--archive";
  block.dataset.narrative = "archive-develop";
  block.innerHTML = `
    <figure class="ngl-archive-develop" data-narrative-stage="archiveDevelop" data-archive-id="he-jingping-poetry">
      <div class="ngl-archive-develop__frame">
        <div class="ngl-archive-develop__emulsion" aria-hidden="true"></div>
        <div class="ngl-archive-develop__scan" aria-hidden="true"></div>
        <img
          class="ngl-archive-develop__image"
          alt="何敬平诗作或铁窗诗社相关展陈"
          ${imageAttributes("01_History_Archive/he-jingping-poetry.webp", {
            sizes: "(max-width: 767px) calc(100vw - 64px), 720px"
          })}
        />
        <div class="ngl-archive-develop__grain" aria-hidden="true"></div>
      </div>
      <figcaption class="ngl-archive-develop__caption">
        <span class="ngl-archive-develop__label">档案影像</span>
        <strong>何敬平诗作 / 铁窗诗社相关展陈</strong>
        <span>来源：何敬平烈士授权史料素材包</span>
      </figcaption>
    </figure>
  `;
  return block;
}

function renderHistoryTimeline() {
  const block = document.createElement("div");
  block.className = "narrative-slot narrative-slot--timeline";
  block.dataset.narrative = "history-timeline";
  block.innerHTML = `
    <div class="ngl-history-timeline" data-narrative-stage="timeline" aria-label="1948至2026时间轴">
      <div class="ngl-history-timeline__year"><span data-year-counter>1948</span><small>YEAR</small></div>
      <svg class="ngl-history-timeline__svg" viewBox="0 0 1000 620" role="img" aria-label="从1948到2026的时间轴">
        <defs>
          <filter id="nglTimelineGlow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path class="ngl-history-timeline__base" d="M118 520 C170 434 226 434 278 360 C338 274 408 286 470 216 C542 136 632 166 704 116 C790 58 862 72 920 42" />
        <path class="ngl-history-timeline__progress" d="M118 520 C170 434 226 434 278 360 C338 274 408 286 470 216 C542 136 632 166 704 116 C790 58 862 72 920 42" />
        <g class="ngl-history-node" data-node-year="1948" transform="translate(152 502)">
          <circle r="13" /><text x="24" y="-18">1948</text><text x="24" y="18">狱中诗作</text>
        </g>
        <g class="ngl-history-node ngl-history-node--long" data-node-year="1949" transform="translate(326 358)">
          <circle r="16" /><text x="24" y="-18">1949.11.27</text><text x="24" y="20">黎明之前</text>
        </g>
        <g class="ngl-history-node" data-node-year="1950" transform="translate(544 224)">
          <circle r="13" /><text x="24" y="-18">1949.11.30</text><text x="24" y="18">重庆解放</text>
        </g>
        <g class="ngl-history-node ngl-history-node--final" data-node-year="2026" transform="translate(862 88)">
          <circle r="17" /><text x="-170" y="-18">2026</text><text x="-170" y="20">回信的人到了</text>
        </g>
      </svg>
      <ol class="ngl-history-timeline__mobile-list" aria-hidden="true">
        <li><time>1948</time><span>狱中诗作</span></li>
        <li><time>1949.11.27</time><span>黎明之前</span></li>
        <li><time>1949.11.30</time><span>重庆解放</span></li>
        <li><time>2026</time><span>回信的人到了</span></li>
      </ol>
      <p class="ngl-history-timeline__ending">时间没有替他们回答。答案来到我们脚下的路里。</p>
    </div>
  `;
  return block;
}

function renderBarsToBridge() {
  const block = document.createElement("div");
  block.className = "narrative-slot narrative-slot--bridge";
  block.dataset.narrative = "bars-bridge";
  block.innerHTML = `
    <div class="ngl-bridge-stage" data-narrative-stage="barsBridge" aria-label="铁窗变桥索动画">
      <div class="ngl-stage-noise" aria-hidden="true"></div>
      <div class="ngl-bridge-copy ngl-bridge-copy--before" aria-hidden="true"><span>铁窗</span><strong>竖线仍在黑暗里</strong></div>
      <div class="ngl-bridge-copy ngl-bridge-copy--after"><span>2026 重庆</span><strong>线条成为桥索，路向城中展开</strong></div>
      <svg class="ngl-bridge-svg" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="铁窗线条转化为桥索">
        <rect class="ngl-bridge-wall" width="1000" height="620" />
        <g class="ngl-window-frame">
          <rect x="245" y="92" width="510" height="430" />
          <line x1="245" y1="206" x2="755" y2="206" />
          <line x1="245" y1="388" x2="755" y2="388" />
        </g>
        <g class="ngl-bridge-dawn">
          <rect width="1000" height="620" />
          <circle class="ngl-bridge-sun" cx="794" cy="154" r="56" />
          <path class="ngl-bridge-hills" d="M0 430 C130 342 214 432 342 350 C486 258 592 416 718 318 C840 224 918 310 1000 266 L1000 620 L0 620 Z" />
          <path class="ngl-bridge-river" d="M0 520 C170 478 246 548 392 504 C552 456 640 526 786 482 C884 454 942 464 1000 446 L1000 620 L0 620 Z" />
        </g>
        <g class="ngl-bridge-structure">
          <line class="ngl-morph-line" x1="285" y1="110" x2="285" y2="500" data-x1="342" data-y1="162" data-x2="240" data-y2="408" />
          <line class="ngl-morph-line" x1="365" y1="110" x2="365" y2="500" data-x1="380" data-y1="162" data-x2="336" data-y2="395" />
          <line class="ngl-morph-line" x1="445" y1="110" x2="445" y2="500" data-x1="418" data-y1="162" data-x2="430" data-y2="388" />
          <line class="ngl-morph-line" x1="555" y1="110" x2="555" y2="500" data-x1="582" data-y1="162" data-x2="570" data-y2="388" />
          <line class="ngl-morph-line" x1="635" y1="110" x2="635" y2="500" data-x1="620" data-y1="162" data-x2="664" data-y2="395" />
          <line class="ngl-morph-line" x1="715" y1="110" x2="715" y2="500" data-x1="658" data-y1="162" data-x2="760" data-y2="408" />
          <path class="ngl-draw-path" d="M218 424 C372 360 608 360 782 424" />
          <path class="ngl-draw-path" d="M260 452 C422 414 574 414 742 452" />
          <path class="ngl-draw-path" d="M212 484 L788 484" />
        </g>
      </svg>
    </div>
  `;
  return block;
}

function renderCityRoute() {
  const block = document.createElement("div");
  block.className = "narrative-slot narrative-slot--city-route";
  block.dataset.narrative = "city-route";
  block.innerHTML = `
    <div class="ngl-city-route" data-narrative-stage="cityRoute" aria-label="有路走城市路线">
      <div class="ngl-city-route__copy">
        <span>回信之二</span>
        <h3>我们有路走</h3>
        <p>暗红路线沿着生活场景延伸，穿过早餐、街道、轨道、社区与夜归的人。</p>
      </div>
      <svg class="ngl-city-route__svg" viewBox="0 0 1000 620" role="img" aria-label="城市生活路线图">
        <defs>
          <filter id="nglRouteGlow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path class="ngl-city-route__road" id="nglCityRoutePath" d="M86 520 C122 458 172 472 215 432 C257 392 286 330 346 342 C420 355 410 444 492 436 C570 429 562 340 640 344 C722 348 724 453 812 438 C866 428 891 378 934 338" />
        <circle class="ngl-route-runner" cx="86" cy="520" r="11" />
        <g class="ngl-route-node" transform="translate(86 520)"><circle r="14" /><text x="22" y="-16">早餐店</text><text x="22" y="16">一天开始</text></g>
        <g class="ngl-route-node" transform="translate(346 342)"><circle r="14" /><text x="22" y="-16">街道</text><text x="22" y="16">人声经过</text></g>
        <g class="ngl-route-node" transform="translate(492 436)"><circle r="14" /><text x="22" y="-16">轨道</text><text x="22" y="16">通向校园</text></g>
        <g class="ngl-route-node" transform="translate(640 344)"><circle r="14" /><text x="22" y="-16">社区</text><text x="22" y="16">灯照窗前</text></g>
        <g class="ngl-route-node" transform="translate(934 338)"><circle r="14" /><text x="-146" y="-16">夜归的人</text><text x="-146" y="16">路还在延伸</text></g>
        <path class="ngl-city-bridge" d="M604 426 C672 372 756 372 830 426" />
      </svg>
      <ol class="ngl-city-route__mobile-list" aria-hidden="true">
        <li><span>早餐店</span><small>一天开始</small></li>
        <li><span>街道</span><small>人声经过</small></li>
        <li><span>轨道</span><small>通向校园</small></li>
        <li><span>社区</span><small>灯照窗前</small></li>
        <li><span>夜归的人</span><small>路还在延伸</small></li>
      </ol>
    </div>
  `;
  return block;
}
