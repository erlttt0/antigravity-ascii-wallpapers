# Design: Inset Card Transparency for Antigravity 2.30.0+

## 1. Intent & Context

Antigravity 2.30.0 introduced an inset card layout in its frontend architecture. Under this layout, the main workspace content is wrapped in `.agy-sheet[data-sheet-inset] [data-main-content-body]` (and side panels in `.agy-inset-shell [data-side-panel-body]`).

By default, Antigravity applies an opaque background to these inset containers (`background-color: var(--background)`), along with `border-radius: var(--card-radius)` and margins. Because `ascii-wallpapers.js` mounts the wallpaper `<canvas>` to `.agy-sheet` with `z-index: -1`, the opaque card body renders directly on top of the canvas, hiding the animated ASCII art across almost the entire application window (except for the top ~40px header margin).

The intent of this change is to restore the signature full-window animated ASCII wallpaper experience in Antigravity 2.30.0+ by making these inset containers transparent.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- Restore full visibility of the ASCII animated background behind the home screen ("Hello, <User>") and conversation views in Antigravity 2.30.0+.
- Keep the mod zero-dependency and minimal in diff size.
- Ensure transparency works across both light and dark themes, and whether `recolor` (Theme app) is toggled on or off.
- Maintain existing text readability, composer styling, and viewer resets (e.g. PDF/Monaco).

### Non-Goals
- Changing the position or geometry of Antigravity's inset card margins or rounded borders.
- Modifying Antigravity's internal DOM structure or React components.
- Changing wallpaper scenes or ASCII drawing logic.

### Anti-Goals
- Blurring or dimming the wallpaper with heavy CSS `backdrop-filter` effects that degrade rendering performance or distort raw ASCII characters.
- Breaking backwards compatibility with Antigravity 2.28 or 2.29 builds that do not have `[data-sheet-inset]`.

---

## 3. Constraints

- **Zero dependencies:** Standard vanilla CommonJS and CSS rules only.
- **Backwards compatibility:** CSS rules must not break earlier Antigravity versions (e.g., 2.28.2, 2.29.0).
- **Style Isolation:** Rules must be scoped under `body[data-aw-theme]` to ensure no side effects when the wallpaper theme is turned "Off".

---

## 4. Approaches Considered

### Approach 1: Full Transparency for Inset Card Containers (Chosen)
Inject CSS rules targeting `.agy-sheet[data-sheet-inset] [data-main-content-body]` and `.agy-inset-shell [data-side-panel-body]` with `background-color: transparent !important;` in both recolored (`full`) and non-recolored (`!full`) modes of `ascii-wallpapers.js`.
- **Trade-offs:** Minimal diff (1-2 CSS selectors added), authentic full-window ASCII aesthetic, no GPU performance penalty, fully backwards-compatible (ignored on older Antigravity versions without `data-sheet-inset`).
- **Decision:** Chosen by the user.

### Approach 2: Semi-Transparent Frosted Glass Card (Rejected)
Apply a semi-transparent tinted background (`color-mix(in srgb, var(--background) 70%, transparent)`) with `backdrop-filter: blur(...)`.
- **Trade-offs:** Softens ASCII glyphs behind a translucent sheet, adding compositor overhead and departing from the raw text aesthetic.

### Approach 3: Reparent Canvas Inside the Card (Rejected)
Move canvas injection into `[data-main-content-body]`.
- **Trade-offs:** Fragmented visual appearance, complex DOM mutation tracking across split panes, and loss of scene continuity across the window.

---

## 5. Detailed Design

### CSS Injections in `ascii-wallpapers.js`

In `appearance(t, off)`:

1. **Non-recolored mode (`!full`):**
   Add to `style.textContent`:
   ```css
   body[data-aw-theme] .agy-sheet[data-sheet-inset] [data-main-content-body],
   body[data-aw-theme] .agy-inset-shell [data-side-panel-body]{background-color:transparent!important}
   ```

2. **Recolored mode (`full`):**
   Add to `style.textContent`:
   ```css
   body[data-aw-theme] .agy-sheet[data-sheet-inset] [data-main-content-body],
   body[data-aw-theme] .agy-inset-shell [data-side-panel-body]{background-color:transparent!important}
   ```

3. **Card Border Outline:**
   Antigravity's `[data-main-content-body]::after` provides a subtle inset outline (`box-shadow: inset 0 0 0 0.5px var(--card-edge)`). This border remains untouched, preserving the clean modern silhouette of the card while letting the wallpaper show through completely.

---

## 6. Verification Plan

1. **Automated Unit Tests:**
   - Run `node tests/manage-wallpapers.test.cjs` to confirm installer tests still pass cleanly.
   - Add unit assertion verifying that `ascii-wallpapers.js` includes the inset transparency CSS selector.
2. **Archive Rebuild Verification:**
   - Run `node manage-wallpapers.cjs verify` to verify script compilation and checksum consistency.
3. **Manual Verification via `install.bat`:**
   - Run `install.bat` to patch the local Antigravity installation.
   - Confirm in Antigravity that ASCII art fills the entire window behind "Hello, Oocs." and within active conversations across multiple themes.
