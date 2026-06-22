# Mobile Reader Design

## Goal

Build a mobile-first web reader for the translated Claude blog articles stored in `E:\cwh\obsidiandata\work\Claude-Blog-Translations\2026`.

The reading experience should:

- show English content by default
- reveal the matching Chinese translation when the user taps an English paragraph
- optimize for phone reading rather than desktop-first layout
- support both day mode and night mode

The first version is intentionally narrow. It does not include accounts, cloud sync, online translation, complex search, or annotation tools.

## Product Scope

### In Scope

- import local Markdown articles from the source folder
- transform Markdown into structured article data with reliable English-Chinese paragraph pairing
- render a mobile-first article list
- render an article reading view with English-first paragraph display
- open a bottom drawer with the matched Chinese translation on paragraph tap
- provide global day mode and night mode
- provide desktop compatibility without optimizing around desktop-first navigation patterns

### Out Of Scope

- accounts or login
- cloud sync
- online translation services
- complex search or semantic retrieval
- highlights, notes, or annotation workflows
- editing article content in the app

## Source Content Assumptions

The current article corpus is a set of local Markdown files. The sample article structure indicates:

- front matter is not guaranteed
- metadata is stored near the top of the file as Markdown headings and blockquotes
- body content generally alternates between English paragraphs and their Chinese translations
- headings can appear in both English and Chinese
- images are referenced with relative paths under the article collection

The importer should treat the source corpus as the system of record and generate app-ready structured data during a preprocessing step.

## User Experience

### Article List

The list page is the entry point on mobile.

It should show:

- article title
- publication date if present
- category if present
- optional short preview extracted from the first English paragraph

The layout should be a single-column card stack with comfortable touch targets and clear separation between entries.

### Article Reading

The reading page should prioritize uninterrupted English reading.

It should show:

- article title and lightweight metadata header
- optional reading progress affordance if cheap to implement
- English headings and paragraphs as the primary content
- inline images when present and resolvable

Chinese content should remain hidden from the main reading flow until requested.

### Paragraph Translation Interaction

When the user taps an English paragraph:

- the tapped paragraph becomes the active paragraph
- the paragraph receives a clear but restrained highlight state
- a bottom drawer opens and displays the paired Chinese translation
- tapping another English paragraph updates the drawer content without losing scroll position

When the user dismisses the drawer:

- the reading position remains unchanged
- the active paragraph may remain lightly indicated until another interaction, or reset if that proves visually cleaner during implementation

### Day And Night Mode

The app should provide a global theme toggle with a default that can safely start with system preference detection.

Day mode:

- warm light background
- dark ink-like text
- restrained accent color for selection states

Night mode:

- dark but not pure black background
- low-glare text contrast
- drawer, cards, and active states differentiated through layered tones rather than bright borders

The theme choice should persist locally on device.

## Information Architecture

Version one has two core routes:

1. article list
2. article reader

Recommended simple route structure:

- `/` for the article list
- `/article/:slug` for a reading page

This is enough for the first version and keeps the implementation focused.

## Data Model

The app should not render raw Markdown directly at runtime as its primary source of truth.

Instead, preprocessing should generate structured article records.

Recommended shape:

```ts
type Article = {
  slug: string;
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  preview?: string;
  heroImage?: string;
  blocks: ArticleBlock[];
};

type ArticleBlock =
  | {
      type: "heading";
      level: 2 | 3 | 4;
      english: string;
      chinese?: string;
    }
  | {
      type: "paragraph";
      id: string;
      english: string;
      chinese: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "quote";
      english: string;
      chinese?: string;
    };
```

Key rule:

- paragraph blocks used for tap-to-translate must have deterministic English-Chinese pairing before they reach the UI

## Import Strategy

The importer is responsible for converting each Markdown file into structured JSON data used by the frontend.

Recommended responsibilities:

1. enumerate Markdown files from the source directory
2. parse top-of-file metadata
3. split content into Markdown blocks
4. detect English-Chinese paragraph pairs
5. detect English-Chinese heading pairs where possible
6. preserve images and relative references
7. emit a normalized article index plus per-article content payloads

This preprocessing step keeps the reader UI simple and predictable.

## Parsing Rules

The first version should optimize for the actual source corpus rather than generic Markdown perfection.

Recommended initial heuristics:

- treat consecutive English and Chinese plain-text paragraphs as a pair
- treat English heading followed immediately by Chinese heading as one heading block with bilingual metadata
- ignore standalone Chinese lines that cannot be paired confidently and record them as parser warnings
- preserve images in reading flow
- preserve blockquotes in metadata or body depending on position

If a file cannot be paired cleanly, the importer should fail loudly enough for inspection rather than silently generating incorrect paragraph matches.

## UI Components

Recommended component boundaries:

- `AppShell`
- `ThemeToggle`
- `ArticleListPage`
- `ArticleCard`
- `ArticleReaderPage`
- `ArticleHeader`
- `ArticleContent`
- `ParagraphBlock`
- `TranslationDrawer`

This keeps responsibilities narrow:

- content blocks render content
- paragraph blocks own tap state handoff
- the drawer owns translation display and mobile interaction behavior

## State Model

The minimum useful client state is small:

- article index data
- current article data
- active paragraph id
- drawer open or closed state
- theme mode

State should remain local to the client application. There is no server-side session requirement for version one.

## Mobile Design Constraints

This product should feel native to phone reading.

Implementation priorities:

- one-handed usable bottom drawer
- safe-area-aware bottom spacing
- large paragraph tap targets
- readable font sizes without pinch zoom
- limited header chrome so the content stays dominant
- stable scrolling with no layout jumps when translation opens

Desktop support should adapt gracefully by widening the reading column and drawer presentation, but mobile remains the source design target.

## Error Handling

Version one needs simple, explicit handling:

- if article import fails, expose the file name and parser reason in build output
- if an image path cannot be resolved, render the article without blocking the rest of the content
- if a paragraph lacks a Chinese match, do not make it tappable
- if an article file is malformed, skip shipping bad pairings silently

## Accessibility

The design should include basic accessibility support from the start:

- sufficient contrast in both themes
- visible focus styles for keyboard users
- semantic headings
- buttons for theme toggle and drawer close with accessible labels
- paragraphs that are tappable should communicate interactivity through role and visual state

## Testing Strategy

The implementation plan should include tests at two levels.

Parser tests:

- imports article metadata correctly
- pairs simple English-Chinese paragraphs correctly
- handles heading pairs correctly
- preserves image blocks
- marks unpaired content safely

UI tests:

- article list renders imported content
- tapping a paragraph opens the translation drawer
- tapping a different paragraph replaces the drawer content
- theme toggle switches between day and night mode
- mobile drawer remains dismissible

## Technical Recommendation

For the first version, preprocess Markdown into structured JSON and build a static client app on top of that data.

Why this is the recommended approach:

- it fits the actual source format
- it makes paragraph pairing explicit and testable
- it keeps runtime UI logic small
- it creates a clean path to later features like simple search or reading history without changing the content model

## Acceptance Criteria

The first version is successful when all of the following are true:

- the app loads the local article set into a browsable list
- a user can open an article on a phone-sized viewport and read the English content comfortably
- tapping a paragraph opens a bottom drawer with the matching Chinese translation
- the drawer updates correctly when another paragraph is tapped
- day mode and night mode both work and persist locally
- malformed article content is surfaced during import rather than silently mispaired

## Implementation Notes

The implementation should begin with the importer and its tests, because paragraph pairing is the highest-risk behavior in the product.

After the importer is stable, the frontend can be built against the generated structured data with confidence that the reader interaction is operating on valid paragraph matches.
