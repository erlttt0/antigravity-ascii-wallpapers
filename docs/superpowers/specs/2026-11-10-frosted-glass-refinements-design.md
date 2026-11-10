# Frosted Glass & Surface Refinements Design

## Intent & Context
On Antigravity 2.30.0+, the frosted glass spike (`spike/frosted-glass-sidebar`) exposed four visual artifacts:
1. The `.surface-composer` chatbox inherited a hardcoded 4px jet-black outer ring (`box-shadow: ... rgb(13, 13, 17) 0px 0px 0px 4px`).
2. Top titlebar dropdown menus (`Antigravity`, `Workspace`, `View`, `Window`) inherited `.bg-sidebar` transparency without a frosted acrylic background or blur, causing text collisions with underlying content.
3. Active/selected conversation rows (`.agy-sidebar-row.bg-sidebar-secondary`) defaulted to an opaque black rectangle (`#1f1f24`).
4. Action buttons (`.agy-row-actions`) on conversation rows displayed a harsh black gradient block caused by `[data-newux-theme] .agy-row-actions::before` painting `linear-gradient(var(--row-bg), var(--row-bg)), linear-gradient(var(--sidebar), var(--sidebar)), var(--shell)`.

## Goals
- Remove the 4px black ring from `.surface-composer` and replace with a subtle 1px translucent glass border, soft ambient shadow, and gentle accent glow.
- Provide top titlebar dropdowns and popovers with 24px backdrop blur, 88% panel tint, and a 1px border.
- Style active/selected conversation rows as a frosted glass pill with 16px blur and theme accent border.
- Neutralize `.agy-row-actions::before` and apply a seamless theme-tinted frosted gradient to `.agy-row-actions`.

## Non-Goals
- Altering core wallpaper procedural animation loops or math.
- Modifying palette colors or glyph definitions in `ascii-wallpapers.js`.

## Technical Approaches

### Approach 1: Targeted Theme Stylesheet Overrides in `appearance()` (Selected)
Inject specific CSS rules into both stylesheet branches (`!full` and `full`) in `appearance()` inside `ascii-wallpapers.js`:
- Override `.surface-composer` and `.surface-composer-card` borders, shadows, and backdrop filters.
- Target `.surface-opaque`, `.border-menu-border`, `[role="menu"]`, `[data-radix-menu-content]` with 24px blur and 88% `${t.panel}` tint.
- Target `.agy-sidebar-row.bg-sidebar-secondary` and `[data-active="true"]` with frosted glass pill styling.
- Disable `:is(.agy-sidebar-row, [data-testid="conversation-row-history"]) .agy-row-actions::before` and style `.agy-row-actions` with matching glass gradients.

*Trade-offs:* Zero runtime overhead, pure CSS, works across all 24 themes dynamically.
