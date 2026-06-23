# Reader UI Debugging Notes

Date: 2026-06-23

## Scope

This note summarizes the debugging and UI iteration work completed for the mobile-first bilingual reader during the current conversation.

## Goals

- Make the library page feel closer to a Kindle-style e-reader directory.
- Keep English as the default reading language and show Chinese translation only on paragraph selection.
- Improve mobile usability for library browsing and article reading.
- Add reading controls, night mode, and a less app-like, more e-ink-like visual direction.

## Issues Reported

### Library page

- The library layout was too generic and did not resemble the intended mobile blog / e-reader list.
- The dark mode button should not appear on the library screen.
- Search, sorting, and category filtering were missing.
- The top explanatory block on the library page was visually too large and later needed to be removed.
- The filter controls needed to collapse behind a button instead of staying fully expanded.
- The library and reader pages drifted apart in page color and type scale.

### Article page

- The bottom translation area should be a hidden drawer, not a persistent region.
- The reader needed text-size, spacing, and night-mode controls.
- The reading toolbar should feel closer to Kindle and be mobile-first.
- The settings panel was covering the theme toggle.
- The top bar needed to span the full reading width.
- Body text looked incorrectly bold.

### Visual direction

- Early versions leaned too far toward warm paper / yellow parchment instead of Kindle-like e-ink.
- The desired direction was clarified as:
  - gray-white paper tone
  - very low saturation
  - very light texture only
  - restrained borders and shadows
  - closer to Kindle hardware / e-paper than to vintage paper

## Implemented Changes

### Library page

- Rebuilt the article list into a more editorial mobile layout.
- Added search across title, preview, category, and publication date.
- Added sort options: newest, oldest, title.
- Added category filtering with derived categories from imported content.
- Removed the library-screen theme toggle.
- Replaced always-visible filter selects with a compact toolbar:
  - left: search input
  - right: filter button
  - expanded panel: sort + category controls
- Preserved publication date on cards.
- Refined cards to show:
  - date
  - title
  - primary category
  - reading mode hint
- Fixed duplicated preview rendering in article cards.

### Article page

- Kept translation hidden by default and opened it only after paragraph selection.
- Added persisted reading preferences:
  - text size
  - paragraph spacing
- Added persisted theme toggle / night mode.
- Moved the settings panel so it expands below the top toolbar instead of covering the theme button.
- Kept the theme button available while settings are open.
- Removed the heavy paragraph appearance by forcing normal font weight for:
  - article content container
  - paragraphs
  - paragraph buttons
- Expanded the top toolbar to align with the full reading surface.

### Visual adjustments

- Iterated the color system toward a calmer Kindle-like surface.
- Reduced warm yellow bias.
- Shifted the paper tone toward gray-white.
- Reduced visible noise and softened texture intensity.
- Unified the article page base color and default type scale with the library page in the final pass.

## Verification

The following checks were run during the iteration and again before the final handoff:

- `npm.cmd test`
- `npm.cmd run build`

Latest verified result at handoff:

- `46` tests passed.
- Production build passed.

## Notes on Remaining Intent

The final user instruction in this conversation was to stop further styling work after aligning:

- article page color with library page color
- article page default type size with library page type size

That alignment was completed and no further visual redesign was applied after that step.
