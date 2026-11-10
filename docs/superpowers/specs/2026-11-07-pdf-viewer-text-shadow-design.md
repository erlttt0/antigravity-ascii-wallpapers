# PDF & Document Viewer Text Shadow and Isolation Design

## Intent and Why
When ASCII Wallpapers are enabled, the theme engine injects a 3-layer `text-shadow` onto `.agy-sheet` to create contrast over moving ASCII glyphs for conversation text. Because `text-shadow` and `color` inherit by default in CSS, nested document viewers—specifically PDF viewers, file previewers, Monaco editors, artifact sidecars, and iframes—inherit this glow. On light pages (such as standard PDF sheets), this renders as a blurry dark halo around the words and can tint text color, making documents unreadable.

## Goals
- Strip `text-shadow` completely (`text-shadow: none !important`) across all PDF viewers, text layers, code editors, markdown document previews, artifact panes, and embed iframes.
- Apply `isolation: isolate` and `color: initial` to document/PDF root viewports so embedded documents do not inherit theme foreground color (`${t.fg}`) or canvas backdrop filters.
- Ensure the fix applies consistently across all 23 themes in both full theme mode (`prefs.recolor === true`) and wallpaper-only mode (`prefs.recolor === false`).
- Preserve the existing contrast glow on conversational chat text.

## Non-Goals
- Altering the ASCII canvas animation or theme palette definitions.
- Restructuring Antigravity's internal sheet layout or composer placement.

## Constraints
- Zero runtime dependencies: vanilla JavaScript/CSS in `ascii-wallpapers.js`.
- High specificity / defense-in-depth selectors to prevent regressions across current and future Electron/Antigravity view updates.

## Technical Details

### 1. Targeted Selectors
In `ascii-wallpapers.js` (`appearance(t, off)`), both the wallpaper-only branch and the full recolor branch will include:

```css
/* Document & PDF viewer text-shadow reset */
body[data-aw-theme] .surface-composer,
body[data-aw-theme] iframe,
body[data-aw-theme] embed,
body[data-aw-theme] object,
body[data-aw-theme] .pdfViewer,
body[data-aw-theme] .textLayer,
body[data-aw-theme] [class*="pdf" i],
body[data-aw-theme] [class*="pdf" i] *,
body[data-aw-theme] .monaco-editor,
body[data-aw-theme] .monaco-editor *,
body[data-aw-theme] [class*="artifact" i],
body[data-aw-theme] [class*="artifact" i] *,
body[data-aw-theme] .markdown-body,
body[data-aw-theme] .prose {
  text-shadow: none !important;
}

/* Document & PDF container color protection and stacking isolation */
body[data-aw-theme] iframe,
body[data-aw-theme] embed,
body[data-aw-theme] object,
body[data-aw-theme] .pdfViewer,
body[data-aw-theme] [class*="pdf" i],
body[data-aw-theme] [class*="artifact" i] {
  isolation: isolate;
  color: initial;
}
```

### 2. Testing & Verification
- Unit test suite: Add tests in `tests/manage-wallpapers.test.cjs` (or a dedicated CSS rule test) verifying that `ascii-wallpapers.js` generates the document viewer resets in both wallpaper-only and full recolor stylesheets.
- Verification that all installer checks and existing test suites pass.
