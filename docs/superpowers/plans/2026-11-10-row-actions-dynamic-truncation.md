# Row Actions Dynamic Truncation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Option 1 (dynamic text truncation on row hover/active and clean floating action icons without background gradients or smudges).

**Architecture:** Inject CSS rules in `appearance()` of `ascii-wallpapers.js` to dynamically add `padding-right: 76px !important` to the title container on hover/active, remove all gradients and backdrop-filters from `.agy-row-actions`, and style individual action buttons with subtle round hover highlights.

**Tech Stack:** Vanilla JavaScript / Browser CSS.

**Spec:** Approved short design from brainstorming turn.

## Global Constraints
- Zero new external dependencies.
- Rules must apply to both `!full` (wallpaper-only) and `full` (recolor) stylesheet branches in `appearance()`.
- Installer test suite must pass with `node tests/manage-wallpapers.test.cjs`.
- Archive verification must pass with `node manage-wallpapers.cjs verify`.

## Review Focus
- No text collision under the action buttons when titles are long.
- No visual rectangular gradient artifacts on either active or inactive hovered rows.

## Tasks

### Task 1: Add Unit Test for Dynamic Truncation
- [ ] Add Test 9 to [`tests/manage-wallpapers.test.cjs`](file:///d:/vsc%20projects/Antigravity%20ascii%20theme%20fork/tests/manage-wallpapers.test.cjs) verifying `padding-right: 76px` truncation and clean `.agy-row-actions` rules in `appearance()`.
- [ ] Run `node tests/manage-wallpapers.test.cjs` and verify test fails.

### Task 2: Implement Dynamic Truncation in `ascii-wallpapers.js`
- [ ] Update `appearance()` in [`ascii-wallpapers.js`](file:///d:/vsc%20projects/Antigravity%20ascii%20theme%20fork/ascii-wallpapers.js) for both `!full` and `full` branches:
  - Add `padding-right: 76px !important` to `.agy-sidebar-row:hover > div:nth-child(2)`, `.agy-sidebar-row.bg-sidebar-secondary > div:nth-child(2)`, and `[data-active="true"] > div:nth-child(2)`.
  - Set `.agy-row-actions` to `background: transparent !important`, `backdrop-filter: none !important`, `right: 6px !important`, `gap: 2px !important`.
  - Add button hover highlights (`background: rgba(255, 255, 255, 0.16) !important`).
- [ ] Run `node tests/manage-wallpapers.test.cjs` and verify all tests pass.
- [ ] Run `node manage-wallpapers.cjs verify` to verify archive integrity.
- [ ] Commit changes to `spike/frosted-glass-sidebar`.
