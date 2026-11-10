# Inset Card Transparency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore full-window animated ASCII wallpaper visibility in Antigravity 2.30.0+ by making `.agy-sheet[data-sheet-inset] [data-main-content-body]` and `.agy-inset-shell [data-side-panel-body]` transparent.

**Architecture:** Inject CSS transparency rules scoped under `body[data-aw-theme]` into `ascii-wallpapers.js` for both recolored (`full`) and non-recolored (`!full`) modes, while keeping the card outline border intact.

**Tech Stack:** Vanilla JavaScript (ES2022 / CommonJS), CSS.

**Spec:** [`docs/superpowers/specs/2026-11-10-inset-card-transparency-design.md`](file:///d:/vsc%20projects/Antigravity%20ascii%20theme%20fork/docs/superpowers/specs/2026-11-10-inset-card-transparency-design.md)

## Global Constraints

- Zero third-party dependencies (Node.js standard library only).
- Pure CSS rule additions scoped under `body[data-aw-theme]`.
- No breakage of earlier Antigravity versions (2.28.2 / 2.29.0).
- Must compile and verify cleanly via `node manage-wallpapers.cjs verify`.

## Review Focus

- The inset container selector must match both main content body and side panel body containers.
- The rule must use `!important` so it overrides Antigravity's compiled tailwind `background-color: var(--background)`.
- The rule must apply in both `prefs.recolor === true` and `prefs.recolor === false` appearance paths.
- The card border shadow (`[data-main-content-body]::after`) must remain intact so the rounded card outline is preserved.
- The script in `ascii-wallpapers.js` must compile without syntax errors.

---

### Task 1: Add Unit Test for Inset Transparency in Test Suite

**Files:**
- Modify: `tests/manage-wallpapers.test.cjs`

**Interfaces:**
- Consumes: `ascii-wallpapers.js` content
- Produces: Test assertion verifying `ascii-wallpapers.js` contains the inset transparency selector

- [ ] **Step 1: Write the failing test in `tests/manage-wallpapers.test.cjs`**

Add Test 7 to `tests/manage-wallpapers.test.cjs`:
```javascript
// Test 7: Verify Antigravity 2.30.0+ inset container transparency rules in ascii-wallpapers.js
const wallpaperScript = fs.readFileSync(path.join(rootDir, 'ascii-wallpapers.js'), 'utf8');
const insetSelector = '.agy-sheet[data-sheet-inset] [data-main-content-body]';
assert(
  wallpaperScript.includes(insetSelector),
  'ascii-wallpapers.js must include transparency rules for .agy-sheet[data-sheet-inset] [data-main-content-body]'
);
assert(
  wallpaperScript.includes('.agy-inset-shell [data-side-panel-body]'),
  'ascii-wallpapers.js must include transparency rules for .agy-inset-shell [data-side-panel-body]'
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: FAIL with assertion error mentioning `ascii-wallpapers.js must include transparency rules`.

- [ ] **Step 3: Commit test change**

```bash
git add tests/manage-wallpapers.test.cjs
git commit -m "test: add assertion for 2.30.0+ inset container transparency"
```

---

### Task 2: Inject Inset Transparency Rules into `ascii-wallpapers.js`

**Files:**
- Modify: `ascii-wallpapers.js:214-245`

**Interfaces:**
- Consumes: Design specification for transparency selector
- Produces: Updated CSS in both `!full` and `full` branches of `appearance(t, off)`

- [ ] **Step 1: Add CSS rules to `ascii-wallpapers.js`**

In `appearance(t, off)`:
1. In `!full` branch (non-recolored mode), add:
```css
body[data-aw-theme] .agy-sheet[data-sheet-inset] [data-main-content-body],body[data-aw-theme] .agy-inset-shell [data-side-panel-body]{background-color:transparent!important}
```
2. In `full` branch (recolored mode), add the same rule to `style.textContent`.

- [ ] **Step 2: Run unit test to verify it passes**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: PASS with exit code 0.

- [ ] **Step 3: Run verify to ensure script compiles and repacks cleanly**

Run: `node manage-wallpapers.cjs verify`
Expected: PASS with "archive rebuild verified, with all packed file integrity hashes intact."

- [ ] **Step 4: Commit implementation change**

```bash
git add ascii-wallpapers.js
git commit -m "fix: make Antigravity 2.30.0+ inset card containers transparent"
```

---

### Task 3: Verify and Test End-to-End

**Files:**
- Test: `tests/manage-wallpapers.test.cjs`
- Helper: `install.bat`

**Interfaces:**
- Consumes: Patched `ascii-wallpapers.js` and `manage-wallpapers.cjs`
- Produces: Complete verification proof

- [ ] **Step 1: Run full test suite**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: Output `Tests passed.` with exit code 0.

- [ ] **Step 2: Run archive verification**

Run: `node manage-wallpapers.cjs verify`
Expected: Clean exit with all hashes intact.

- [ ] **Step 3: Check git status to ensure tree is clean**

Run: `rtk git status`
Expected: Clean working tree on branch.
