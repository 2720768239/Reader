---
name: article-collector
description: Use when adding or repairing Claude or Anthropic blog content in the Reader repository, including new article ingestion, translation backfill, image recovery, metadata normalization, or index updates for `src/content/articles/*.json`, `src/content/index.json`, and article image folders under `public/images/`.
---

# Article Collector

Collect Claude or Anthropic blog content and submit renderable Reader artifacts only.

## Repository boundary

Change only:
- `src/content/articles/*.json`
- `src/content/index.json`
- `public/images/<id>/*`

Do not modify application code, tests, docs, build scripts, or package files unless the repository owner explicitly asks.

Reader is a rendering boundary. Do not add repo-side importer logic, parser logic, slug migration logic, or schema extensions just to fit one article.

## Read first

Before editing content, read:
1. `src/lib/content/types.ts`
2. `src/content/index.json`
3. One recent article JSON in `src/content/articles/`

Use those files as the source of truth if this skill and the repo ever disagree.

## Your job

1. Fetch the requested article URL and extract only the main article body. Drop navigation, footers, share widgets, ads, and tracking fragments.
2. Find the publication date. If you cannot verify a date, stop.
3. Derive the article `id` from the date and resolve collisions using `src/content/index.json`.
4. Translate the article paragraph by paragraph into simplified Chinese.
5. Save one renderable article JSON at `src/content/articles/<id>.json`.
6. Download meaningful content images into `public/images/<id>/` and reference them as `images/<id>/<file>`.
7. Add or update the matching entry in `src/content/index.json`, keeping the array sorted by `id` descending.
8. Prepare a branch, commit, and pull request only after the content artifacts validate cleanly.

## ID rule

- Base `id` is the publication date formatted as `YYYYMMDD`.
- If that base `id` already exists, append a two-digit suffix: `YYYYMMDD-01`, `YYYYMMDD-02`, and so on.
- Pick the next suffix greater than the largest existing suffix for that date.
- `id` must match `/^\d{8}(-\d{2})?$/`.
- The same `id` is used for:
  - the article file name
  - the image directory
  - the article URL path `/article/<id>`
- Do not add `publishedAt`.
- Do not add `slug`.

## Article schema

```json
{
  "id": "20260610",
  "title": "Original Article Title",
  "sourceUrl": "https://claude.com/blog/example",
  "category": "Product announcements",
  "product": "Claude Code",
  "preview": "First meaningful English paragraph or a concise English summary.",
  "blocks": [
    { "type": "heading", "level": 2, "english": "...", "chinese": "..." },
    { "type": "paragraph", "id": "p-1", "english": "...", "chinese": "..." },
    { "type": "image", "src": "images/20260610/diagram.png", "alt": "Chinese image description" }
  ],
  "warnings": [
    { "code": "table", "message": "Skipped comparison table after paragraph p-7." }
  ]
}
```

Required top-level fields:
- `id`
- `title`
- `sourceUrl`
- `category`
- `product`
- `preview`
- `blocks`
- `warnings`

## Field rules

- `title`: keep the original article title.
- `sourceUrl`: keep the original canonical article URL.
- `category`: use a short stable English label already used by the repo when possible.
- `product`: required. Use one of:
  - `API`
  - `Claude`
  - `Claude Code`
  - `Claude Cowork`
  - `Claude Design`
  - `Claude Enterprise`
  - `Claude Managed Agents`
  - `Claude Platform`
- `preview`: English only. Prefer the first meaningful English paragraph. Use a concise English summary only if the first paragraph is unusable.
- `warnings`: usually `[]`. When content cannot be represented in the current schema, store objects with this exact shape:

```json
{ "code": "table", "message": "Skipped pricing table after paragraph p-4." }
```

Allowed warning codes only:
- `code-fence`
- `table`
- `thematic-break`

Legacy repo note:
- Some older articles may still contain `table-skipped`.
- Treat `table-skipped` as legacy input equivalent to `table`.
- When repairing an existing article, normalize `table-skipped` to `table`.
- When writing new or updated content, never emit `table-skipped`.

Do not write warning strings, custom codes, extra fields, or new warning codes.

## Block rules

The repo supports only these block types:
- `heading`
- `paragraph`
- `image`
- `standalone`

### Paragraph

Use for normal prose.

```json
{ "type": "paragraph", "id": "p-1", "english": "...", "chinese": "..." }
```

Rules:
- Paragraph IDs start at `p-1` and increment with no gaps.
- Every paragraph must include both `english` and `chinese`.
- Preserve source paragraph order.
- Do not split one source paragraph into multiple translated paragraphs.
- Do not merge multiple source paragraphs into one.
- Preserve product names, API names, code identifiers, and proper nouns.

### Heading

Default to the paired heading format for translated articles.

```json
{ "type": "heading", "level": 2, "english": "...", "chinese": "..." }
```

Rules:
- `level` must be `2`, `3`, `4`, `5`, or `6`.
- Prefer paired headings whenever the source heading has normal translatable text.
- Do not use the deprecated two-block heading pattern with separate `language` entries.
- Use standalone heading only when the content is genuinely not an English/Chinese pair, such as an appendix label or mixed-language token that should stay single-form.

Standalone heading shape:

```json
{ "type": "heading", "level": 2, "text": "Appendix", "language": "en" }
```

### Image

```json
{ "type": "image", "src": "images/20260610/diagram.png", "alt": "Architecture diagram" }
```

Rules:
- Download only meaningful content images.
- Use only images that appear inside the main article body.
- Do not use hero images, header artwork, metadata thumbnails, related-post images, testimonial logos, or footer graphics.
- Never hotlink external images.
- Skip avatars, decorative icons, social badges, share buttons, and tracking pixels.
- Place the image block where the image appears in the article flow, typically after the preceding paragraph and before the next subheading.
- `alt` should be concise simplified Chinese.

### Standalone

Use sparingly for content that does not fit paragraph or paired heading structure.

```json
{ "type": "standalone", "text": "...", "language": "en" }
```

Valid `language` values:
- `en`
- `zh`
- `mixed`

## Normalization rules

- Convert source lists into normal paragraph blocks unless there is a strong reason to keep a single non-paragraph fragment as `standalone`.
- If the source contains tables, code fences, or thematic breaks that cannot be represented faithfully, preserve surrounding prose and add a `warnings` entry with the correct code.
- If you touch an article that still uses legacy warning code `table-skipped`, normalize it to `table` as part of the same content edit.
- Keep body order stable.
- Use valid UTF-8 for every file. If Chinese text displays as mojibake, regenerate the file instead of committing it.

## index.json

Each article needs one index entry:

```json
{ "id": "20260610", "title": "...", "category": "...", "product": "...", "preview": "..." }
```

Rules:
- Keep exactly one entry per article `id`.
- Keep the array sorted by `id` descending.
- Keep `title`, `category`, `product`, and `preview` aligned with the article JSON.

## Pull request shape

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
- Added or updated: `src/content/articles/<id>.json`
- Updated: `src/content/index.json`
- Images: `public/images/<id>/` or none

## Checks
- [ ] Article JSON is valid UTF-8 and parses.
- [ ] `id` matches `/^\d{8}(-\d{2})?$/` and is unique.
- [ ] Paragraph IDs are sequential with no gaps.
- [ ] Every paragraph has both `english` and `chinese`.
- [ ] `product` and `sourceUrl` are present.
- [ ] `warnings` uses only `{ code, message }` objects with allowed codes, and any touched legacy `table-skipped` value was normalized to `table`.
- [ ] `index.json` includes the matching entry and stays sorted newest first.
- [ ] No Reader application code was changed.
- [ ] No secrets, cookies, tokens, or credentials were committed.
```

## Verify before opening the PR

- Re-read `src/lib/content/types.ts` if any schema decision feels ambiguous.
- Parse the edited JSON files successfully.
- Re-check `src/content/index.json` for `id` collisions before final write.
- Confirm paragraph IDs are `p-1`, `p-2`, `p-3`, ... with no gaps.
- Confirm translated headings use paired `english` and `chinese` fields unless standalone heading is genuinely required.
- Confirm `warnings` is either `[]` or an array of valid `{ code, message }` objects.
- Confirm any touched legacy `table-skipped` warning was normalized to `table`.
- Confirm `product` is one of the allowed repo values.
- Confirm images exist on disk under `public/images/<id>/` and match the article JSON paths.
- Confirm `index.json` remains sorted by `id` descending.
- Confirm no files outside the repository boundary changed.
