# Reader Project - Session Context

## Project Overview
A bilingual (English/Chinese) Claude blog article reader built with React. Articles are stored as JSON files in `src/content/articles/` with an index at `src/content/index.json`.

## Data Model (article JSON schema)
- `id`: Format `YYYYMMDD` or `YYYYMMDD-NN` (e.g. `20260618-01`)
- `title`, `preview`, `category`, `product`, `sourceUrl` — top-level metadata
- `blocks[]`: article content blocks (paragraph, heading, image, standalone, list, code)
- `warnings[]`: parsing warnings (informational only)
- **No** `slug` or `publishedAt` fields

### Heading block patterns
- **Pattern A (correct)**: Single block with `english` + `chinese` keys
  ```json
  {"type":"heading", "level":2, "english":"...", "chinese":"..."}
  ```
- ~~Pattern B (deprecated)~~: Two blocks with `language` field — all converted to Pattern A

### Image blocks
- `src`: path relative to `public/`, e.g. `images/20260603/skill-1.png`
- `alt`: Chinese alt text
- Placed after paragraphs, before subheadings

## Current State (as of June 24, 2026)

### Articles: 22 entries in index.json
All in `src/content/articles/*.json`, all valid schema (no slug/publishedAt).

| ID | Title | Product | Category |
|----|-------|---------|----------|
| 20260618-01 | Claude Code now supports artifacts | Claude Code | Product announcements |
| 20260618 | Centrally manage authorization for MCP connectors | Claude Platform | Enterprise AI, Product announcements |
| 20260617-02 | Meet the winners of our Claude Opus 4.8 Build Day hackathon | Claude Code | Claude Code |
| 20260617-01 | Secure access to the Claude Platform with Workload Identity Federation | Claude Platform | Product announcements |
| 20260617 | Claude Design now stays on brand for daily work | Claude Design | Product announcements |
| 20260610 | The evolution of agentic surfaces: building with Claude Managed Agents | Claude Managed Agents | Agents / Claude Platform |
| 20260609 | New in Claude Managed Agents: run agents on a schedule and store environment variables in vaults | Claude Managed Agents | Product announcements |
| 20260608 | Building intelligent apps for Apple platforms with Claude in the Foundation Models framework | API | Product announcements |
| 20260605-01 | How one Anthropic seller rebuilt his team's workflows with Claude Code | Claude Code | Claude Code, Enterprise AI |
| 20260605 | The Claude Cowork product guide | Claude Cowork | Enterprise AI / Claude Cowork |
| 20260603-01 | Running an AI-native Engineering Org | Claude Code | Claude Code |
| 20260603 | Lessons from building Claude Code: How we use skills | Claude Code | Claude Code |
| 20260528 | Introducing Dynamic Workflows in Claude Code | Claude Code | Product announcements |
| 20260527-01 | How CodeRabbit used Claude to build an agent orchestration system | Claude Code | Claude Code |
| 20260527 | Using LLMs to secure source code | Claude Code | Enterprise AI |
| 20260519 | New in Claude Managed Agents: self-hosted sandboxes and MCP tunnels | Claude Managed Agents | Product announcements |
| 20260506 | New in Claude Managed Agents: dreaming, outcomes, and multiagent orchestration | Claude Managed Agents | Product announcements |
| 20260423 | New connectors in Claude for everyday life | Claude | Product announcements |
| 20260414 | Redesigning Claude Code on desktop for parallel agents | Claude Code | Claude Code |
| 20260410 | Preparing your security program for AI-accelerated offense | Claude Enterprise | Agents |
| 20260407 | Scaling Managed Agents: Decoupling the brain from the hands | Claude Managed Agents | Engineering |
| 20260312 | Claude now creates interactive charts, diagrams and visualizations | Claude | Product announcements |

### Valid Product values
`API`, `Claude`, `Claude Code`, `Claude Cowork`, `Claude Design`, `Claude Enterprise`, `Claude Managed Agents`, `Claude Platform`

### Image directories: 22 under `public/images/`
All referenced images exist on disk. Missing images were downloaded from source URLs.

## Work Completed This Session

### 1. Schema cleanup
- Added missing `product` field to all articles
- Added `sourceUrl` to articles that lacked it
- Fixed category strings (Chinese text, asterisks, etc.)
- Standardized all heading blocks to Pattern A (english+chinese in single block)
- Converted `20260618-01` from `language` field pattern to Pattern A

### 2. Legacy article conversion
- Deleted 9 orphaned slug-based JSON files (could not determine publish date)
- Converted 5 legacy slug articles with known dates to ID-based schema:
  - `20260519`, `20260506`, `20260414`, `20260528`, `20260617-02`
  - Renamed image directories accordingly
  - Added to index.json

### 3. Images
- Fetched source HTML for all 22 articles to identify missing images
- Downloaded 40+ missing images from source URLs
- Added image blocks to article JSONs with proper positions
- Deleted stale/unreferenced image files and directories

### 4. Translations
- Translated `20260605-01.json` and `20260608.json` (Chinese fields were empty/English)
- Fixed duplicate heading structures

### 5. UI changes
- Changed `[原文]` → `[Click here]` in `ArticleMetadata.tsx:35`, `ArticleHeader.test.tsx:29`, `ArticlePage.test.tsx:162`

### 6. Product validation
- Verified all 22 article products against source URL metadata
- Fixed: `20260605` (Claude.ai→Claude Cowork), `20260617` (Claude.ai→Claude Design), `20260423` (Claude.ai→Claude), `20260312` (Claude.ai→Claude), `20260410` (General→Claude Enterprise)
- Updated both article JSONs and index.json

### 7. Verification
- `npm run typecheck`: clean
- `npm test`: 32/32 passing across 8 test files

## Known Issues / Potential Work
- `20260312.json` and `20260605.json` have **no heading translation structure** (headings lack english/chinese keys entirely) — may need translation
- Index is sorted descending by ID (most recent first)
- Product field could potentially be multi-valued (some source pages list multiple products) — currently single string only
