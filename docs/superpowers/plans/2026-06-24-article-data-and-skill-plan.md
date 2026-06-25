# 文章数据模型优化与抓取 Skill 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将文章标识符从数字前缀 slug 迁移到日期型 `id`,废弃 `publishedAt`,`product` 改必填,在阅读页头部新增可跳转的"原文"链接,并产出一个供 Hermes agent 使用的文章抓取 skill。

**Architecture:** 新增 `src/lib/content/id.ts` 工具模块处理 id 解析/生成;一次性迁移脚本把现有 33 篇数据(含图片目录与 index.json)从 slug schema 转到 id schema;应用代码(types/loaders/路由/组件)同步切换到 `id`,日期从 id 推导,"原文"链接作为 ArticleMetadata 的第 4 列;迁移完成后删除旧的 markdown 解析管线;最后编写 skill 与更新内容契约模板。

**Tech Stack:** React 19 + TypeScript + Vite 6 + Vitest 3 + tsx(脚本运行)

**设计依据:** `docs/superpowers/specs/2026-06-24-article-data-and-skill-design.md`

---

## 文件结构

**新增:**
- `src/lib/content/id.ts` — id 解析、校验、序号生成工具(纯函数,可独立测试)
- `src/lib/content/id.test.ts` — id 工具测试
- `scripts/migrate-to-ids.ts` — 一次性数据迁移脚本(运行后可保留以便复跑)
- `skills/article-collector/SKILL.md` — Hermes 文章抓取 skill

**修改(schema 切换):**
- `src/lib/content/types.ts` — `ArticleRecord` 用 `id` 替换 `slug`、删 `publishedAt`;`ArticleIndexEntry` 同步
- `src/lib/content/loaders.ts` — `loadArticleBySlug` → `loadArticleById`
- `src/App.tsx` — 路由 `/article/:slug` → `/article/:id`
- `src/routes/ArticlePage.tsx` — 取 `id`、透传 `sourceUrl`
- `src/routes/HomePage.tsx` — 排序/搜索改用 `id` 与 `idToDateLabel`
- `src/components/ArticleMetadata.tsx` — 日期从 `id` 推导、新增 Source 列
- `src/components/ArticleHeader.tsx` — 透传 `id`、`sourceUrl`
- `src/components/ArticleCard.tsx` — 用 `id` 作链接与 key
- `src/styles.css` — metadata 行改为自适应列网格
- 全部 `*.test.tsx` — mock 数据与断言切换到 `id`

**删除(迁移完成后):**
- `scripts/import-articles.ts`
- `src/lib/content/parseArticle.ts`、`parseArticle.test.ts`
- `src/lib/content/parseMetadata.ts`
- `src/lib/content/pairBlocks.ts`、`pairBlocks.test.ts`
- `src/lib/content/paths.ts`

---

## Task 1: id 工具模块(TDD,纯新增)

**Files:**
- Create: `src/lib/content/id.ts`
- Test: `src/lib/content/id.test.ts`

- [ ] **Step 1: 写失败测试 `src/lib/content/id.test.ts`**

```ts
import { describe, expect, it } from "vitest";

import { idToDateLabel, isValidArticleId, nextIdForDate } from "./id";

describe("isValidArticleId", () => {
  it("accepts a plain date id", () => {
    expect(isValidArticleId("20260610")).toBe(true);
  });

  it("accepts a date id with a sequence suffix", () => {
    expect(isValidArticleId("20260610-01")).toBe(true);
  });

  it("rejects ids with the wrong length", () => {
    expect(isValidArticleId("2026061")).toBe(false);
    expect(isValidArticleId("202606101")).toBe(false);
  });

  it("rejects a single-digit sequence suffix", () => {
    expect(isValidArticleId("20260610-1")).toBe(false);
  });

  it("rejects impossible month and day values", () => {
    expect(isValidArticleId("20261310")).toBe(false);
    expect(isValidArticleId("20260632")).toBe(false);
  });

  it("rejects non-date strings", () => {
    expect(isValidArticleId("agentic-surfaces")).toBe(false);
    expect(isValidArticleId("")).toBe(false);
  });
});

describe("idToDateLabel", () => {
  it("formats a plain date id as YYYY-MM-DD", () => {
    expect(idToDateLabel("20260610")).toBe("2026-06-10");
  });

  it("ignores the sequence suffix when formatting the date", () => {
    expect(idToDateLabel("20260610-02")).toBe("2026-06-10");
  });

  it("throws for an invalid id", () => {
    expect(() => idToDateLabel("not-a-date")).toThrow("Invalid article id");
  });
});

describe("nextIdForDate", () => {
  it("returns the plain date when there is no collision", () => {
    expect(nextIdForDate(["20260501"], "20260610")).toBe("20260610");
  });

  it("appends -01 when the plain date already exists", () => {
    expect(nextIdForDate(["20260610"], "20260610")).toBe("20260610-01");
  });

  it("increments past the largest existing suffix", () => {
    expect(
      nextIdForDate(["20260610", "20260610-01", "20260610-02"], "20260610")
    ).toBe("20260610-03");
  });

  it("rejects an invalid date input", () => {
    expect(() => nextIdForDate([], "2026-06-10")).toThrow("Invalid date");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/lib/content/id.test.ts`
Expected: FAIL — 模块 `./id` 不存在。

- [ ] **Step 3: 实现 `src/lib/content/id.ts`**

```ts
const ARTICLE_ID_PATTERN = /^(\d{4})(\d{2})(\d{2})(?:-(\d{2}))?$/;

export function isValidArticleId(id: string): boolean {
  const match = ARTICLE_ID_PATTERN.exec(id);

  if (!match) {
    return false;
  }

  const month = Number(match[2]);
  const day = Number(match[3]);

  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

export function idToDateLabel(id: string): string {
  if (!isValidArticleId(id)) {
    throw new Error(`Invalid article id: ${id}`);
  }

  return `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}`;
}

export function nextIdForDate(existingIds: string[], date: string): string {
  if (!/^\d{8}$/.test(date)) {
    throw new Error(`Invalid date for id: ${date}`);
  }

  if (!existingIds.includes(date)) {
    return date;
  }

  let sequence = 1;

  while (existingIds.includes(`${date}-${String(sequence).padStart(2, "0")}`)) {
    sequence += 1;
  }

  return `${date}-${String(sequence).padStart(2, "0")}`;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/lib/content/id.test.ts`
Expected: PASS(全部用例)。

- [ ] **Step 5: typecheck**

Run: `npm run typecheck`
Expected: 通过。

- [ ] **Step 6: 提交**

```bash
git add src/lib/content/id.ts src/lib/content/id.test.ts
git commit -m "feat: add article id utilities"
```

---

## Task 2: 一次性数据迁移脚本

**Files:**
- Create: `scripts/migrate-to-ids.ts`

本任务只**创建**脚本文件,不运行。脚本依赖 Task 1 的 `id.ts`。

- [ ] **Step 1: 创建 `scripts/migrate-to-ids.ts`**

```ts
import fs from "node:fs/promises";
import path from "node:path";

import { isValidArticleId, nextIdForDate } from "../src/lib/content/id";

const ARTICLES_DIR = path.resolve("src/content/articles");
const INDEX_PATH = path.resolve("src/content/index.json");
const IMAGES_DIR = path.resolve("public/images");

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function parsePublishedAt(value: string | undefined): string {
  if (!value) {
    throw new Error("Missing publishedAt");
  }

  const trimmed = value.trim();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    return `${iso[1]}${iso[2]}${iso[3]}`;
  }

  const long = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/.exec(trimmed);
  if (long) {
    const month = MONTHS[long[1].toLowerCase()];
    if (month) {
      return `${long[3]}${pad2(month)}${pad2(Number(long[2]))}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getUTCFullYear()}${pad2(parsed.getUTCMonth() + 1)}${pad2(
      parsed.getUTCDate()
    )}`;
  }

  throw new Error(`Unparseable publishedAt: ${value}`);
}

type LegacyArticle = {
  slug?: string;
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  product?: string;
  preview?: string;
  blocks: Array<{ type?: string; src?: string }>;
};

type IndexEntry = {
  id: string;
  title: string;
  category?: string;
  product?: string;
  preview?: string;
};

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  const usedIds: string[] = [];
  const indexEntries: IndexEntry[] = [];
  const missingProduct: string[] = [];

  for (const file of files) {
    const oldPath = path.join(ARTICLES_DIR, file);
    const article = JSON.parse(await fs.readFile(oldPath, "utf8")) as LegacyArticle;
    const oldSlug = article.slug ?? file.replace(/\.json$/, "");

    const date = parsePublishedAt(article.publishedAt);
    const id = nextIdForDate(usedIds, date);
    usedIds.push(id);

    for (const block of article.blocks) {
      if (block.type === "image" && typeof block.src === "string") {
        block.src = block.src.replace(`images/${oldSlug}/`, `images/${id}/`);
      }
    }

    delete (article as Partial<LegacyArticle>).publishedAt;
    delete (article as Partial<LegacyArticle>).slug;
    (article as LegacyArticle & { id: string }).id = id;

    await fs.writeFile(
      path.join(ARTICLES_DIR, `${id}.json`),
      `${JSON.stringify(article, null, 2)}\n`,
      "utf8"
    );

    if (file !== `${id}.json`) {
      await fs.rm(oldPath, { force: true });
    }

    const oldImageDir = path.join(IMAGES_DIR, oldSlug);
    try {
      await fs.access(oldImageDir);
      await fs.rename(oldImageDir, path.join(IMAGES_DIR, id));
    } catch {
      // this article has no image directory
    }

    indexEntries.push({
      id,
      title: article.title,
      category: article.category,
      product: article.product,
      preview: article.preview
    });

    if (!article.product) {
      missingProduct.push(`${id} (${article.title})`);
    }
  }

  indexEntries.sort((left, right) => right.id.localeCompare(left.id));
  await fs.writeFile(INDEX_PATH, `${JSON.stringify(indexEntries, null, 2)}\n`, "utf8");

  for (const id of usedIds) {
    if (!isValidArticleId(id)) {
      throw new Error(`Migration produced an invalid id: ${id}`);
    }
  }

  console.log(`[migrate] migrated ${usedIds.length} articles to id-based schema.`);
  if (missingProduct.length > 0) {
    console.warn("[migrate] articles missing product (need Hermes cleanup):");
    for (const entry of missingProduct) {
      console.warn(`  - ${entry}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

- [ ] **Step 2: typecheck(脚本在 tsconfig include 内)**

Run: `npm run typecheck`
Expected: 通过。

- [ ] **Step 3: 提交**

```bash
git add scripts/migrate-to-ids.ts
git commit -m "feat: add one-shot article id migration script"
```

---

## Task 3: schema 代码切换(types / loaders / 路由 / 页面 / 组件 / 样式 / 测试)

本任务把应用层从 slug/publishedAt 切换到 id。由于 `types.ts` 一改,所有消费方必须同步改动才能通过 typecheck,这些改动作为一个原子提交。测试全部 mock loaders(不依赖真实 JSON),所以本任务内 typecheck + 全量测试即可全绿,真实数据迁移留给 Task 4。

**Files:**
- Modify: `src/lib/content/types.ts`
- Modify: `src/lib/content/loaders.ts`
- Modify: `src/App.tsx`
- Modify: `src/routes/ArticlePage.tsx`
- Modify: `src/routes/HomePage.tsx`
- Modify: `src/components/ArticleMetadata.tsx`
- Modify: `src/components/ArticleHeader.tsx`
- Modify: `src/components/ArticleCard.tsx`
- Modify: `src/styles.css`
- Modify: `src/routes/HomePage.test.tsx`、`src/routes/ArticlePage.test.tsx`、`src/components/ArticleHeader.test.tsx`

- [ ] **Step 1: 改 `src/lib/content/types.ts` 的 `ArticleRecord` 与 `ArticleIndexEntry`**

把 `ArticleRecord` 中的 `slug: string;` 替换为 `id: string;`,删除 `publishedAt?: string;`,把 `sourceUrl?`/`category?`/`product?`/`preview?` 改为必填:

```ts
export type ArticleRecord = {
  id: string;
  title: string;
  sourceUrl: string;
  category: string;
  product: string;
  preview: string;
  blocks: ArticleBlock[];
  warnings: ContentWarning[];
};

export type ArticleIndexEntry = Pick<
  ArticleRecord,
  "id" | "title" | "category" | "product" | "preview"
>;
```

(`RawBlock` / `RawHeadingLevel` 等解析相关类型本任务保留,Task 5 随解析模块一起删除。)

- [ ] **Step 2: 改 `src/lib/content/loaders.ts`**

完整替换文件内容:

```ts
import indexData from "../../content/index.json";
import type { ArticleIndexEntry, ArticleRecord } from "./types";

const articleModules = import.meta.glob("../../content/articles/*.json");

export function loadArticleIndex(): ArticleIndexEntry[] {
  return indexData as ArticleIndexEntry[];
}

export async function loadArticleById(id: string): Promise<ArticleRecord> {
  const loader = articleModules[`../../content/articles/${id}.json`];

  if (!loader) {
    throw new Error(`Article not found: ${id}`);
  }

  const module = (await loader()) as { default: ArticleRecord };
  return module.default;
}
```

- [ ] **Step 3: 改 `src/App.tsx` 路由参数**

把 `<Route path="/article/:slug" element={<ArticlePage />} />` 改为:

```tsx
<Route path="/article/:id" element={<ArticlePage />} />
```

- [ ] **Step 4: 改 `src/components/ArticleMetadata.tsx`**

完整替换文件内容(日期从 `id` 推导,Source 列仅当 `sourceUrl` 存在时显示):

```tsx
import type { ReactNode } from "react";

import { idToDateLabel } from "../lib/content/id";

type ArticleMetadataProps = {
  className?: string;
  id: string;
  category?: string;
  product?: string;
  sourceUrl?: string;
};

const FIELD_DEFS = [
  { key: "date", label: "Date" },
  { key: "category", label: "Category" },
  { key: "product", label: "Product" },
  { key: "source", label: "Source" }
] as const;

type FieldKey = (typeof FIELD_DEFS)[number]["key"];

export default function ArticleMetadata({
  className = "",
  id,
  category,
  product,
  sourceUrl
}: ArticleMetadataProps) {
  const values: Record<FieldKey, ReactNode> = {
    date: idToDateLabel(id),
    category: category ?? "",
    product: product ?? "",
    source: sourceUrl ? (
      <a href={sourceUrl} rel="noreferrer noopener" target="_blank">
        原文
      </a>
    ) : (
      ""
    )
  };

  const visibleFields = FIELD_DEFS.filter((field) => {
    if (field.key === "source") {
      return Boolean(sourceUrl);
    }

    return Boolean(values[field.key]);
  });

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Article metadata"
      className={["article-metadata", className].filter(Boolean).join(" ")}
    >
      <div className="article-metadata__row article-metadata__row--labels">
        {visibleFields.map((field) => (
          <span className="article-metadata__cell" key={field.key}>
            {field.label}
          </span>
        ))}
      </div>
      <div className="article-metadata__row article-metadata__row--values">
        {visibleFields.map((field) => (
          <span className="article-metadata__cell" key={field.key}>
            {values[field.key]}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 改 `src/components/ArticleHeader.tsx`**

完整替换文件内容:

```tsx
import ArticleMetadata from "./ArticleMetadata";

type ArticleHeaderProps = {
  title: string;
  id: string;
  category?: string;
  product?: string;
  sourceUrl?: string;
};

export default function ArticleHeader({
  title,
  id,
  category,
  product,
  sourceUrl
}: ArticleHeaderProps) {
  return (
    <header className="article-header">
      <h1>{title}</h1>
      <ArticleMetadata
        category={category}
        className="article-header__meta"
        id={id}
        product={product}
        sourceUrl={sourceUrl}
      />
    </header>
  );
}
```

- [ ] **Step 6: 改 `src/components/ArticleCard.tsx`**

完整替换文件内容(卡片不传 `sourceUrl`,因此不显示 Source 列):

```tsx
import { Link } from "react-router-dom";

import ArticleMetadata from "./ArticleMetadata";
import type { ArticleIndexEntry } from "../lib/content/types";

type ArticleCardProps = ArticleIndexEntry & {
  primaryCategory?: string;
};

export default function ArticleCard({
  id,
  title,
  category,
  product,
  primaryCategory
}: ArticleCardProps) {
  const categoryText = primaryCategory ?? category;

  return (
    <article className="article-card" role="listitem">
      <Link className="article-card__link" to={`/article/${id}`}>
        <h2>{title}</h2>
        <ArticleMetadata
          category={categoryText}
          className="article-card__facts"
          id={id}
          product={product}
        />
      </Link>
    </article>
  );
}
```

- [ ] **Step 7: 改 `src/routes/ArticlePage.tsx`**

改两处:
1. 第 18 行 `const { slug = "" } = useParams();` → `const { id = "" } = useParams();`
2. 第 41 行 `loadArticleBySlug(slug)` → `loadArticleById(id)`
3. 第 50 行依赖数组 `[slug]` → `[id]`
4. `ArticleHeader` 调用处增加 `id={article.id}` 与 `sourceUrl={article.sourceUrl}`,删除 `publishedAt`:

```tsx
<ArticleHeader
  category={article.category}
  id={article.id}
  product={article.product}
  sourceUrl={article.sourceUrl}
  title={article.title}
/>
```

并确认顶部 import 已包含 `loadArticleById`(替换原 `loadArticleBySlug`)。

- [ ] **Step 8: 改 `src/routes/HomePage.tsx`**

删除 `parseArticleDate` 函数;排序、搜索改为基于 `id` 与 `idToDateLabel`。完整替换文件中受影响部分:

顶部 import 增加:
```tsx
import { idToDateLabel } from "../lib/content/id";
```

删除整个 `parseArticleDate` 函数(第 9-16 行)。

排序逻辑(原 `parseArticleDate` 调用处)改为:
```tsx
.sort((left, right) => {
  if (sort === "title") {
    return left.title.localeCompare(right.title);
  }

  return sort === "oldest"
    ? left.id.localeCompare(right.id)
    : right.id.localeCompare(left.id);
});
```

搜索 haystack 中 `article.publishedAt` 改为 `idToDateLabel(article.id)`:
```tsx
const haystack = [
  article.title,
  article.preview,
  article.category,
  article.product,
  idToDateLabel(article.id)
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();
```

`ArticleCard` 渲染处 `{...article}` 不变(`ArticleIndexEntry` 现在含 `id`);`primaryCategory` 传法不变。

- [ ] **Step 9: 改 `src/styles.css` 的 metadata 网格为自适应列**

把:
```css
.article-metadata__row {
  display: grid;
  grid-template-columns: minmax(7rem, 0.85fr) minmax(0, 1.4fr) minmax(0, 1fr);
}
```
改为:
```css
.article-metadata__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5.5rem, 1fr));
}
```

其余 `.article-metadata__cell`(padding、分隔线)与 `.article-header__meta .article-metadata__cell` 的对齐规则保持不变(Source 作为 last-child 在头部用左对齐,Date 作为 first-child 用右对齐,中间居中,适配 3 列和 4 列两种情况)。

- [ ] **Step 10: 更新 `src/routes/HomePage.test.tsx` 的 mock 与断言**

把 mock 的 `loadArticleIndex` 返回值改为基于 `id`(去掉 `slug` 与 `publishedAt`,补齐 `product`):

```tsx
vi.mock("../lib/content/loaders", () => ({
  loadArticleIndex: () => [
    {
      id: "20260618",
      title: "June Release Notes",
      category: "Product announcements",
      product: "Claude Code",
      preview: "A roundup of June product updates."
    },
    {
      id: "20260610",
      title: "Managed Agents Guide",
      category: "Enterprise AI",
      product: "Claude Managed Agents",
      preview: "A field guide for teams deploying agents."
    },
    {
      id: "20260502",
      title: "Building on Apple platforms",
      category: "Developer guides",
      product: "Apple Foundation Models",
      preview: "How to build native workflows on Apple devices."
    }
  ]
}));
```

断言改动:
- "sorts articles from oldest to newest":期望标题顺序仍是 `[Building on Apple platforms, Managed Agents Guide, June Release Notes]`(因 id 升序等价日期升序),无需改。
- "filters articles by category ... keeps the publication date visible":把 `expect(within(article).getByText("June 10, 2026"))` 改为 `getByText("2026-06-10")`。
- "shows date, category, and product metadata as labels and values":把 `"June 18, 2026"` 改为 `"2026-06-18"`,并把断言文案 `screen.queryByText("June 18, 2026 | Product announcements | Claude Code")` 改为 `screen.queryByText("2026-06-18 | Product announcements | Claude Code")`。

- [ ] **Step 11: 更新 `src/routes/ArticlePage.test.tsx` 的 mock、路由与断言**

把 mock 从 `loadArticleBySlug` 改为 `loadArticleById`,数据去 `slug`/`publishedAt`、加 `id` 与 `sourceUrl`:

```tsx
vi.mock("../lib/content/loaders", () => ({
  loadArticleById: async () => ({
    id: "20260610",
    title: "Demo Article",
    sourceUrl: "https://example.com/demo",
    category: "Enterprise AI",
    product: "Claude Managed Agents",
    preview: "First english paragraph.",
    blocks: [
      {
        type: "paragraph",
        id: "p-1",
        english: "First english paragraph.",
        chinese: "第一段中文。"
      }
    ],
    warnings: []
  })
}));
```

所有测试块里:
- `initialEntries={["/article/demo-article"]}` 保持(占位值,路由匹配用的是 `:id` 参数名)。
- `<Route path="/article/:slug" ...>` 全部改为 `<Route path="/article/:id" ...>`。
- "shows date, category, and product metadata as labels and values":把 `"June 10, 2026"` 改为 `"2026-06-10"`,把拼接串断言改为 `"2026-06-10 | Enterprise AI | Claude Managed Agents"`,并新增 Source 断言:
  ```tsx
  expect(within(metadata).getByText("Source")).toBeInTheDocument();
  expect(within(metadata).getByRole("link", { name: "原文" })).toHaveAttribute(
    "href",
    "https://example.com/demo"
  );
  ```

- [ ] **Step 12: 更新 `src/components/ArticleHeader.test.tsx`**

把 props 从 `publishedAt` 改为 `id`,加 `sourceUrl`,断言日期改为 `idToDateLabel` 输出:

```tsx
render(
  <ArticleHeader
    category="Agents"
    id="20260610"
    product="Claude Managed Agents"
    sourceUrl="https://example.com/demo"
    title="Demo Article"
  />
);

const title = screen.getByRole("heading", { name: "Demo Article" });
const meta = screen.getByLabelText("Article metadata");

expect(title.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
expect(within(meta).getByText("Date")).toBeInTheDocument();
expect(within(meta).getByText("Category")).toBeInTheDocument();
expect(within(meta).getByText("Product")).toBeInTheDocument();
expect(within(meta).getByText("Source")).toBeInTheDocument();
expect(within(meta).getByText("2026-06-10")).toBeInTheDocument();
expect(within(meta).getByText("Agents")).toBeInTheDocument();
expect(within(meta).getByText("Claude Managed Agents")).toBeInTheDocument();
expect(within(meta).getByRole("link", { name: "原文" })).toHaveAttribute(
  "href",
  "https://example.com/demo"
);
expect(
  screen.queryByText("2026-06-10 | Agents | Claude Managed Agents")
).not.toBeInTheDocument();
```

- [ ] **Step 13: typecheck + 全量测试**

Run: `npm run typecheck && npx vitest run`
Expected: typecheck 通过;所有测试通过。

- [ ] **Step 14: 提交**

```bash
git add src/lib/content/types.ts src/lib/content/loaders.ts src/App.tsx \
  src/routes/ArticlePage.tsx src/routes/HomePage.tsx \
  src/components/ArticleMetadata.tsx src/components/ArticleHeader.tsx \
  src/components/ArticleCard.tsx src/styles.css \
  src/routes/HomePage.test.tsx src/routes/ArticlePage.test.tsx \
  src/components/ArticleHeader.test.tsx
git commit -m "refactor: switch article schema from slug to date-based id"
```

---

## Task 4: 运行迁移脚本,转换真实数据

**Files:**
- 运行 `scripts/migrate-to-ids.ts`(由 Task 2 创建)
- 产物:重命名 33 个 `articles/*.json`、`public/images/*` 目录、重写 `index.json`

- [ ] **Step 1: 运行迁移脚本**

Run: `npx tsx scripts/migrate-to-ids.ts`
Expected: 控制台输出 `[migrate] migrated 33 articles to id-based schema.`,并可能列出 product 缺失清单(这些交给 Hermes 后续清洗,属预期)。

- [ ] **Step 2: 校验产物**

Run(在项目根):
```
npx vitest run src/lib/content/id.test.ts && npm run typecheck && npx vitest run
```
Expected: 全部通过(真实数据文件名已变为 `YYYYMMDD.json`,`loadArticleById` 的 glob 能匹配)。

- [ ] **Step 3: 手动抽查**

- 确认 `src/content/articles/` 下文件名形如 `20260610.json`,无 `01-` 前缀残留。
- 确认 `src/content/index.json` 顶对象含 `id`、不含 `publishedAt`/`slug`,且按 id 降序。
- 任选一篇有图的文章(如原 `01-agentic-surfaces`),确认 `public/images/<id>/` 存在且 JSON 内 `src` 已更新。

- [ ] **Step 4: build 验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 5: 提交**

```bash
git add src/content/articles src/content/index.json public/images
git commit -m "content: migrate 33 articles to id-based schema"
```

---

## Task 5: 删除旧 markdown 解析管线

迁移完成后,markdown 解析模块成为死代码,连同样其测试与导入入口删除。

**Files:**
- Delete: `scripts/import-articles.ts`
- Delete: `src/lib/content/parseArticle.ts`、`src/lib/content/parseArticle.test.ts`
- Delete: `src/lib/content/parseMetadata.ts`
- Delete: `src/lib/content/pairBlocks.ts`、`src/lib/content/pairBlocks.test.ts`
- Delete: `src/lib/content/paths.ts`
- Modify: `src/lib/content/types.ts`(删 `RawBlock`、`RawHeadingLevel`)
- Modify: `package.json`(删 `import:articles` 脚本)

- [ ] **Step 1: 删除文件**

Run:
```
git rm scripts/import-articles.ts src/lib/content/parseArticle.ts src/lib/content/parseArticle.test.ts src/lib/content/parseMetadata.ts src/lib/content/pairBlocks.ts src/lib/content/pairBlocks.test.ts src/lib/content/paths.ts
```

- [ ] **Step 2: 从 `src/lib/content/types.ts` 删除解析专用类型**

删除文件顶部的:
```ts
export type RawHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type RawBlock =
  | { type: "heading"; level: RawHeadingLevel; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string };
```
保留 `ContentLanguage`、`ArticleHeadingBlock`、`ArticleParagraphBlock`、`ArticleImageBlock`、`ArticleStandaloneBlock`、`ContentWarningCode`、`ContentWarning`、`ArticleBlock`、`ArticleRecord`、`ArticleIndexEntry`。

- [ ] **Step 3: 从 `package.json` 删除 import 脚本**

删除 `"import:articles": "tsx scripts/import-articles.ts"` 这一行(注意保持 JSON 逗号正确)。

- [ ] **Step 4: typecheck + 全量测试**

Run: `npm run typecheck && npx vitest run`
Expected: 通过(确认无残留引用;`migrate-to-ids.ts` 用相对路径,不依赖已删模块)。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "chore: remove legacy markdown import pipeline"
```

---

## Task 6: 编写 article-collector skill

**Files:**
- Create: `skills/article-collector/SKILL.md`

- [ ] **Step 1: 创建 `skills/article-collector/SKILL.md`**

```markdown
---
name: article-collector
description: Collect a Claude/Anthropic blog article (or batch), translate it paragraph-by-paragraph into simplified Chinese, and submit it to the Reader repository as id-based article JSON plus images and an updated index, then open a pull request. Use when adding new article content to the Reader app.
---

# Article Collector

Collect articles and submit them to the Reader repository as renderable, id-based JSON.

## Your job

1. Fetch the requested article URL and extract only the main article body (drop navigation, ads, footers, share widgets).
2. Find the article's **publication date**. If you cannot find one, STOP — every article must have a date.
3. Translate the body paragraph-by-paragraph into simplified Chinese. Preserve paragraph count, order, headings, lists (rendered as paragraphs), model/product/API names, and code identifiers. Do not add commentary or translator notes inside paragraph text.
4. Generate one article JSON file at `src/content/articles/<id>.json`.
5. Download content images into `public/images/<id>/` and reference them as `images/<id>/<file>`.
6. Append an entry to `src/content/index.json`.
7. Open a pull request.

## The id rule (critical)

- `id` = the publication date formatted as `YYYYMMDD` (e.g. `20260610`).
- Before writing, read `src/content/index.json`. If that `YYYYMMDD` already exists, append a two-digit sequence: first collision `20260610-01`, next `20260610-02`, always one greater than the largest existing suffix for that date.
- `id` MUST match `/^\d{8}(-\d{2})?$/`. It is the file name, the image directory, and the URL (`/article/<id>`).
- Do NOT write a `publishedAt` field. The date is derived from `id`.
- Do NOT keep a `slug` field.

## Article JSON schema

```json
{
  "id": "20260610",
  "title": "Original Article Title",
  "sourceUrl": "https://claude.com/blog/...",
  "category": "Product announcements",
  "product": "Claude Code",
  "preview": "First meaningful English paragraph or concise English summary.",
  "blocks": [
    { "type": "paragraph", "id": "p-1", "english": "...", "chinese": "..." },
    { "type": "heading", "level": 2, "english": "...", "chinese": "..." },
    { "type": "image", "src": "images/20260610/diagram.png", "alt": "..." },
    { "type": "standalone", "text": "...", "language": "en" }
  ],
  "warnings": []
}
```

Field rules:
- `id` — required, matches `/^\d{8}(-\d{2})?$/`, unique across the repo.
- `title` — required, original title.
- `sourceUrl` — required, the original article URL.
- `category` — required, short stable label (e.g. `Product announcements`, `Engineering`, `Research`, `Security`).
- `product` — **required**. One of: `API`, `Claude`, `Claude Code`, `Claude Cowork`, `Claude Design`, `Claude Enterprise`, `Claude Managed Agents`, `Claude Platform`.
- `preview` — required, English. Prefer the first meaningful English paragraph.
- `blocks` — required, the renderable body.
- `warnings` — usually `[]`. Add an entry only for known content loss (skipped table, code block).

## Block types

Paragraph (paragraph IDs start at `p-1` and increment with no gaps; every paragraph MUST have both `english` and `chinese`; never split one source paragraph into multiple Chinese paragraphs or merge several into one):
```json
{ "type": "paragraph", "id": "p-1", "english": "...", "chinese": "..." }
```

Paired heading (`level` is 2–6; prefer paired headings for translated articles):
```json
{ "type": "heading", "level": 2, "english": "...", "chinese": "..." }
```

Standalone heading (only when not an en/zh pair; `language` is `en` | `zh` | `mixed`):
```json
{ "type": "heading", "level": 2, "text": "Appendix", "language": "en" }
```

Image (store under `public/images/<id>/`; descriptive `alt`; never hotlink; skip avatars, social icons, ads, tracking pixels):
```json
{ "type": "image", "src": "images/20260610/diagram.png", "alt": "Architecture diagram" }
```

Standalone text (use sparingly, for non-paired blocks):
```json
{ "type": "standalone", "text": "...", "language": "en" }
```

## index.json

Append one entry per article, keep the array sorted by `id` descending (newest first):
```json
{ "id": "20260610", "title": "...", "category": "...", "product": "...", "preview": "..." }
```

## Repository boundary

You may change ONLY:
- `src/content/articles/*.json`
- `src/content/index.json`
- `public/images/<id>/*`

Do NOT modify application code, CSS, package files, build scripts, tests, or docs (including this skill and the content template) unless the repository owner explicitly asks.

All files must be valid UTF-8. If Chinese shows mojibake (e.g. `闅忕潃`), regenerate as UTF-8.

## Images

- Download only meaningful content images (diagrams, screenshots, photos that are part of the article).
- Confirm an article genuinely has no images before skipping — do not omit images the original includes.
- A single image block per image, on its own line in the body where it appears.

## Pull request

- Branch: `content/YYYY-MM-DD-<short-topic>`
- Commit: `content: add <article title or batch>`
- PR title: `Content: <article title or batch>`

PR body:
```markdown
## Source
- URL: <source URL>
- Published: <YYYY-MM-DD>
- Category: <category>
- Product: <product>

## Content changes
- Added: `src/content/articles/<id>.json`
- Updated: `src/content/index.json`
- Images: `public/images/<id>/` or none

## Checks
- [ ] Article JSON is valid UTF-8 and parses.
- [ ] `id` matches `/^\d{8}(-\d{2})?$/` and is unique.
- [ ] Every paragraph has `english` and `chinese`; IDs are sequential.
- [ ] `product` and `sourceUrl` are present.
- [ ] `index.json` includes the new entry, sorted newest first.
- [ ] No Reader application code was changed.
- [ ] No secrets, cookies, tokens, or credentials committed.
```

## Before opening the PR, verify

- JSON parses successfully.
- `id` is valid and unique (re-check `index.json`).
- Every paragraph has both `english` and `chinese`; IDs are `p-1`, `p-2`, … with no gaps.
- `product` and `sourceUrl` are filled.
- `index.json` references the article and stays sorted by `id` descending.
- No files outside the repository boundary were changed.
```

- [ ] **Step 2: 提交**

```bash
git add skills/article-collector/SKILL.md
git commit -m "feat: add article-collector skill for Hermes"
```

---

## Task 7: 更新内容契约模板到新 schema

**Files:**
- Modify: `docs/HERMES_CONTENT_TEMPLATE.md`

- [ ] **Step 1: 更新模板**

把模板中所有 `slug` 替换为 `id`(规则改为日期型),移除 `publishedAt` 字段及其说明(注明日期由 `id` 推导),将 `product` 标注为必填,图片/JSON 示例路径中的 `<article-slug>` / `example-article` 改为 `<id>` / 日期型示例(如 `20260610`)。具体改动点:

1. "Required output" 段:`<slug>.json` → `<id>.json`;`public/images/<article-slug>/*` → `public/images/<id>/*`。
2. "Article JSON schema" 示例:把 `"slug": "example-article"` 换成 `"id": "20260610"`,删除 `"publishedAt": "2026-06-23"` 这一行。
3. Field rules:
   - `id`:Lowercase date id `YYYYMMDD`,同日多篇加 `-NN` 序号;全库唯一。取代原 `slug` 段。
   - 删除 `publishedAt` 段,新增一行说明:"The publication date is derived from `id`; do not write a `publishedAt` field."
   - `product` 段:从可选改为 **Required**。
4. "Index JSON schema" 示例:把 `"slug"` 换成 `"id": "20260610"`,删除 `publishedAt` 行。
5. "Hermes agent prompt template" 段:`slug` 相关说明换成 id 规则;schema 列表里 `slug` 换 `id`、删 `publishedAt`、`product` 标必填。

- [ ] **Step 2: 提交**

```bash
git add docs/HERMES_CONTENT_TEMPLATE.md
git commit -m "docs: update hermes content template to id-based schema"
```

---

## Task 8: 最终验收

- [ ] **Step 1: 全量校验**

Run: `npm run typecheck && npx vitest run && npm run build`
Expected: 全部通过。

- [ ] **Step 2: 手动验收(可选,本地 dev)**

Run: `npm run dev`,打开浏览器:
- 首页文章按日期从新到旧排列,卡片显示 Date / Category / Product(三列)。
- 点进一篇文章,URL 形如 `/article/20260610`,头部显示 Date / Category / Product / Source 四列。
- 点 Source 列的"原文"链接,在新标签页打开原文。
- 点正文段落,底部弹出中文译文。

- [ ] **Step 3: 确认迁移脚本保留**

`scripts/migrate-to-ids.ts` 保留(一次性工具,便于将来复跑),无需删除。

---

## Self-Review 记录

**Spec 覆盖检查:**
- ① product 必填 → Task 3 types + ArticleMetadata 透传 + Task 6/7 skill/template 要求;迁移后缺失清单由 Task 4 脚本输出,后续 Hermes 清洗(spec 第 5 节、范围外明确)。✅
- ② 缺图片 → spec 定为 Hermes 重新检查(范围外明确"已有数据清洗"不在本次);Task 6 skill 含"确认无图才跳过"约束,驱动后续抓取/清洗。✅
- ③ URL slug → Task 1 id 工具、Task 3 路由切换、Task 4 数据迁移。✅
- ④ 源文链接 → Task 3 ArticleMetadata Source 列 + 测试断言。✅
- ⑤ 抓取 skill → Task 6。✅
- 废弃 publishedAt → Task 3 types + Task 4 迁移删除。✅
- 删除解析管线 → Task 5。✅
- 更新模板 → Task 7。✅

**类型一致性:** `isValidArticleId` / `idToDateLabel` / `nextIdForDate`(Task 1)在 Task 3 与 Task 4 引用一致;`loadArticleById`(Task 3 loaders)在测试 mock 中一致;`ArticleMetadata` 的 props(`id`, `sourceUrl`)在 header/card/page 调用处一致。✅

**实现决策补充(spec 3.2 之外):** 卡片(列表)不显示 Source 列(只显示 Date/Category/Product 三列),Source 仅在阅读页头部显示——因为 `index.json` 不含 `sourceUrl`,且列表项空间紧凑。`ArticleMetadata` 通过 `visibleFields` 自适应列数,Source 列仅当传入 `sourceUrl` 时渲染,故同一组件在卡片(三列)与头部(四列)复用,无需改 index schema。
