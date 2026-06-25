# Hermes content submission template

This document defines the content contract for Hermes agents that submit articles to the Reader repository.

Hermes must generate final Reader content files. Reader should not need to fetch, translate, parse Markdown, or transform the submitted article before rendering.

## Repository boundary

Hermes may change only these paths:

```text
src/content/articles/*.json
src/content/index.json
public/images/<id>/*
```

Hermes must not change application code, styles, package files, tests, build scripts, or documentation unless explicitly requested by the repository owner.

## Required output

For every collected article, Hermes must create one article JSON file:

```text
src/content/articles/<id>.json
```

Hermes must also update:

```text
src/content/index.json
```

If the article contains images, Hermes must download and store them under:

```text
public/images/<id>/<image-file-name>
```

Image references inside article JSON must use paths relative to `public/`, for example:

```json
{
  "type": "image",
  "src": "images/20260610/diagram-01.png",
  "alt": "Architecture diagram"
}
```

## Article JSON schema

Each article file must be valid UTF-8 JSON and follow this shape:

```json
{
  "id": "20260610",
  "title": "Example Article Title",
  "sourceUrl": "https://example.com/article",
  "category": "AI / Engineering",
  "product": "Claude Code",
  "preview": "The first English paragraph or a concise English summary.",
  "blocks": [
    {
      "type": "paragraph",
      "id": "p-1",
      "english": "Original English paragraph.",
      "chinese": "对应的中文翻译段落。"
    }
  ],
  "warnings": []
}
```

### Field rules

`id`
: Publication date as `YYYYMMDD`. If another article shares the same date, append a two-digit sequence (`-01`, `-02`, ...). Must be unique across all articles. The publication date is derived from `id`; do NOT add a separate `publishedAt` field.

`title`
: Human-readable article title. Keep the original title unless it is unavailable.

`sourceUrl`
: Original article URL. Required for fetched articles.

`category`
: Short category label used by the Reader home page. Prefer stable labels such as `AI / Engineering`, `Product`, `Research`, or `Security`.

`product`
: **Required.** One of: `API`, `Claude`, `Claude Code`, `Claude Cowork`, `Claude Design`, `Claude Enterprise`, `Claude Managed Agents`, `Claude Platform`.

`preview`
: A short English preview. Prefer the first meaningful English paragraph. Do not put Chinese-only text here.

`blocks`
: The final renderable article body. Every paragraph block must include both `english` and `chinese`.

`warnings`
: Usually `[]`. Add warnings only for known content loss, for example skipped tables or code blocks.

## Supported block types

### Paragraph

Use for normal article paragraphs.

```json
{
  "type": "paragraph",
  "id": "p-1",
  "english": "Original English paragraph.",
  "chinese": "对应的中文翻译段落。"
}
```

Rules:

- Paragraph IDs must start at `p-1` and increase without gaps.
- Do not split one original paragraph into multiple Chinese paragraphs.
- Do not merge multiple original paragraphs into one translated paragraph.
- Keep inline product names, code identifiers, and proper nouns accurate.

### Paired heading

Use when both English and Chinese heading text are available.

```json
{
  "type": "heading",
  "level": 2,
  "english": "System Architecture",
  "chinese": "系统架构"
}
```

Rules:

- `level` must be one of `2`, `3`, `4`, `5`, or `6`.
- Prefer paired headings for translated English articles.

### Standalone heading

Use only when the heading is not part of an English/Chinese pair.

```json
{
  "type": "heading",
  "level": 2,
  "text": "Appendix",
  "language": "en"
}
```

`language` must be `en`, `zh`, or `mixed`.

### Image

Use for downloaded article images.

```json
{
  "type": "image",
  "src": "images/20260610/diagram-01.png",
  "alt": "Architecture diagram"
}
```

Rules:

- Store the file under `public/images/<id>/`.
- Use descriptive `alt` text.
- Do not hotlink remote images.
- Skip tracking pixels, avatars, social icons, ads, and decorative images.

### Standalone text

Use for content that should render as a standalone block and does not have a translation pair.

```json
{
  "type": "standalone",
  "text": "Source: https://example.com/article",
  "language": "en"
}
```

Use this sparingly.

## Index JSON schema

`src/content/index.json` must be an array of article summaries:

```json
[
  {
    "id": "20260610",
    "title": "Example Article Title",
    "category": "AI / Engineering",
    "product": "Claude Code",
    "preview": "The first English paragraph or a concise English summary."
  }
]
```

Rules:

- Every article JSON file must have one matching index entry.
- Every index entry must point to an existing article JSON file.
- Keep the list sorted by `id` descending (newest first).
- Do not duplicate ids.

## Translation rules

Hermes must translate paragraph by paragraph.

Required behavior:

- Preserve paragraph count and order.
- Preserve headings, lists converted to paragraphs, important inline terms, model names, company names, API names, and code identifiers.
- Translate naturally into simplified Chinese.
- Do not add commentary, summaries, explanations, or translator notes inside paragraph text.
- Do not use mojibake or incorrectly decoded text. If Chinese contains corrupted sequences such as `闅忕潃`, regenerate the file as UTF-8.

## PR rules

Hermes should submit content through a pull request, not direct pushes to `main`.

Branch name:

```text
content/YYYY-MM-DD-<short-source-or-topic>
```

Commit message:

```text
content: add <article title or source batch>
```

Pull request title:

```text
Content: <article title or source batch>
```

Pull request body template:

```markdown
## Source

- URL: <source URL>
- Published: <YYYY-MM-DD or unknown>
- Category: <category>
- Product: <product>

## Content changes

- Added: `src/content/articles/<id>.json`
- Updated: `src/content/index.json`
- Images: `public/images/<id>/` or none

## Hermes checks

- [ ] Article JSON is valid UTF-8.
- [ ] Every paragraph has `english` and `chinese`.
- [ ] Paragraph IDs are sequential.
- [ ] `id` is valid and unique.
- [ ] `product` and `sourceUrl` are present.
- [ ] `src/content/index.json` includes the new article.
- [ ] No Reader application code was changed.
- [ ] No secrets, cookies, tokens, or private credentials were committed.
```

## Hermes agent prompt template

Use this as the task prompt for Hermes:

```text
You are collecting content for the Reader repository.

Your job:
1. Fetch the requested article or source batch.
2. Extract only the main article content.
3. Translate the article paragraph by paragraph into simplified Chinese.
4. Generate final Reader article JSON files directly under `src/content/articles/`.
5. Update `src/content/index.json`.
6. Download necessary article images into `public/images/<id>/` and reference them as `images/<id>/<file>`.
7. Open a pull request.

Repository rules:
- You may change only:
  - `src/content/articles/*.json`
  - `src/content/index.json`
  - `public/images/<id>/*`
- Do not modify application code, CSS, package files, build scripts, tests, or docs.
- Do not submit Markdown source files.
- Do not require Reader to run an importer or parser.
- Every submitted article must already match the Reader renderable JSON schema.
- All files must be valid UTF-8.

Article schema:
- `id`: publication date as `YYYYMMDD`, unique. If collision, append `-01`, `-02`, etc. Date is derived from `id`; do not add a separate `publishedAt` field.
- `title`: original article title.
- `sourceUrl`: original URL.
- `category`: short stable category.
- `product`: **required.** Product the article belongs to.
- `preview`: first meaningful English paragraph or concise English summary.
- `blocks`: final renderable body.
- `warnings`: usually `[]`.

Paragraph block:
{
  "type": "paragraph",
  "id": "p-1",
  "english": "...",
  "chinese": "..."
}

Heading block:
{
  "type": "heading",
  "level": 2,
  "english": "...",
  "chinese": "..."
}

Image block:
{
  "type": "image",
  "src": "images/<id>/<file>",
  "alt": "..."
}

Before opening the PR, verify:
- JSON parses successfully.
- `id` is valid (`YYYYMMDD` with optional `-NN` suffix) and unique.
- `product` and `sourceUrl` are present.
- `src/content/index.json` references the article and stays sorted by `id` descending.
- Paragraph IDs are sequential.
- Every paragraph has both English and Chinese.
- No unrelated files changed.
```

