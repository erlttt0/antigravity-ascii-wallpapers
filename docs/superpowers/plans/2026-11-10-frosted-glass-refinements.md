# Frosted Glass & Surface Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate dark visual artifacts (chatbox black ring, opaque action buttons gradient block, opaque active sidebar block) and provide readable frosted glass dropdown menus across Antigravity 2.30.0+.

**Architecture:** Extend stylesheet generation in `appearance()` inside `ascii-wallpapers.js` to override `.surface-composer`, top menu popovers (`.surface-opaque`, `[role="menu"]`), active sidebar rows, and `.agy-row-actions::before`. Add regression assertions to `tests/manage-wallpapers.test.cjs`.

**Tech Stack:** Vanilla JavaScript (Node CJS / Browser DOM CSS).

**Spec:** [`docs/superpowers/specs/2026-11-10-frosted-glass-refinements-design.md`](file:///d:/vsc%20projects/Antigravity%20ascii%20theme%20fork/docs/superpowers/specs/2026-11-10-frosted-glass-refinements-design.md)

## Global Constraints
- Pure vanilla CSS/JS with zero new dependencies.
- Rules must apply to both the `!full` (wallpaper-only) and `full` (recolor) stylesheet branches in `appearance()`.
- Existing installer test suite must pass with `node tests/manage-wallpapers.test.cjs`.
- Archive verification must pass with `node manage-wallpapers.cjs verify`.

## Review Focus
- High specificity to override Tailwind utility classes and Antigravity's internal `data-newux-theme` selectors.
- Proper dynamic color interpolation using `${t.border}`, `${t.accent}`, `${t.panel}`, and `${t.chrome}`.
- Preservation of chatbox input text readability and focus outline.

## Tasks

### Task 1: Add Unit Tests for Surface Refinements
- [ ] Add Test 8 to [`tests/manage-wallpapers.test.cjs`](file:///d:/vsc%20projects/Antigravity%20ascii%20theme%20fork/tests/manage-wallpapers.test.cjs) verifying required selectors in `appearance()`.
- [ ] Run `node tests/manage-wallpapers.test.cjs` and verify test fails before implementation.

### Task 2: Implement CSS Overrides in `ascii-wallpapers.js`
- [ ] Update `appearance()` in [`ascii-wallpapers.js`](file:///d:/vsc%20projects/Antigravity%20ascii%20theme%20fork/ascii-wallpapers.js) for both `!full` and `full` branches:
  - Add glass border, shadow, and blur to `.surface-composer` and `.surface-composer-card`.
  - Add acrylic blur and background to `.surface-opaque`, `.border-menu-border`, `[role="menu"]`, `[data-radix-menu-content]`.
  - Add frosted glass chip styles to `.agy-sidebar-row.bg-sidebar-secondary` and `[data-active="true"]`.
  - Add `display: none !important; background: transparent !important;` to `.agy-row-actions::before` and theme-tinted glass gradient to `.agy-row-actions`.
- [ ] Run `node tests/manage-wallpapers.test.cjs` and verify all tests pass.
- [ ] Run `node manage-wallpapers.cjs verify` and verify clean archive rebuild.
- [ ] Commit changes to `spike/frosted-glass-sidebar`.
