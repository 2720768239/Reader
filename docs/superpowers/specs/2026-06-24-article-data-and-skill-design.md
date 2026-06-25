# 文章数据模型优化与抓取 Skill 设计

> 日期:2026-06-24
> 状态:已通过设计评审,待写实现计划

## 1. 背景与目标

Reader 是一个移动端电子墨水屏风格的英中双语长文阅读器。当前文章数据存在以下问题:

1. **文章缺少 `product` 字段**——根因是 `docs/HERMES_CONTENT_TEMPLATE.md` 从未要求该字段,导致 33 篇中大多缺失。
2. **部分文章缺图片**——原文有图但抓取时遗漏,需要重新检查补齐。
3. **URL slug 不理想**——当前 `/article/01-agentic-surfaces`,数字前缀 `01-` 来自导入脚本按文件名排序,首页其实按日期排序,前缀既无语义也冗余。
4. **正文缺少源文链接**——`sourceUrl` 存在于数据但未在阅读页展示,用户无法跳转原文。
5. **缺少标准化的抓取流程**——希望产出一个 skill,供 Hermes agent 抓取文章、生成规范数据、提交 PR,触发服务器自动构建。

本设计同时解决这 5 个问题。

## 2. 关键决策(已与用户确认)

| # | 决策点 | 结论 |
|---|---|---|
| 1 | 文章标识符 | 新增日期型 `id`,格式 `YYYYMMDD`,同日多篇加序号 `YYYYMMDD-01`、`YYYYMMDD-02`。`id` 作为路由、文件名、图片目录、index 的唯一键。 |
| 2 | 日期冗余 | **废弃 `publishedAt` 字段**,日期只从 `id` 推导。 |
| 3 | 无日期文章 | 视为数据错误——每篇文章都必须有发布日期,没有就是数据问题。skill 与校验强制要求。 |
| 4 | `product` 字段 | **必填**。每篇都要有,当前缺失是数据问题,由 Hermes 重新清洗。 |
| 5 | 源文链接 | 在文章头部元数据区**新增第 4 列 Source**,显示"原文"文字链接,点击新标签页打开 `sourceUrl`。 |
| 6 | 缺图片文章 | 由 **Hermes 重新检查全部 33 篇**,逐篇访问原文,有图就补,无图确认并记录。 |
| 7 | 迁移策略 | **脚本一次性迁移**现有 33 篇数据到新 schema。 |
| 8 | 抓取 skill 范围 | 只管数据生成与提交(抓取、翻译、生成 JSON、图片、更新 index、开 PR),不含翻译质量保证、不含已有数据清洗。 |
| 9 | skill 位置 | 项目仓库内 `skills/article-collector/SKILL.md`。 |
| 10 | 同日 id 冲突 | skill 生成 id 前查 `index.json`,同日已存在则自动加序号。 |
| 11 | 原文链接位置 | 新增第 4 列 Source,与 Date/Category/Product 并列。 |
| 12 | 旧解析管线 | 迁移完成后**删除** `lib/content` 下的 `parseArticle.ts`、`parseMetadata.ts`、`pairBlocks.ts` 及其测试。 |

## 3. 数据模型

### 3.1 文章 JSON

文件路径:`src/content/articles/<id>.json`,例如 `src/content/articles/20260610.json`。

```jsonc
{
  "id": "20260610",
  "title": "The evolution of agentic surfaces: building with Claude Managed Agents",
  "sourceUrl": "https://claude.com/blog/building-with-claude-managed-agents",
  "category": "Agents / Claude Platform",
  "product": "Claude Managed Agents",
  "preview": "As model intelligence and agentic harnesses evolve...",
  "blocks": [
    { "type": "paragraph", "id": "p-1", "english": "...", "chinese": "..." },
    { "type": "heading", "level": 2, "english": "...", "chinese": "..." },
    { "type": "image", "src": "images/20260610/diagram-01.png", "alt": "..." },
    { "type": "standalone", "text": "...", "language": "en" }
  ],
  "warnings": []
}
```

**字段规则:**

- `id` **(新增,必填)**:匹配 `/^\d{8}(-\d{2})?$/`。前 8 位为发布日期 `YYYYMMDD`,可选 `-NN` 为同日序号。全库唯一。
- `title`(必填):原标题。
- `sourceUrl` **(必填)**:原文链接。用于头部 Source 列跳转。
- `category`(必填):短分类标签,首页分类筛选用。
- `product` **(必填)**:产品归属，须为以下之一：`API`、`Claude`、`Claude Code`、`Claude Cowork`、`Claude Design`、`Claude Enterprise`、`Claude Managed Agents`、`Claude Platform`。
- `preview`(必填):首段英文或英文摘要。不含纯中文。
- `blocks`(必填):可渲染正文。每段必须同时有 `english` 与 `chinese`,段落 id 从 `p-1` 连续无断号。
- `warnings`:通常 `[]`。

**`publishedAt` 字段从 schema 中移除**,不再写入文件。显示与排序所需的日期一律从 `id` 推导。

### 3.2 index.json

`src/content/index.json` 为文章摘要数组,字段同步:

```jsonc
[
  {
    "id": "20260610",
    "title": "The evolution of agentic surfaces...",
    "category": "Agents / Claude Platform",
    "product": "Claude Managed Agents",
    "preview": "..."
  }
]
```

- `publishedAt` 移除;`slug` 由 `id` 替换。
- 数组按 `id` 降序(等价于按日期降序,最新在前)。
- 每个 entry 必须对应一个存在的 `articles/<id>.json`。

### 3.3 路径约定(全部基于 id)

| 用途 | 路径 |
|---|---|
| 文章 JSON | `src/content/articles/<id>.json` |
| 图片目录 | `public/images/<id>/` |
| 图片引用 | `images/<id>/<file>` |
| URL | `/article/<id>` |

## 4. 代码改动

### 4.1 内容库 (`src/lib/content/`)

**新增 `id.ts`** —— id 的解析、校验与生成工具:

- `isValidArticleId(id): boolean` —— 匹配 `/^\d{8}(-\d{2})?$/`。
- `idToDate(id): Date` —— 从前 8 位解析为日期。
- `idToDateLabel(id): string` —— 返回 `YYYY-MM-DD` 展示串。
- `nextIdForDate(existingIds: string[], date: string): string` —— 给定 `YYYYMMDD` 与已存在 id 列表,返回不冲突的 id(无冲突直接返回日期串,有冲突追加 `-01`/`-02`...按序号最大值递增)。

**`types.ts`**:
- `ArticleRecord` 删除 `publishedAt?`,新增 `id: string`(必填)。
- `ArticleIndexEntry` 删除 `publishedAt`,`Pick` 列表用 `id` 替换 `slug`。
- `RawBlock` / `RawHeadingLevel` 等 markdown 解析相关类型**随解析模块一起删除**。

**`loaders.ts`**:
- `loadArticleIndex()` 不变(仍读 index.json)。
- `loadArticleBySlug` 改名为 `loadArticleById(id)`,glob 路径匹配改为 `articles/${id}.json`。
- 仍用 `import.meta.glob` 懒加载。

**删除的文件**(迁移完成后):
- `parseArticle.ts`、`parseMetadata.ts`、`pairBlocks.ts`、`parseArticle.test.ts`、`pairBlocks.test.ts`。
- `paths.ts` **整体删除**(迁移脚本改用项目根的相对路径 `src/content/articles`、`src/content/index.json`、`public/images`,不依赖该模块)。

### 4.2 路由

**`App.tsx`**:路由从 `/article/:slug` 改为 `/article/:id`。

**`HomePage.tsx`**:
- 删除 `parseArticleDate`(日期从 id 推导)。
- 排序改为按 `id` 字符串降序(等价日期降序);`title` 排序不变。
- 搜索/展示的日期改用 `idToDateLabel(id)`。
- `ArticleCard` 传 `id` 而非 slug。

**`ArticlePage.tsx`**:
- `useParams()` 取 `id`。
- 加载逻辑、顶栏标题、阅读偏好等不变。

### 4.3 组件

**`ArticleMetadata.tsx`** —— 核心改动:
- `metadataFields` 新增第 4 项 `{ key: "source", label: "Source" }`。
- 现有三列网格(Date/Category/Product)变为四列。
- Date 单元格的值由 `idToDateLabel(id)` 提供(组件新增 `id` prop)。
- Source 单元格:有 `sourceUrl` 时渲染 `<a href={sourceUrl} target="_blank" rel="noreferrer noopener">原文</a>`;无则空。
- props 新增 `id` 与 `sourceUrl`。

**`ArticleHeader.tsx`**:透传 `id`、`sourceUrl` 给 `ArticleMetadata`。

**`ArticleCard.tsx`**:`key` 与链接改用 `id`;日期用 `idToDateLabel(id)`;透传 `sourceUrl` 给 `ArticleMetadata`。

**`styles.css`**:
- `.article-metadata__row` 的 `grid-template-columns` 从三列调整为四列等宽(或按内容比例)。
- `.article-header__meta .article-metadata__cell` 的对齐规则相应扩展到第四列。
- `.article-metadata` 内链接样式:继承色,hover 时颜色变化,无下划线干扰。

### 4.4 迁移后删除导入入口

- 删除 `scripts/import-articles.ts`。
- `package.json` 删除 `"import:articles": "tsx scripts/import-articles.ts"`。
- 迁移脚本 `scripts/migrate-to-ids.ts` 在迁移完成后也可删除(一次性工具),但实现计划阶段先保留以便复跑。

## 5. 一次性迁移脚本

新建 `scripts/migrate-to-ids.ts`(tsx 运行):

1. 读取 `src/content/articles/*.json`(现有 `01-...json` ~ `33-...json`)与 `index.json`。
2. 对每篇文章:
   - 取 `publishedAt`,归一化为 `YYYYMMDD`(支持现有 `2026-06-10` 与 `June 10, 2026` 两种格式)。
   - 用 `nextIdForDate` 处理同日冲突,生成 `id`。
   - 删除 JSON 的 `publishedAt` 字段,写入 `id`。
   - 重写 JSON 内所有图片 `src`:`images/<旧slug>/...` → `images/<id>/...`。
3. 文件重命名:`articles/<旧slug>.json` → `articles/<id>.json`。
4. 图片目录重命名:`public/images/<旧slug>` → `public/images/<id>`。
5. 重写 `index.json`:去 `publishedAt`/`slug`,加 `id`,按 id 降序。
6. `product` 缺失的文章:保留为空字符串,**打印警告清单**到控制台(这些交给 Hermes 后续清洗,不在本脚本职责内)。
7. 迁移后自检:遍历所有新 JSON,校验 id 格式、index 与文件一一对应,有异常则报错退出。

**脚本只做结构转换,不负责补 product / 图片。** 迁移后现有 33 篇的英文原文与中文翻译内容完整保留。

## 6. 抓取 Skill

**位置:** `skills/article-collector/SKILL.md`(项目仓库内)。

### 6.1 职责边界

skill 只负责**数据生成与提交**:

1. 抓取指定原文 URL,提取正文(去导航、广告、页脚)。
2. 逐段翻译为简体中文,保留段落顺序与数量。
3. 生成符合新 schema 的 `articles/<id>.json`。
4. 下载必要图片到 `public/images/<id>/`。
5. 更新 `index.json`。
6. 开 PR。

**不含:** 翻译质量保证(依赖 agent 自身能力)、已有数据清洗、修改应用代码。

### 6.2 id 生成规则(skill 必须遵守)

1. 从原文页面取发布日期,格式化为 `YYYYMMDD`。
2. **无发布日期视为错误**,skill 必须先找出日期再继续。
3. 读取 `index.json`,若该 `YYYYMMDD` 已存在,则追加序号:已有 `20260601` 时新文章用 `20260601-01`,已有 `-01` 时用 `-02`,序号取已存在最大值 +1。
4. id 全库唯一。

### 6.3 数据约束(skill 必须遵守)

- `id`:匹配 `/^\d{8}(-\d{2})?$/`,必填。
- `title`:原标题,必填。
- `sourceUrl`:原文 URL,必填。
- `category`:必填。
- `product`:**必填**。从原文判断产品归属，须为以下之一：`API`、`Claude`、`Claude Code`、`Claude Cowork`、`Claude Design`、`Claude Enterprise`、`Claude Managed Agents`、`Claude Platform`。
- `preview`:首段英文或英文摘要,必填。
- `blocks`:每段同时有 `english` + `chinese`,段落 id 从 `p-1` 连续无断号。
- `warnings`:通常 `[]`。
- **不写入 `publishedAt`**(由 id 推导)。
- 所有文件 UTF-8、JSON 可解析。
- 图片引用 `images/<id>/<file>`,跳过头像/社交图标/广告/追踪像素。

### 6.4 仓库边界(只能动)

- `src/content/articles/*.json`
- `src/content/index.json`
- `public/images/<id>/*`

不得修改应用代码、CSS、package、测试、构建脚本(除非仓库 owner 明确要求)。

### 6.5 PR 规范

- 分支:`content/YYYY-MM-DD-<short-topic>`
- 提交:`content: add <article title or batch>`
- PR 标题:`Content: <article title or batch>`
- PR body 用 `HERMES_CONTENT_TEMPLATE.md` 中的检查清单。

### 6.6 同步更新模板

`docs/HERMES_CONTENT_TEMPLATE.md` 需同步更新到新 schema:
- `slug` 全部替换为 `id`(规则改为日期型)。
- `publishedAt` 字段移除,说明日期由 id 推导。
- `product` 标注为必填。
- 图片路径示例改用 `<id>`。

## 7. 测试与验收

### 7.1 单测

- `id.ts`:`isValidArticleId`(合法/非法用例)、`idToDate` / `idToDateLabel`、`nextIdForDate`(无冲突、有冲突递增序号)。
- `loadArticleById`:加载存在 / 抛错不存在的 id。
- 删除 `parseArticle.test.ts`、`pairBlocks.test.ts`。

### 7.2 组件测试

- `ArticleMetadata`:渲染四列;Date 从 id 推导;Source 列在有 `sourceUrl` 时渲染链接、无时不渲染。
- `ArticleCard`:`id` 作 key 与链接;日期从 id 推导。
- `HomePage`:排序按 id 降序。
- 更新 `ArticlePage.test.tsx`、`HomePage.test.tsx` 中的 slug 引用为 id。

### 7.3 迁移脚本验收

- 迁移后 `index.json` 与 `articles/*.json` 一一对应。
- 所有 `publishedAt` 已移除,所有 id 匹配 `/^\d{8}(-\d{2})?$/`。
- 图片目录与 JSON 内 `src` 一致。
- 控制台输出 `product` 缺失清单。

### 7.4 手动验收

- `npm run build` 通过,`vitest` 全绿。
- 首页排序按日期从新到旧。
- 进入文章页,头部四列(Date/Category/Product/Source)正确,点"原文"新标签打开原文。
- URL 形如 `/article/20260610`,无数字前缀。

## 8. 范围外(明确不做)

- 翻译质量审查(依赖 Hermes 自身)。
- 已有文章内容的重新翻译(只迁移结构、补 product/图片)。
- 阅读器新功能(目录、书签、进度条、笔记等)——与本次数据优化无关。
- skill 自动调用翻译模型/API(翻译由 agent 完成)。
