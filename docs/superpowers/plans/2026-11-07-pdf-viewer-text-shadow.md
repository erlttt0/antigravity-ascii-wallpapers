# PDF & Document Viewer Text Shadow and Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip inherited text shadows, enforce document color protection, and apply stacking isolation to PDF viewers, text files, and code editors in `ascii-wallpapers.js`.

**Architecture:** Update `appearance(t, off)` in `ascii-wallpapers.js` to inject defense-in-depth CSS reset rules for document and viewer containers in both wallpaper-only and full recolor modes. Add unit test assertions in `tests/manage-wallpapers.test.cjs` to verify that generated stylesheets contain the required viewer reset rules.

**Tech Stack:** JavaScript (ES2022 / CommonJS), CSS3.

**Spec:** `docs/superpowers/specs/2026-11-07-pdf-viewer-text-shadow-design.md`

## Global Constraints

- Zero external dependencies: rely strictly on Node.js core modules.
- Preserve backward compatibility for all 23 themes across Windows, macOS, and Linux.
- Must apply to both wallpaper-only mode (`prefs.recolor === false`) and full recolor mode (`prefs.recolor === true`).
- Ensure no syntax errors or breaking changes in `dist/preload.js` repacking.

## Review Focus

- The reset rule must cover PDF text layers (`.textLayer`, `.pdfViewer`, `[class*="pdf" i]`, `[class*="pdf" i] *`).
- The reset rule must cover code and artifact preview containers (`.monaco-editor`, `[class*="artifact" i]`, `pre`, `code`).
- Stacking context (`isolation: isolate`) and text color (`color: initial`) must be applied to document viewer roots without clobbering chat message styles.
- Conversational chat text must retain the three-layer glow for contrast over moving ASCII characters.

---

### Task 1: Add Unit Tests for Document Viewer CSS Resets

**Files:**
- Modify: `tests/manage-wallpapers.test.cjs`

**Interfaces:**
- Consumes: `ascii-wallpapers.js` source code
- Produces: Test assertions verifying that both mode stylesheets include document viewer rules

- [ ] **Step 1: Write the failing test**

In `tests/manage-wallpapers.test.cjs`, add a test suite that reads `ascii-wallpapers.js` and asserts that the generated style declarations contain:
1. `text-shadow: none !important` applied to PDF and document viewer selectors (`[class*="pdf" i]`, `.textLayer`, `.pdfViewer`, `.monaco-editor`, `iframe`, `embed`).
2. `isolation: isolate` and `color: initial` applied to document viewer root containers.
3. Both rules are present in both wallpaper-only (`!full`) and full recolor (`else`) CSS strings.

```javascript
// Test 6: Document viewer CSS resets for PDF and text previewers
const asciiSource = fs.readFileSync(path.resolve(__dirname, '../ascii-wallpapers.js'), 'utf8');

assert(
  asciiSource.includes('.pdfViewer') &&
  asciiSource.includes('.textLayer') &&
  asciiSource.includes('[class*="pdf" i]') &&
  asciiSource.includes('.monaco-editor'),
  'ascii-wallpapers.js must declare PDF and Monaco viewer reset selectors'
);

assert(
  asciiSource.includes('text-shadow: none !important') || asciiSource.includes('text-shadow:none!important'),
  'ascii-wallpapers.js must reset text-shadow on viewers'
);

assert(
  asciiSource.includes('isolation: isolate') || asciiSource.includes('isolation:isolate'),
  'ascii-wallpapers.js must isolate viewer stacking context'
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: FAIL with "ascii-wallpapers.js must declare PDF and Monaco viewer reset selectors"

- [ ] **Step 3: Commit initial test**

```bash
git add tests/manage-wallpapers.test.cjs
git commit -m "test: add assertions for document and PDF viewer CSS resets"
```

---

### Task 2: Implement Viewer CSS Reset in `ascii-wallpapers.js`

**Files:**
- Modify: `ascii-wallpapers.js`
- Modify: `tests/manage-wallpapers.test.cjs`

**Interfaces:**
- Consumes: Spec requirements for CSS selectors and properties
- Produces: Updated `appearance(t, off)` function in `ascii-wallpapers.js`

- [ ] **Step 1: Implement CSS rules in `ascii-wallpapers.js`**

Define the shared viewer reset rules:
```javascript
const viewerReset = `
  body[data-aw-theme] .surface-composer,body[data-aw-theme] iframe,body[data-aw-theme] embed,body[data-aw-theme] object,body[data-aw-theme] .pdfViewer,body[data-aw-theme] .textLayer,body[data-aw-theme] [class*="pdf" i],body[data-aw-theme] [class*="pdf" i] *,body[data-aw-theme] .monaco-editor,body[data-aw-theme] .monaco-editor *,body[data-aw-theme] [class*="artifact" i],body[data-aw-theme] [class*="artifact" i] *,body[data-aw-theme] .markdown-body,body[data-aw-theme] .prose{text-shadow:none!important}
  body[data-aw-theme] iframe,body[data-aw-theme] embed,body[data-aw-theme] object,body[data-aw-theme] .pdfViewer,body[data-aw-theme] [class*="pdf" i],body[data-aw-theme] [class*="artifact" i]{isolation:isolate;color:initial}
`;
```
Inject `viewerReset` into both the `!full` (wallpaper-only) and `full` (recolor) stylesheet templates inside `appearance(t, off)`.

- [ ] **Step 2: Run tests to verify it passes**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: PASS with all test suites passing.

- [ ] **Step 3: Verify ASAR recompilation check**

Run: `node manage-wallpapers.cjs status` (ensures `inspect()` and `compiles()` in installer still validate patched preload without errors).
Expected: Status reports ready or expected message without compilation errors.

- [ ] **Step 4: Commit**

```bash
git add ascii-wallpapers.js tests/manage-wallpapers.test.cjs
git commit -m "fix(theme): isolate PDF and document viewers from inherited text shadows and tints"
```

---

### Task 3: End-to-End Verification

**Files:**
- Test: All files in repository

- [ ] **Step 1: Run full unit test suite**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: All suites exit 0 cleanly.

- [ ] **Step 2: Verify git diff and working tree cleanliness**

Run: `rtk git status` and `rtk git diff`
Expected: Clean working tree, exact changes.
