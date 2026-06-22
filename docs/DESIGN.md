# DESIGN.md

# 移动端电子墨水屏阅读器视觉设计规范

> 目标：为文章阅读器页面建立一套接近 Kindle / 电子墨水屏的移动端视觉体系。它不是普通的「浅色阅读 App」，而是一个安静、克制、纸感、低干扰、长时间阅读友好的移动阅读界面。

---

## 1. 设计目标

### 1.1 产品定位

这是一个用于阅读长文章、笔记、知识内容、文学性文本的移动端阅读器页面。

它应该给用户的第一感受是：

- 像电子书阅读器，而不是新闻 App；
- 像纸面文字，而不是网页排版；
- 像沉浸阅读工具，而不是内容流产品；
- 像低功耗、低刺激、低打扰的电子墨水屏；
- 适合长时间阅读、标注、摘录和回看。

### 1.2 视觉关键词

| 关键词 | 说明 |
|---|---|
| 电子墨水屏 | 黑白灰、低饱和、低刷新感、纸面质感 |
| 纸感 | 暖灰背景、细微颗粒、非纯白、非纯黑 |
| 安静 | 减少按钮、减少卡片、减少装饰 |
| 文学性 | 标题和正文有书籍感，排版留白充足 |
| 长阅读 | 行宽、字号、行距、段距都服务于可读性 |
| 克制 | 不使用强色彩、不使用大面积阴影、不使用玻璃拟态 |
| 工具感 | 支持字体、目录、书签、划线、笔记、进度 |

---

## 2. 核心设计原则

### 2.1 电子墨水屏不是简单黑白

不要把页面做成普通的黑白网页。电子墨水屏的关键是：

1. 背景不是纯白，而是带轻微暖灰的纸面；
2. 文字不是纯黑，而是接近墨色的深灰；
3. 分割线非常轻，不能抢正文注意力；
4. 图标要细、少、弱存在；
5. 图片要灰阶化、低对比、像印在纸上；
6. 页面整体应该有一点点颗粒噪声，但不能脏；
7. 交互反馈尽量像「墨迹变化」，而不是彩色高亮。

### 2.2 阅读优先，功能后置

移动端阅读页只保留最必要的信息：

- 返回；
- 当前文章标题；
- 字体设置；
- 书签；
- 更多操作；
- 正文；
- 阅读进度。

目录、笔记、划线、主题、行距等功能可以通过底部弹层或更多菜单进入，不要常驻挤占阅读空间。

### 2.3 视觉层级要像书页

页面不是「App 首页」，而是「一页正在阅读的书」。

层级顺序：

1. 正文内容；
2. 标题、副标题、作者信息；
3. 当前章节；
4. 引用、图片、重点句；
5. 顶部和底部工具；
6. 其他操作。

正文永远是最重要的视觉主体。

---

## 3. 页面结构

## 3.1 移动端主阅读页

推荐结构：

```text
┌────────────────────────┐
│ Top Bar                │
│ 返回  当前标题...  Aa 书签 更多 │
├────────────────────────┤
│                        │
│ Article Content         │
│                        │
│ 标题                    │
│ 副标题                  │
│ 作者 / 阅读时间          │
│ 正文段落                │
│ 章节标题                │
│ 引用                    │
│ 正文 + 灰阶插图          │
│ 金句 / Pull Quote       │
│ 正文                    │
│                        │
├────────────────────────┤
│ Bottom Progress         │
│ 12%   进度条   第 1/3 节 │
└────────────────────────┘
```

### 3.2 不推荐的移动端结构

移动端不要直接搬桌面版的：

- 左侧目录栏；
- 右侧笔记栏；
- 三栏布局；
- 常驻工具面板；
- 复杂顶部工具栏。

这些内容应该移动到：

- 底部弹层；
- 全屏抽屉；
- 长按菜单；
- 更多菜单。

---

## 4. 视觉基调

## 4.1 色彩系统

整体只使用黑、白、灰，不使用明显彩色。

### 基础色

```css
:root {
  --ink-bg: #f3f1ea;
  --ink-bg-soft: #ebe8df;
  --ink-surface: #f7f5ee;

  --ink-text-primary: #1f1f1b;
  --ink-text-secondary: #55544e;
  --ink-text-tertiary: #7a7870;
  --ink-text-disabled: #aaa79d;

  --ink-border: #d7d3c8;
  --ink-border-soft: #e3dfd4;

  --ink-mark: #d8d4c8;
  --ink-mark-strong: #c9c3b5;

  --ink-shadow: rgba(31, 31, 27, 0.08);
}
```

### 色彩使用规则

| 用途 | 推荐颜色 | 说明 |
|---|---|---|
| 页面背景 | `--ink-bg` | 暖灰纸面，不用纯白 |
| 阅读正文 | `--ink-text-primary` | 深灰接近墨色，不用纯黑 |
| 次级信息 | `--ink-text-secondary` | 作者、阅读时间、章节信息 |
| 辅助说明 | `--ink-text-tertiary` | 时间、提示、弱标签 |
| 分割线 | `--ink-border-soft` | 尽量轻 |
| 划线高亮 | `--ink-mark` | 像灰色铅笔划线 |
| 选中状态 | `--ink-bg-soft` | 不使用蓝色高亮 |

### 禁止使用

- 高饱和蓝色；
- 强烈绿色；
- 渐变背景；
- 彩色按钮；
- 玻璃拟态透明层；
- 大面积纯黑；
- 大面积纯白。

---

## 5. 纸面与电子墨水质感

## 5.1 背景质感

页面背景需要有轻微颗粒感，模拟电子墨水屏 / 纸张。

可以使用 CSS 叠加噪声纹理：

```css
.reader-page {
  background-color: var(--ink-bg);
  background-image:
    radial-gradient(rgba(31, 31, 27, 0.045) 0.5px, transparent 0.5px),
    radial-gradient(rgba(31, 31, 27, 0.025) 0.5px, transparent 0.5px);
  background-size: 6px 6px, 10px 10px;
  background-position: 0 0, 3px 3px;
}
```

注意：颗粒只能是「几乎不可见」，不要变成复古脏纸。

### 5.2 图片处理

文章插图应该统一处理成灰阶低对比。

```css
.article-image {
  filter: grayscale(100%) contrast(0.9) brightness(1.04);
  opacity: 0.88;
  border-radius: 8px;
  mix-blend-mode: multiply;
}
```

图片不要像高清彩色图片浮在页面上，而要像印刷在纸面中。

### 5.3 阴影规则

电子墨水屏视觉不适合明显阴影。

允许：

```css
box-shadow: inset 0 0 0 1px var(--ink-border-soft);
```

避免：

```css
box-shadow: 0 12px 40px rgba(0,0,0,0.2);
```

---

## 6. 字体与排版

## 6.1 字体建议

### 中文正文

优先考虑可读性强的宋体 / 屏显宋体：

```css
font-family:
  "Noto Serif SC",
  "Source Han Serif SC",
  "Songti SC",
  "SimSun",
  serif;
```

### UI 文本

顶部栏、按钮、标签使用更简洁的无衬线字体：

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "PingFang SC",
  "Microsoft YaHei",
  sans-serif;
```

## 6.2 移动端正文排版

```css
.article-body {
  font-size: 18px;
  line-height: 2;
  letter-spacing: 0.02em;
  color: var(--ink-text-primary);
}
```

### 推荐参数

| 元素 | 字号 | 行高 | 字重 | 说明 |
|---|---:|---:|---:|---|
| 文章标题 | 30-36px | 1.35 | 600 | 可分两行 |
| 副标题 | 16-18px | 1.7 | 400 | 次级但仍有文学感 |
| 作者信息 | 14-15px | 1.6 | 400 | 弱化 |
| 正文 | 17-19px | 1.9-2.1 | 400 | 长阅读核心 |
| 章节标题 | 22-24px | 1.5 | 600 | 稍强 |
| 引用 | 17-19px | 1.9 | 400 | 左侧竖线 |
| 金句 | 22-26px | 1.7 | 500 | 中心化或宽排 |
| 注释/脚注 | 13-14px | 1.6 | 400 | 弱化 |

## 6.3 阅读宽度

移动端正文容器：

```css
.article-container {
  padding-left: 24px;
  padding-right: 24px;
  max-width: 640px;
  margin: 0 auto;
}
```

不同设备建议：

| 屏幕宽度 | 左右边距 |
|---:|---:|
| 320-360px | 20px |
| 375-430px | 24px |
| 430px 以上 | 28px |

---

## 7. 组件设计

## 7.1 Top Bar 顶部栏

### 结构

```text
返回按钮 | 当前文章标题... | Aa | 书签 | 更多
```

### 视觉规则

- 高度：56px；
- 背景与页面一致，不做明显卡片；
- 底部分割线极淡；
- 图标使用 1.5px 线性图标；
- 当前标题最多一行，超出省略；
- 顶部栏滚动时可以变得更轻，甚至自动隐藏。

```css
.reader-topbar {
  height: 56px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid var(--ink-border-soft);
  background: var(--ink-bg);
}

.reader-topbar-title {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 15px;
  color: var(--ink-text-primary);
}
```

## 7.2 文章头部

文章头部应该像书籍扉页，留白要足。

包含：

- 小装饰符；
- 主标题；
- 副标题；
- 作者；
- 阅读时间。

```css
.article-header {
  padding-top: 42px;
  padding-bottom: 32px;
  text-align: center;
}

.article-title {
  font-size: 34px;
  line-height: 1.35;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.article-subtitle {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.7;
  color: var(--ink-text-secondary);
}

.article-meta {
  margin-top: 18px;
  font-size: 14px;
  color: var(--ink-text-secondary);
}
```

## 7.3 正文段落

```css
.article-body p {
  margin: 0 0 1.25em;
  text-align: justify;
}
```

正文不要过密。移动端宁愿多滚动，也不要压缩行距。

## 7.4 章节标题

```css
.article-section-title {
  margin-top: 42px;
  margin-bottom: 22px;
  font-size: 23px;
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: 0.04em;
}
```

## 7.5 引用块

引用块用「灰色竖线 + 缩进」即可，不需要卡片背景。

```css
.article-quote {
  margin: 24px 0 32px;
  padding-left: 18px;
  border-left: 4px solid var(--ink-mark-strong);
  color: var(--ink-text-primary);
}

.article-quote footer {
  margin-top: 12px;
  text-align: right;
  color: var(--ink-text-secondary);
  font-size: 15px;
}
```

## 7.6 金句 / Pull Quote

金句用于文章中比较重要的句子。

```css
.pull-quote {
  margin: 36px 0;
  padding: 8px 12px;
  font-size: 24px;
  line-height: 1.75;
  text-align: center;
  color: var(--ink-text-primary);
}

.pull-quote::before,
.pull-quote::after {
  color: var(--ink-text-disabled);
  font-size: 44px;
  line-height: 0;
}
```

## 7.7 插图

移动端建议图片独占一行，不要文字环绕，避免小屏阅读压力。

```css
.article-figure {
  margin: 28px 0 34px;
}

.article-figure img {
  width: 100%;
  display: block;
  filter: grayscale(100%) contrast(0.9) brightness(1.04);
  opacity: 0.88;
  border-radius: 8px;
}

.article-figure figcaption {
  margin-top: 10px;
  font-size: 13px;
  color: var(--ink-text-tertiary);
  text-align: center;
}
```

## 7.8 Bottom Progress 底部进度栏

底部只展示最必要阅读进度。

```text
12%    ━━━━━━━──────    一、回到故乡（第 1 / 3 节）
```

```css
.reader-progress {
  height: 42px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--ink-border-soft);
  background: var(--ink-bg);
  font-size: 13px;
  color: var(--ink-text-secondary);
}

.progress-track {
  flex: 1;
  height: 2px;
  background: var(--ink-border);
}

.progress-value {
  width: 38px;
  color: var(--ink-text-primary);
}
```

---

## 8. 移动端功能入口

## 8.1 字体设置面板

点击 `Aa` 打开底部弹层。

内容包括：

- 字号调节；
- 行距调节；
- 字体选择；
- 页面边距；
- 主题选择。

### 视觉规则

- 弹层背景仍然是暖灰纸面；
- 不使用彩色滑块；
- 当前选中项使用深灰描边或灰色填充；
- 弹层高度建议 40%-55% 屏幕。

```text
┌────────────────────┐
│ 阅读设置             │
│ 字号  A-  18  A+     │
│ 行距  紧凑 标准 宽松  │
│ 字体  宋体 黑体 系统  │
│ 边距  窄  标准  宽    │
│ 主题  纸面  白底 夜间 │
└────────────────────┘
```

## 8.2 目录面板

目录不常驻，点击更多或顶部标题区域进入。

目录建议使用全屏抽屉或底部大弹层。

```text
目录
搜索目录
一、回到故乡        4
  风吹过的麦田      5
  老屋与树          8
二、记忆的形状      18
```

当前章节使用浅灰背景，不使用彩色。

## 8.3 笔记 / 划线面板

笔记入口可以在更多菜单中，也可以通过长按划线后进入。

笔记面板结构：

```text
笔记 3   划线 5
全部笔记 v

第 5 段 · 划线
家乡的定义很动人……
今天 10:24

一、回到故乡 · 引用
所谓故乡，不过是……
今天 10:27
```

### 视觉规则

- 卡片边框非常淡；
- 卡片背景略浅于页面背景；
- 不使用投影；
- 使用细分割线或轻描边。

---

## 9. 交互状态

## 9.1 点击状态

点击图标时，不出现彩色水波纹，使用轻微灰底。

```css
.icon-button:active {
  background: var(--ink-bg-soft);
}
```

## 9.2 划线状态

划线像铅笔痕迹，不像荧光笔。

```css
mark {
  background: linear-gradient(
    transparent 58%,
    var(--ink-mark) 58%,
    var(--ink-mark) 88%,
    transparent 88%
  );
  color: inherit;
}
```

## 9.3 选中文本菜单

长按文字后出现轻量浮层：

```text
复制 | 划线 | 笔记 | 分享
```

浮层规则：

- 背景为浅暖灰；
- 文本为深灰；
- 圆角小；
- 不使用彩色图标。

## 9.4 书签状态

未收藏：空心书签。

已收藏：实心深灰书签。

不要使用黄色、红色等强色彩。

---

## 10. 页面状态

## 10.1 加载状态

电子墨水屏风格不适合强动效骨架屏。

推荐使用：

- 静态灰线骨架；
- 轻微闪烁可选，但速度很慢；
- 避免彩色 loading。

```text
□□□□□□□
────────────
────────────
───────
```

## 10.2 空状态

空状态文案要安静。

示例：

```text
还没有笔记
长按文字，可以添加第一条划线或笔记。
```

## 10.3 错误状态

```text
文章暂时无法打开
请稍后重试，或检查网络连接。
```

按钮：

```text
重新加载
```

按钮使用灰色描边，不使用主色按钮。

---

## 11. 动效规范

电子墨水屏不适合复杂动效。

### 推荐

- 面板上滑：180-240ms；
- 顶部栏显隐：150-180ms；
- 按钮反馈：80-120ms；
- 页面跳转：尽量简单。

### 避免

- 弹跳动画；
- 大面积 blur；
- 彩色光效；
- 复杂转场；
- 卡片飞入飞出。

```css
:root {
  --motion-fast: 120ms;
  --motion-normal: 200ms;
  --motion-ease: cubic-bezier(0.2, 0, 0.2, 1);
}
```

---

## 12. 移动端布局尺寸

## 12.1 基础尺寸

| 项目 | 数值 |
|---|---:|
| Top Bar 高度 | 56px |
| Bottom Progress 高度 | 42px |
| 正文左右边距 | 24px |
| 文章头部上边距 | 42px |
| 段落间距 | 1.25em |
| 章节上边距 | 42px |
| 图片圆角 | 8px |
| 弹层圆角 | 18px 18px 0 0 |
| 图标尺寸 | 22-24px |
| 分割线 | 1px |

## 12.2 安全区

适配 iOS / Android 底部安全区：

```css
.reader-progress {
  padding-bottom: env(safe-area-inset-bottom);
}

.reader-topbar {
  padding-top: env(safe-area-inset-top);
}
```

---

## 13. 内容示例

页面可使用以下示例内容作为设计稿占位。

```md
# 大地上的家乡：记忆、风土与人

在时间的褶皱里，寻找与土地的深情联结

林清玄 ｜ 25 分钟阅读

无论我们走得多远，家乡总是以某种方式，召唤着我们回去。它不只是一个地理坐标，而是一段段记忆的总和，一种气味，一种语言，一种在血脉里流动的熟悉感。本文试图从记忆、风土与人的角度，描绘我心中那片土地的模样。

## 一、回到故乡

> 所谓故乡，不过是你祖先流血流汗的地方，以及你将流泪流汗的地方。  
> —— 余光中

我出生在一个小村庄。村子不大，坐落在缓缓起伏的丘陵之间，屋前有小河，屋后有竹林，远处是连绵的山。小时候，我以为世界就该是这个样子：日出而作，日落而息，人与自然，和谐相依。

> 家乡不是用来炫耀的名片，而是用来安放灵魂的地方。

## 风吹过的麦田

每年夏天，风一吹过麦田，便掀起层层麦浪。那是我童年最深刻的画面之一。我们在田埂上奔跑，追逐蝴蝶，或躺在麦穗下看云。大人们在田里劳作，汗水滴进土里，种子也在悄悄地发芽。
```

---

## 14. Vue 页面结构建议

如果使用 Vue，可以拆成以下组件：

```text
ReaderPage.vue
├── ReaderTopBar.vue
├── ArticleHeader.vue
├── ArticleContent.vue
│   ├── ArticleParagraph.vue
│   ├── ArticleQuote.vue
│   ├── ArticleFigure.vue
│   └── PullQuote.vue
├── ReaderProgress.vue
├── ReaderSettingsSheet.vue
├── ReaderTocSheet.vue
└── ReaderNotesSheet.vue
```

## 14.1 ReaderPage.vue 结构示意

```vue
<template>
  <main class="reader-page">
    <ReaderTopBar
      :title="article.title"
      :bookmarked="bookmarked"
      @open-settings="settingsOpen = true"
      @toggle-bookmark="toggleBookmark"
    />

    <article class="article-container">
      <ArticleHeader :article="article" />
      <ArticleContent :blocks="article.blocks" />
    </article>

    <ReaderProgress
      :percent="12"
      section="一、回到故乡（第 1 / 3 节）"
    />

    <ReaderSettingsSheet v-model:open="settingsOpen" />
    <ReaderTocSheet v-model:open="tocOpen" />
    <ReaderNotesSheet v-model:open="notesOpen" />
  </main>
</template>
```

---

## 15. CSS 起始模板

```css
.reader-page {
  min-height: 100vh;
  color: var(--ink-text-primary);
  background-color: var(--ink-bg);
  background-image:
    radial-gradient(rgba(31, 31, 27, 0.045) 0.5px, transparent 0.5px),
    radial-gradient(rgba(31, 31, 27, 0.025) 0.5px, transparent 0.5px);
  background-size: 6px 6px, 10px 10px;
  background-position: 0 0, 3px 3px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.article-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 24px 72px;
}

.article-body {
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif;
  font-size: 18px;
  line-height: 2;
  letter-spacing: 0.02em;
}

.article-body p {
  margin: 0 0 1.25em;
  text-align: justify;
}

button {
  color: inherit;
  background: transparent;
  border: none;
}
```

---

## 16. 设计验收标准

完成后的页面应该满足以下标准：

### 视觉

- [ ] 页面第一眼像电子墨水屏阅读器，而不是普通网页；
- [ ] 全局只有黑白灰，没有明显彩色；
- [ ] 背景有轻微纸感，但不显脏；
- [ ] 正文是视觉中心；
- [ ] 工具栏存在感很弱；
- [ ] 图片像灰阶印刷图，而不是普通插图；
- [ ] 高亮像灰色铅笔痕迹，而不是荧光笔。

### 阅读体验

- [ ] 正文字号不小于 17px；
- [ ] 行高不小于 1.8；
- [ ] 左右边距足够；
- [ ] 段落之间有自然呼吸；
- [ ] 长时间阅读不刺眼；
- [ ] 顶部栏和底部进度不抢注意力。

### 移动端适配

- [ ] 375px 宽度下阅读舒适；
- [ ] 320px 宽度下不拥挤；
- [ ] 底部安全区适配；
- [ ] 弹层不遮挡核心操作；
- [ ] 长按文本菜单可用；
- [ ] 目录、笔记、设置均可从移动端进入。

---

## 17. 后续可扩展方向

### 17.1 阅读主题

虽然当前主视觉是电子墨水屏，但可以扩展 3 套主题：

| 主题 | 说明 |
|---|---|
| 纸面 | 默认电子墨水屏风格 |
| 白底 | 更干净的现代阅读风格 |
| 夜间 | 深灰底、浅灰字，仍保持低刺激 |

### 17.2 阅读模式

可以扩展：

- 连续滚动；
- 分页阅读；
- 沉浸模式；
- 只读模式；
- 带笔记模式。

### 17.3 笔记能力

后续可支持：

- 划线；
- 批注；
- 摘录；
- 导出 Markdown；
- 按章节查看笔记；
- AI 总结当前章节。

---

## 18. 一句话设计总结

这个阅读器页面应该像一块安静的电子墨水屏：没有强烈颜色，没有多余装饰，只有纸面、墨字、少量工具和足够舒适的阅读节奏。
