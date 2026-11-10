# Linux Support and Installer Ergonomics Design

## Intent and Why
Antigravity ASCII Wallpapers currently supports Windows and macOS. Linux desktop users running the official Antigravity desktop client cannot install or restore the mod out of the box because `manage-wallpapers.cjs` lacks Linux path resolution and executable inspection. Adding native Linux support and CLI ergonomics rounds out platform coverage with zero new dependencies, matching the precedent set by PR #3 (macOS support).

## Goals
- Add automatic path discovery for common Linux Antigravity installations (`/opt`, `/usr/lib`, `~/.local/share`).
- Inspect Linux ELF binaries (`antigravity` / `Antigravity`) for the Electron ASAR integrity fuse, warning if unknown and blocking if enabled.
- Distinguish write permission errors (`EACCES`/`EPERM`) with clear actionable guidance (`sudo`) while keeping `EBUSY` for running processes.
- Accept `uninstall` as an alias for `restore` in `manage-wallpapers.cjs`.
- Document Linux installation, uninstallation, and preferences paths in `README.md` and `index.html`.
- Maintain 100% zero external dependencies (vanilla Node.js built-ins only).

## Non-Goals
- Modifying procedural animation scenes in `wallpaper-scenes.js`.
- Modifying shadow DOM layout, palettes, or styling in `ascii-wallpapers.js`.
- Packaging for distribution package managers (apt, dnf, flatpak, snap).

## Anti-Goals
- Introducing any `package.json` dependencies or build steps.
- Breaking existing Windows or macOS detection, installation, or restore behavior.

## Constraints
- Zero runtime dependencies: use only Node.js `fs`, `path`, `os`, `crypto`, and `vm`.
- Must support Node.js 18 or newer across all platforms.
- Must remain compatible with Antigravity 2.28.2 and future builds passing automated safety checks.

## Approaches Considered
1. **Full In-App Features and Refactor (Eco mode, command extensions, Linux support)**:
   - *Tradeoff*: High blast radius across multiple files (`ascii-wallpapers.js`, `manage-wallpapers.cjs`, `wallpaper-scenes.js`, `wallpapers-main.js`). Risky for upstream maintainer review, as maintainers often reject multi-concern PRs.
2. **Linux Support + Installer Ergonomics (Selected)**:
   - *Tradeoff*: Narrow blast radius restricted to `manage-wallpapers.cjs` and documentation (`README.md`, `index.html`). Follows the exact scope and pattern of PR #3 (macOS support) which was already merged by upstream.
   - *Decision*: Selected for maximum likelihood of upstream PR acceptance and atomic review.

## Detailed Architecture & Implementation Decisions

### 1. Archive Path Resolution (`manage-wallpapers.cjs`)
Expand `resolveArchive()` to check Linux candidate locations when `process.platform === 'linux'`:
- `/opt/Antigravity/resources/app.asar`
- `/opt/antigravity/resources/app.asar`
- `/usr/lib/antigravity/resources/app.asar`
- `/usr/lib/Antigravity/resources/app.asar`
- `path.join(os.homedir(), '.local', 'share', 'antigravity', 'resources', 'app.asar')`
- `path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app.asar')`

Custom path overrides (`process.argv[3]`, `ANTIGRAVITY_APP_PATH`, `ANTIGRAVITY_ASAR`) continue to take precedence.

### 2. ELF Fuse Inspection (`manage-wallpapers.cjs`)
Update `asarIntegrityFuse()`:
- Locate the executable:
  - macOS: `Frameworks/Electron Framework.framework/Electron Framework`
  - Windows: `Antigravity.exe`
  - Linux: search for `antigravity` or `Antigravity` in `appDir`.
- Scan for the sentinel buffer: `dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX`.
- Policy on Linux:
  - Fuse `'on'`: block installation (`errors.push('Electron ASAR integrity validation is enabled for this build')`).
  - Fuse `'unknown'`: emit a warning (`warnings.push('could not read Electron fuses from antigravity binary')`), matching Windows behavior.

### 3. File Permissions and Replace Logic
In `replace(bytes)`:
- If `e.code === 'EBUSY'`: throw `"The app archive is in use. Close Antigravity completely (including the tray icon) and try again."`
- If `e.code === 'EACCES'` or `e.code === 'EPERM'`:
  - On macOS/Linux: throw `"Permission denied writing to " + archive + ". Try running with: sudo node manage-wallpapers.cjs " + (process.argv[2] || 'install')`
  - On Windows: throw `"Permission denied writing to " + archive + ". Try running PowerShell as Administrator."`

### 4. Command Line Interface Actions
In `main()`:
- Normalize action argument: map `'uninstall'` to `'restore'`.
- Supported actions: `install`, `restore`, `uninstall`, `verify`, `status`.

### 5. Documentation Updates
- `README.md`:
  - Add Linux install and restore shell command snippets.
  - Document Linux preferences location: `~/.config/Antigravity/ascii-wallpapers-preferences.json`.
  - Update Requirements section to list Linux.
- `index.html`:
  - Update platform support text and step instructions to include Linux.

## What is Left to the Builder
- Implementing the edits cleanly in `manage-wallpapers.cjs`.
- Updating `README.md` and `index.html`.
- Verifying cross-platform syntax and execution with Node.js on local files.
