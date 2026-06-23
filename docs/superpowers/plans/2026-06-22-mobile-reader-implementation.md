# Mobile Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web reader that imports the local Claude blog translation Markdown files, renders English-first reading pages, and shows Chinese translations in a bottom drawer when a paragraph is tapped.

**Architecture:** Use a static React + TypeScript client app backed by build-time generated JSON content. A Node-based importer reads the Markdown corpus, pairs English and Chinese paragraphs into deterministic content blocks, and emits normalized article data consumed by the UI. Theme state and active paragraph state stay entirely client-side.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Node.js scripts

---

## Planned File Structure

### Root setup

- `package.json`: app scripts and dependencies
- `tsconfig.json`: TypeScript project config
- `tsconfig.node.json`: TypeScript config for tooling scripts
- `vite.config.ts`: Vite config
- `index.html`: Vite entry HTML
- `.gitignore`: ignore `node_modules`, build output, generated content

### Generated content and importer

- `scripts/import-articles.ts`: read Markdown source files and generate JSON output
- `src/lib/content/types.ts`: shared article data types
- `src/lib/content/parseArticle.ts`: parse one Markdown file into structured blocks
- `src/lib/content/parseMetadata.ts`: extract title and metadata from article header
- `src/lib/content/pairBlocks.ts`: pair English and Chinese headings and paragraphs
- `src/lib/content/paths.ts`: source and output path helpers
- `src/content/index.json`: generated article index
- `src/content/articles/*.json`: generated article payloads

### App UI

- `src/main.tsx`: app bootstrap
- `src/App.tsx`: route shell
- `src/styles.css`: global styles and theme tokens
- `src/routes/HomePage.tsx`: article list page
- `src/routes/ArticlePage.tsx`: reading page
- `src/components/ThemeToggle.tsx`: day/night mode toggle
- `src/components/ArticleCard.tsx`: list card UI
- `src/components/ArticleHeader.tsx`: title and metadata header
- `src/components/ArticleContent.tsx`: render article blocks
- `src/components/ParagraphBlock.tsx`: tappable paragraph block
- `src/components/TranslationDrawer.tsx`: mobile-first bottom drawer
- `src/lib/theme.ts`: theme persistence and system preference helpers
- `src/lib/content/loaders.ts`: import generated JSON into UI

### Tests

- `src/lib/content/parseArticle.test.ts`: parser coverage
- `src/lib/content/pairBlocks.test.ts`: paragraph pairing rules
- `src/components/TranslationDrawer.test.tsx`: drawer interaction
- `src/routes/ArticlePage.test.tsx`: paragraph tap workflow
- `src/lib/theme.test.ts`: theme persistence helpers

## Task 1: Initialize the Project Skeleton

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Initialize local Git and connect the remote**

Run:

```bash
git init
git remote add origin https://github.com/2720768239/Reader.git
git branch -M main
git remote -v
```

Expected:

- `origin` appears for fetch and push
- the working tree is now a local Git repository

- [ ] **Step 2: Write the base project manifest**

Create `package.json`:

```json
{
  "name": "reader",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "npm run import:articles && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "import:articles": "node --loader tsx scripts/import-articles.ts"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^24.0.3",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.5.2",
    "jsdom": "^26.1.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 3: Write TypeScript and Vite config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "scripts", "vite.config.ts"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts"
  }
});
```

- [ ] **Step 4: Write the root app shell**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reader</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
import { Route, Routes } from "react-router-dom";
import HomePage from "./routes/HomePage";
import ArticlePage from "./routes/ArticlePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/:slug" element={<ArticlePage />} />
    </Routes>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color-scheme: light;
  --bg: #f6f1e8;
  --surface: rgba(255, 255, 255, 0.78);
  --surface-strong: #fffdf8;
  --text: #1f1b16;
  --muted: #6f6559;
  --accent: #a56a2a;
  --accent-soft: rgba(165, 106, 42, 0.14);
  --border: rgba(56, 43, 28, 0.1);
  --shadow: 0 20px 60px rgba(31, 27, 22, 0.08);
  --content-width: 42rem;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #171513;
  --surface: rgba(30, 27, 24, 0.92);
  --surface-strong: #211d1a;
  --text: #f4ede3;
  --muted: #b5a895;
  --accent: #d49b5c;
  --accent-soft: rgba(212, 155, 92, 0.16);
  --border: rgba(244, 237, 227, 0.08);
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
}

body {
  margin: 0;
  font-family: "Georgia", "Times New Roman", serif;
  background:
    radial-gradient(circle at top, rgba(212, 155, 92, 0.14), transparent 30%),
    var(--bg);
  color: var(--text);
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 5: Add test setup and ignore rules**

Create `.gitignore`:

```gitignore
node_modules
dist
coverage
src/content/index.json
src/content/articles
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected:

- `node_modules` is created
- `package-lock.json` is created
- install exits successfully

- [ ] **Step 7: Run the empty test suite**

Run:

```bash
npm test
```

Expected:

- Vitest starts successfully
- zero tests or no test files message is acceptable at this stage

- [ ] **Step 8: Commit**

Run:

```bash
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html src
git commit -m "chore: bootstrap reader app"
```

## Task 2: Build and Test the Content Importer

**Files:**
- Create: `scripts/import-articles.ts`
- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/paths.ts`
- Create: `src/lib/content/parseMetadata.ts`
- Create: `src/lib/content/pairBlocks.ts`
- Create: `src/lib/content/parseArticle.ts`
- Test: `src/lib/content/pairBlocks.test.ts`
- Test: `src/lib/content/parseArticle.test.ts`

- [ ] **Step 1: Write the failing pairing tests**

Create `src/lib/content/pairBlocks.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pairBlocks } from "./pairBlocks";

describe("pairBlocks", () => {
  it("pairs adjacent english and chinese paragraphs", () => {
    const result = pairBlocks([
      { type: "paragraph", text: "English paragraph." },
      { type: "paragraph", text: "中文段落。" }
    ]);

    expect(result).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      }
    ]);
  });

  it("pairs adjacent heading translations into one heading block", () => {
    const result = pairBlocks([
      { type: "heading", level: 2, text: "Heading" },
      { type: "heading", level: 2, text: "标题" }
    ]);

    expect(result).toEqual([
      {
        type: "heading",
        level: 2,
        english: "Heading",
        chinese: "标题"
      }
    ]);
  });
});
```

- [ ] **Step 2: Run pairing tests to verify they fail**

Run:

```bash
npm test -- src/lib/content/pairBlocks.test.ts
```

Expected:

- FAIL because `pairBlocks` does not exist yet

- [ ] **Step 3: Write the minimal pairing implementation**

Create `src/lib/content/types.ts`:

```ts
export type RawBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string };

export type ArticleBlock =
  | { type: "heading"; level: 2 | 3 | 4; english: string; chinese?: string }
  | { type: "paragraph"; id: string; english: string; chinese: string }
  | { type: "image"; src: string; alt: string };

export type ArticleRecord = {
  slug: string;
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  preview?: string;
  blocks: ArticleBlock[];
};
```

Create `src/lib/content/pairBlocks.ts`:

```ts
import type { ArticleBlock, RawBlock } from "./types";

const hasChinese = (text: string) => /[\u3400-\u9fff]/u.test(text);

export function pairBlocks(rawBlocks: RawBlock[]): ArticleBlock[] {
  const result: ArticleBlock[] = [];
  let paragraphCount = 0;

  for (let index = 0; index < rawBlocks.length; index += 1) {
    const current = rawBlocks[index];
    const next = rawBlocks[index + 1];

    if (
      current.type === "heading" &&
      current.level >= 2 &&
      next?.type === "heading" &&
      next.level === current.level &&
      !hasChinese(current.text) &&
      hasChinese(next.text)
    ) {
      result.push({
        type: "heading",
        level: current.level,
        english: current.text,
        chinese: next.text
      });
      index += 1;
      continue;
    }

    if (
      current.type === "paragraph" &&
      next?.type === "paragraph" &&
      !hasChinese(current.text) &&
      hasChinese(next.text)
    ) {
      paragraphCount += 1;
      result.push({
        type: "paragraph",
        id: `p-${paragraphCount}`,
        english: current.text,
        chinese: next.text
      });
      index += 1;
      continue;
    }

    if (current.type === "image") {
      result.push(current);
    }
  }

  return result;
}
```

- [ ] **Step 4: Run pairing tests to verify they pass**

Run:

```bash
npm test -- src/lib/content/pairBlocks.test.ts
```

Expected:

- PASS

- [ ] **Step 5: Write the failing article parser test**

Create `src/lib/content/parseArticle.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseArticle } from "./parseArticle";

describe("parseArticle", () => {
  it("extracts metadata and paragraph pairs from a markdown article", () => {
    const markdown = `# Example Title

> 原文链接：https://example.com/post
> 发布时间：June 10, 2026
> 分类：Agents

---

English intro paragraph.

中文介绍段落。

## Section One

## 第一节

Another english paragraph.

另一段中文。
`;

    const article = parseArticle("01-example.md", markdown);

    expect(article.title).toBe("Example Title");
    expect(article.sourceUrl).toBe("https://example.com/post");
    expect(article.category).toBe("Agents");
    expect(article.blocks).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English intro paragraph.",
        chinese: "中文介绍段落。"
      },
      {
        type: "heading",
        level: 2,
        english: "Section One",
        chinese: "第一节"
      },
      {
        type: "paragraph",
        id: "p-2",
        english: "Another english paragraph.",
        chinese: "另一段中文。"
      }
    ]);
  });
});
```

- [ ] **Step 6: Run parser tests to verify they fail**

Run:

```bash
npm test -- src/lib/content/parseArticle.test.ts
```

Expected:

- FAIL because `parseArticle` does not exist yet

- [ ] **Step 7: Write the minimal parser implementation**

Create `src/lib/content/parseMetadata.ts`:

```ts
export type ParsedMetadata = {
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  bodyStartIndex: number;
};

export function parseMetadata(lines: string[]): ParsedMetadata {
  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine?.replace(/^# /, "").trim() ?? "Untitled";

  let sourceUrl: string | undefined;
  let publishedAt: string | undefined;
  let category: string | undefined;
  let bodyStartIndex = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (line.startsWith("> 原文链接：") || line.startsWith("> 原文链接:")) {
      sourceUrl = line.replace(/^> 原文链接：[ ]?/, "").replace(/^> 原文链接:[ ]?/, "");
    }

    if (line.startsWith("> 发布时间：") || line.startsWith("> 发布时间:")) {
      publishedAt = line.replace(/^> 发布时间：[ ]?/, "").replace(/^> 发布时间:[ ]?/, "");
    }

    if (line.startsWith("> 分类：") || line.startsWith("> 分类:")) {
      category = line.replace(/^> 分类：[ ]?/, "").replace(/^> 分类:[ ]?/, "");
    }

    if (line === "---") {
      bodyStartIndex = index + 1;
      break;
    }
  }

  return { title, sourceUrl, publishedAt, category, bodyStartIndex };
}
```

Create `src/lib/content/parseArticle.ts`:

```ts
import { pairBlocks } from "./pairBlocks";
import { parseMetadata } from "./parseMetadata";
import type { ArticleRecord, RawBlock } from "./types";

function slugFromFilename(filename: string) {
  return filename.replace(/\.md$/i, "");
}

export function parseArticle(filename: string, markdown: string): ArticleRecord {
  const lines = markdown.split(/\r?\n/);
  const metadata = parseMetadata(lines);
  const bodyLines = lines.slice(metadata.bodyStartIndex);
  const rawBlocks: RawBlock[] = [];
  const buffer: string[] = [];

  const flushParagraph = () => {
    const text = buffer.join(" ").trim();
    if (text) {
      rawBlocks.push({ type: "paragraph", text });
    }
    buffer.length = 0;
  };

  for (const rawLine of bodyLines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      rawBlocks.push({ type: "heading", level: 2, text: line.replace(/^## /, "").trim() });
      continue;
    }

    if (line.startsWith("![")) {
      flushParagraph();
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        rawBlocks.push({ type: "image", alt: match[1], src: match[2] });
      }
      continue;
    }

    buffer.push(line);
  }

  flushParagraph();

  const blocks = pairBlocks(rawBlocks);
  const firstParagraph = blocks.find((block) => block.type === "paragraph");

  return {
    slug: slugFromFilename(filename),
    title: metadata.title,
    sourceUrl: metadata.sourceUrl,
    publishedAt: metadata.publishedAt,
    category: metadata.category,
    preview: firstParagraph?.type === "paragraph" ? firstParagraph.english : undefined,
    blocks
  };
}
```

Create `src/lib/content/paths.ts`:

```ts
import path from "node:path";

export const SOURCE_DIR = "E:/cwh/obsidiandata/work/Claude-Blog-Translations/2026";
export const CONTENT_DIR = path.resolve("src/content");
export const ARTICLES_DIR = path.resolve(CONTENT_DIR, "articles");
```

Create `scripts/import-articles.ts`:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import { ARTICLES_DIR, CONTENT_DIR, SOURCE_DIR } from "../src/lib/content/paths";
import { parseArticle } from "../src/lib/content/parseArticle";

async function main() {
  const files = await fs.readdir(SOURCE_DIR);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  await fs.mkdir(ARTICLES_DIR, { recursive: true });

  const index = [];

  for (const file of markdownFiles) {
    const fullPath = path.join(SOURCE_DIR, file);
    const markdown = await fs.readFile(fullPath, "utf8");
    const article = parseArticle(file, markdown);

    index.push({
      slug: article.slug,
      title: article.title,
      publishedAt: article.publishedAt,
      category: article.category,
      preview: article.preview
    });

    await fs.writeFile(
      path.join(ARTICLES_DIR, `${article.slug}.json`),
      JSON.stringify(article, null, 2),
      "utf8"
    );
  }

  await fs.writeFile(
    path.join(CONTENT_DIR, "index.json"),
    JSON.stringify(index, null, 2),
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 8: Run parser tests to verify they pass**

Run:

```bash
npm test -- src/lib/content/pairBlocks.test.ts src/lib/content/parseArticle.test.ts
```

Expected:

- PASS

- [ ] **Step 9: Run the importer against the real corpus**

Run:

```bash
npm run import:articles
```

Expected:

- `src/content/index.json` is generated
- `src/content/articles/*.json` files are generated
- failures identify specific file names instead of silently continuing

- [ ] **Step 10: Commit**

Run:

```bash
git add scripts src/lib src/content
git commit -m "feat: import translated articles"
```

## Task 3: Build the Article List and Reader Routes

**Files:**
- Create: `src/lib/content/loaders.ts`
- Create: `src/routes/HomePage.tsx`
- Create: `src/routes/ArticlePage.tsx`
- Create: `src/components/ArticleCard.tsx`
- Create: `src/components/ArticleHeader.tsx`
- Create: `src/components/ArticleContent.tsx`

- [ ] **Step 1: Write the failing page interaction test**

Create `src/routes/ArticlePage.test.tsx`:

```tsx
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ArticlePage from "./ArticlePage";

vi.mock("../lib/content/loaders", () => ({
  loadArticleBySlug: async () => ({
    slug: "demo",
    title: "Demo Article",
    blocks: [
      {
        type: "paragraph",
        id: "p-1",
        english: "First english paragraph.",
        chinese: "第一段中文。"
      }
    ]
  })
}));

describe("ArticlePage", () => {
  it("opens the translation drawer when a paragraph is tapped", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/article/demo"]}>
        <Routes>
          <Route path="/article/:slug" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    const paragraph = await screen.findByRole("button", { name: /first english paragraph/i });
    await user.click(paragraph);

    expect(screen.getByText("第一段中文。")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the page test to verify it fails**

Run:

```bash
npm test -- src/routes/ArticlePage.test.tsx
```

Expected:

- FAIL because page components and loaders are incomplete

- [ ] **Step 3: Write the minimal content loaders**

Create `src/lib/content/loaders.ts`:

```ts
import indexData from "../../content/index.json";
import type { ArticleRecord } from "./types";

type ArticleIndexEntry = {
  slug: string;
  title: string;
  publishedAt?: string;
  category?: string;
  preview?: string;
};

const articleModules = import.meta.glob("../../content/articles/*.json");

export function loadArticleIndex(): ArticleIndexEntry[] {
  return indexData as ArticleIndexEntry[];
}

export async function loadArticleBySlug(slug: string): Promise<ArticleRecord> {
  const loader = articleModules[`../../content/articles/${slug}.json`];
  if (!loader) {
    throw new Error(`Article not found: ${slug}`);
  }

  const module = (await loader()) as { default: ArticleRecord };
  return module.default;
}
```

- [ ] **Step 4: Write the list and reader components**

Create `src/components/ArticleCard.tsx`:

```tsx
import { Link } from "react-router-dom";

type Props = {
  slug: string;
  title: string;
  publishedAt?: string;
  category?: string;
  preview?: string;
};

export default function ArticleCard({ slug, title, publishedAt, category, preview }: Props) {
  return (
    <Link className="article-card" to={`/article/${slug}`}>
      <p className="article-card__meta">
        {[publishedAt, category].filter(Boolean).join(" · ")}
      </p>
      <h2>{title}</h2>
      {preview ? <p className="article-card__preview">{preview}</p> : null}
    </Link>
  );
}
```

Create `src/components/ArticleHeader.tsx`:

```tsx
type Props = {
  title: string;
  publishedAt?: string;
  category?: string;
};

export default function ArticleHeader({ title, publishedAt, category }: Props) {
  return (
    <header className="article-header">
      <p className="article-header__meta">{[publishedAt, category].filter(Boolean).join(" · ")}</p>
      <h1>{title}</h1>
    </header>
  );
}
```

Create `src/components/ArticleContent.tsx`:

```tsx
import type { ArticleBlock } from "../lib/content/types";
import ParagraphBlock from "./ParagraphBlock";

type Props = {
  blocks: ArticleBlock[];
  activeParagraphId: string | null;
  onParagraphSelect: (id: string, chinese: string) => void;
};

export default function ArticleContent({ blocks, activeParagraphId, onParagraphSelect }: Props) {
  return (
    <div className="article-content">
      {blocks.map((block) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as const;
          return <HeadingTag key={`${block.english}-${block.level}`}>{block.english}</HeadingTag>;
        }

        if (block.type === "image") {
          return <img key={block.src} src={block.src} alt={block.alt} className="article-image" />;
        }

        return (
          <ParagraphBlock
            key={block.id}
            id={block.id}
            text={block.english}
            isActive={block.id === activeParagraphId}
            onSelect={() => onParagraphSelect(block.id, block.chinese)}
          />
        );
      })}
    </div>
  );
}
```

Create `src/routes/HomePage.tsx`:

```tsx
import { loadArticleIndex } from "../lib/content/loaders";
import ArticleCard from "../components/ArticleCard";
import ThemeToggle from "../components/ThemeToggle";

export default function HomePage() {
  const articles = loadArticleIndex();

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Claude Blog Reader</p>
          <h1>Read in English, tap for Chinese.</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </section>
    </main>
  );
}
```

Create `src/routes/ArticlePage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ArticleContent from "../components/ArticleContent";
import ArticleHeader from "../components/ArticleHeader";
import ThemeToggle from "../components/ThemeToggle";
import TranslationDrawer from "../components/TranslationDrawer";
import { loadArticleBySlug } from "../lib/content/loaders";
import type { ArticleRecord } from "../lib/content/types";

export default function ArticlePage() {
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [activeChinese, setActiveChinese] = useState("");

  useEffect(() => {
    loadArticleBySlug(slug).then(setArticle);
  }, [slug]);

  if (!article) {
    return <main className="page-shell">Loading…</main>;
  }

  return (
    <main className="page-shell page-shell--reader">
      <header className="topbar">
        <Link to="/">Back</Link>
        <ThemeToggle />
      </header>

      <ArticleHeader
        title={article.title}
        publishedAt={article.publishedAt}
        category={article.category}
      />

      <ArticleContent
        blocks={article.blocks}
        activeParagraphId={activeParagraphId}
        onParagraphSelect={(id, chinese) => {
          setActiveParagraphId(id);
          setActiveChinese(chinese);
        }}
      />

      <TranslationDrawer
        open={Boolean(activeParagraphId)}
        text={activeChinese}
        onClose={() => {
          setActiveParagraphId(null);
          setActiveChinese("");
        }}
      />
    </main>
  );
}
```

- [ ] **Step 5: Run the page test to verify it passes**

Run:

```bash
npm test -- src/routes/ArticlePage.test.tsx
```

Expected:

- PASS after dependent UI components exist

- [ ] **Step 6: Commit**

Run:

```bash
git add src/routes src/components src/lib/content/loaders.ts
git commit -m "feat: render article list and reader routes"
```

## Task 4: Implement the Translation Drawer and Theme System

**Files:**
- Create: `src/components/ParagraphBlock.tsx`
- Create: `src/components/TranslationDrawer.tsx`
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/lib/theme.ts`
- Test: `src/components/TranslationDrawer.test.tsx`
- Test: `src/lib/theme.test.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Write the failing drawer and theme tests**

Create `src/components/TranslationDrawer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TranslationDrawer from "./TranslationDrawer";

describe("TranslationDrawer", () => {
  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<TranslationDrawer open text="中文内容" onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /close translation/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

Create `src/lib/theme.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, readStoredTheme } from "./theme";

describe("theme helpers", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("persists the selected theme", () => {
    applyTheme("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readStoredTheme()).toBe("dark");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/components/TranslationDrawer.test.tsx src/lib/theme.test.ts
```

Expected:

- FAIL because components and helpers do not exist yet

- [ ] **Step 3: Write the minimal drawer, paragraph, and theme code**

Create `src/lib/theme.ts`:

```ts
export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "reader-theme";

export function readStoredTheme(): ThemeMode | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function resolveInitialTheme(): ThemeMode {
  const stored = readStoredTheme();
  if (stored) {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}
```

Create `src/components/ThemeToggle.tsx`:

```tsx
import { useEffect, useState } from "react";
import { applyTheme, resolveInitialTheme, type ThemeMode } from "../lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = resolveInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle theme"
      onClick={() => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }}
    >
      {theme === "light" ? "Night" : "Day"}
    </button>
  );
}
```

Create `src/components/ParagraphBlock.tsx`:

```tsx
type Props = {
  id: string;
  text: string;
  isActive: boolean;
  onSelect: () => void;
};

export default function ParagraphBlock({ id, text, isActive, onSelect }: Props) {
  return (
    <button
      type="button"
      id={id}
      className={isActive ? "paragraph-block paragraph-block--active" : "paragraph-block"}
      onClick={onSelect}
    >
      {text}
    </button>
  );
}
```

Create `src/components/TranslationDrawer.tsx`:

```tsx
type Props = {
  open: boolean;
  text: string;
  onClose: () => void;
};

export default function TranslationDrawer({ open, text, onClose }: Props) {
  return (
    <aside className={open ? "translation-drawer translation-drawer--open" : "translation-drawer"}>
      <div className="translation-drawer__handle" />
      <div className="translation-drawer__header">
        <strong>Chinese Translation</strong>
        <button type="button" onClick={onClose} aria-label="Close translation">
          Close
        </button>
      </div>
      <div className="translation-drawer__body">
        <p>{text}</p>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Add the supporting styles**

Append to `src/styles.css`:

```css
#root {
  min-height: 100vh;
}

.page-shell {
  width: min(100%, calc(var(--content-width) + 2rem));
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.eyebrow,
.article-card__meta,
.article-header__meta {
  color: var(--muted);
  font-size: 0.85rem;
  letter-spacing: 0.03em;
}

.article-list {
  display: grid;
  gap: 1rem;
}

.article-card {
  display: block;
  padding: 1.1rem;
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  background: var(--surface);
  box-shadow: var(--shadow);
  color: inherit;
  text-decoration: none;
}

.article-content {
  display: grid;
  gap: 1rem;
}

.paragraph-block {
  width: 100%;
  border: 0;
  border-radius: 1rem;
  padding: 0.4rem 0.3rem;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1.8;
  text-align: left;
}

.paragraph-block--active {
  background: var(--accent-soft);
}

.translation-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(calc(100% - 3.5rem));
  transition: transform 180ms ease;
  border-radius: 1.5rem 1.5rem 0 0;
  background: var(--surface-strong);
  border-top: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 0.75rem 1rem calc(1rem + env(safe-area-inset-bottom));
}

.translation-drawer--open {
  transform: translateY(0);
}

.translation-drawer__handle {
  width: 3rem;
  height: 0.3rem;
  margin: 0 auto 0.75rem;
  border-radius: 999px;
  background: var(--border);
}

.translation-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.theme-toggle {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.6rem 0.85rem;
  background: var(--surface);
  color: inherit;
}

@media (min-width: 768px) {
  .translation-drawer {
    left: 50%;
    width: min(42rem, calc(100% - 2rem));
    transform: translate(-50%, calc(100% - 3.5rem));
  }

  .translation-drawer--open {
    transform: translate(-50%, 0);
  }
}
```

- [ ] **Step 5: Run the drawer and theme tests to verify they pass**

Run:

```bash
npm test -- src/components/TranslationDrawer.test.tsx src/lib/theme.test.ts src/routes/ArticlePage.test.tsx
```

Expected:

- PASS

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components src/lib/theme.ts src/lib/theme.test.ts src/styles.css
git commit -m "feat: add mobile drawer and night mode"
```

## Task 5: Verify the Full Flow and Harden the Build

**Files:**
- Modify: `src/lib/content/parseArticle.test.ts`
- Modify: `src/routes/ArticlePage.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add one more failing parser test for images**

Append to `src/lib/content/parseArticle.test.ts`:

```ts
it("preserves image blocks in the reading flow", () => {
  const markdown = `# Example Title

---

English paragraph.

中文段落。

![Diagram](images/example.png)

Another english paragraph.

另一段中文。
`;

  const article = parseArticle("02-example.md", markdown);

  expect(article.blocks).toEqual([
    {
      type: "paragraph",
      id: "p-1",
      english: "English paragraph.",
      chinese: "中文段落。"
    },
    {
      type: "image",
      src: "images/example.png",
      alt: "Diagram"
    },
    {
      type: "paragraph",
      id: "p-2",
      english: "Another english paragraph.",
      chinese: "另一段中文。"
    }
  ]);
});
```

- [ ] **Step 2: Run the parser test to verify it fails if image handling regressed**

Run:

```bash
npm test -- src/lib/content/parseArticle.test.ts
```

Expected:

- PASS if current parser already preserves images
- if FAIL, fix parser before continuing

- [ ] **Step 3: Run the importer, test suite, and production build**

Run:

```bash
npm run import:articles
npm test
npm run build
```

Expected:

- importer succeeds on the real article corpus
- all parser and UI tests pass
- Vite build succeeds and outputs `dist`

- [ ] **Step 4: Manual mobile verification**

Run:

```bash
npm run dev
```

Verify manually in a phone-sized viewport:

- article list is readable and tappable
- article page keeps a comfortable reading width
- tapping a paragraph opens the bottom drawer
- tapping another paragraph updates the Chinese translation
- theme toggle works on both list and reading pages
- drawer does not cover system-safe area awkwardly

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/content/parseArticle.test.ts src/routes/ArticlePage.test.tsx src/styles.css package.json package-lock.json
git commit -m "test: verify mobile reading flow"
```

## Spec Coverage Check

- Local Markdown import: covered in Task 2
- Structured article data with deterministic pairing: covered in Task 2
- Mobile-first article list: covered in Task 3 and Task 4
- English-first reading page: covered in Task 3
- Bottom drawer translation interaction: covered in Task 3 and Task 4
- Day and night mode with persistence: covered in Task 4
- Image preservation and malformed-content visibility: covered in Task 2 and Task 5
- Mobile verification path: covered in Task 5

## Self-Review Notes

- No placeholders remain in the task steps
- The plan keeps the first version limited to the confirmed scope
- The highest-risk behavior, paragraph pairing, is implemented test-first before UI work
