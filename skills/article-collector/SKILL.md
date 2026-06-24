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
- `product` — **required**. The product this belongs to (e.g. `Claude Code`, `Claude Platform`, `Claude Managed Agents`, `API`, `Claude.ai`). If genuinely none, use `General`.
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
