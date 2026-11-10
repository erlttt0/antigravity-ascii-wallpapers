# Linux Support and Installer Ergonomics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Linux platform support (paths, ELF fuse check, permissions guidance), CLI `uninstall` alias, and documentation updates to `antigravity-ascii-wallpapers`.

**Architecture:** Extend path resolution and fuse extraction in `manage-wallpapers.cjs` with Linux candidates and ELF executable detection. Add unit test assertions to verify platform paths, fuse logic, and error handling without external dependencies. Update `README.md` and `index.html` with Linux installation and preferences guidance.

**Tech Stack:** Node.js 18+ (vanilla built-ins: `fs`, `path`, `os`, `crypto`, `vm`), CommonJS.

**Spec:** `docs/superpowers/specs/2026-11-06-linux-support-design.md`

## Global Constraints

- Zero external dependencies: rely strictly on Node.js core modules.
- Preserve backward compatibility for Windows and macOS.
- Keep `manage-wallpapers.cjs` self-contained and executable via `node manage-wallpapers.cjs <action>`.

## Review Focus

- Custom path overrides (`process.argv[3]`, `ANTIGRAVITY_APP_PATH`, `ANTIGRAVITY_ASAR`) must take precedence over Linux default candidates.
- Permission errors (`EACCES`/`EPERM`) must advise `sudo` on Linux/macOS and Administrator on Windows.
- The `uninstall` CLI action must behave identically to `restore`.
- ELF fuse parser must handle missing binaries gracefully with `'unknown'` rather than throwing unhandled exceptions.
- Existing hand-verified archive checksum checks and syntax compilation checks must remain intact.

---

### Task 1: Create Test Harness for Installer Logic

**Files:**
- Create: `tests/manage-wallpapers.test.cjs`

**Interfaces:**
- Consumes: `manage-wallpapers.cjs` internal helpers or exported test hooks.
- Produces: Test runner script exiting with code 0 on success, code 1 on failure.

- [ ] **Step 1: Write the failing test**

```javascript
// tests/manage-wallpapers.test.cjs
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Running installer unit tests...');

// Test 1: Verify uninstall alias exists in help / error handling
const { execSync } = require('child_process');
try {
  execSync('node manage-wallpapers.cjs invalid-action', { stdio: 'pipe' });
  assert.fail('Should have failed for invalid action');
} catch (e) {
  const err = e.stderr.toString();
  assert(err.includes('uninstall'), 'Error message must list uninstall as valid action');
}

console.log('Tests passed.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: FAIL with "Error message must list uninstall as valid action"

- [ ] **Step 3: Commit initial test scaffolding**

```bash
git add tests/manage-wallpapers.test.cjs
git commit -m "test: add installer action test harness"
```

---

### Task 2: Implement Linux Path Resolution and CLI Alias

**Files:**
- Modify: `manage-wallpapers.cjs`
- Modify: `tests/manage-wallpapers.test.cjs`

**Interfaces:**
- Consumes: `process.platform`, `os.homedir()`, `process.argv`
- Produces: `resolveArchive()`, `replace()`, and normalized `action` in `main()`

- [ ] **Step 1: Add unit tests for Linux candidate paths and action normalization**

Add tests to `tests/manage-wallpapers.test.cjs` verifying:
1. `uninstall` action does not throw "Use install, verify, status, or restore".
2. Linux paths include `/opt/Antigravity/resources/app.asar`, `/opt/antigravity/resources/app.asar`, `/usr/lib/antigravity/resources/app.asar`, `/usr/lib/Antigravity/resources/app.asar`, `~/.local/share/antigravity/resources/app.asar`, and `~/.local/share/Antigravity/resources/app.asar`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: FAIL

- [ ] **Step 3: Implement Linux paths, permission error messages, and uninstall alias in `manage-wallpapers.cjs`**

- In `resolveArchive()`:
```javascript
  const candidates = process.platform === 'darwin'
    ? ['/Applications/Antigravity.app/Contents/Resources/app.asar', path.join(os.homedir(), 'Applications', 'Antigravity.app', 'Contents', 'Resources', 'app.asar')]
    : process.platform === 'win32' && process.env.LOCALAPPDATA
    ? [path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity', 'resources', 'app.asar')]
    : process.platform === 'linux'
    ? [
        '/opt/Antigravity/resources/app.asar',
        '/opt/antigravity/resources/app.asar',
        '/usr/lib/antigravity/resources/app.asar',
        '/usr/lib/Antigravity/resources/app.asar',
        path.join(os.homedir(), '.local', 'share', 'antigravity', 'resources', 'app.asar'),
        path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app.asar')
      ]
    : [];
```
- In `main()`:
```javascript
  let action = process.argv[2];
  if (action === 'uninstall') action = 'restore';
  if (!['install', 'restore', 'verify', 'status'].includes(action)) throw Error('Use install, verify, status, restore, or uninstall');
```
- In `replace(bytes)`:
```javascript
  catch (e) {
    try { fs.unlinkSync(temp); } catch {}
    if (e.code === 'EBUSY') throw Error('The app archive is in use. Close Antigravity completely (including the tray icon) and try again.');
    if (['EACCES', 'EPERM'].includes(e.code)) {
      if (process.platform === 'win32') throw Error('Permission denied writing to ' + archive + '. Run PowerShell as Administrator and try again.');
      throw Error('Permission denied writing to ' + archive + '. Run with: sudo node manage-wallpapers.cjs ' + (process.argv[2] || 'install'));
    }
    throw e;
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add manage-wallpapers.cjs tests/manage-wallpapers.test.cjs
git commit -m "feat(installer): add Linux path detection, permission hints, and uninstall alias"
```

---

### Task 3: Implement ELF Integrity Fuse Inspection for Linux

**Files:**
- Modify: `manage-wallpapers.cjs`
- Modify: `tests/manage-wallpapers.test.cjs`

**Interfaces:**
- Consumes: `appDir`, `asarIntegrityFuse()`, `inspect()`
- Produces: Fuse status string (`'on'`, `'off'`, `'unknown'`) for Linux binaries.

- [ ] **Step 1: Write test for ELF fuse detection**

In `tests/manage-wallpapers.test.cjs`, mock an ELF file containing the sentinel `dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX` and test fuse parsing.

- [ ] **Step 2: Run test to verify failure**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: FAIL

- [ ] **Step 3: Implement Linux binary lookup in `asarIntegrityFuse()` and `inspect()`**

- In `asarIntegrityFuse()`:
```javascript
function asarIntegrityFuse() {
  let exe = '';
  if (process.platform === 'darwin') {
    exe = path.join(appDir, 'Frameworks', 'Electron Framework.framework', 'Electron Framework');
  } else if (process.platform === 'win32') {
    exe = path.join(appDir, 'Antigravity.exe');
  } else {
    exe = [path.join(appDir, 'antigravity'), path.join(appDir, 'Antigravity')].find(fs.existsSync) || path.join(appDir, 'antigravity');
  }
  if (!fs.existsSync(exe)) return 'unknown';
  const bytes = fs.readFileSync(exe), sentinel = Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX'), i = bytes.indexOf(sentinel);
  if (i < 0) return 'unknown';
  const length = bytes[i + sentinel.length + 1], wire = bytes.subarray(i + sentinel.length + 2, i + sentinel.length + 2 + length).toString('latin1');
  return wire.length > 4 ? (wire[4] === '1' ? 'on' : wire[4] === '0' ? 'off' : 'unknown') : 'unknown';
}
```
- In `inspect()`:
```javascript
  if (fuse === 'unknown' && process.platform === 'darwin') errors.push('could not verify the macOS Electron ASAR integrity fuse; refusing to modify the application');
  else if (fuse === 'unknown') warnings.push('could not read Electron fuses from ' + (process.platform === 'win32' ? 'Antigravity.exe' : 'antigravity binary'));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add manage-wallpapers.cjs tests/manage-wallpapers.test.cjs
git commit -m "feat(installer): add Linux ELF integrity fuse inspection"
```

---

### Task 4: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `index.html`

**Interfaces:**
- Consumes: Spec requirements for Linux documentation
- Produces: Updated docs with Linux instructions, commands, and paths

- [ ] **Step 1: Update `README.md`**

- Update Features / Private section: mention Linux preferences path (`~/.config/Antigravity/ascii-wallpapers-preferences.json`).
- Update Requirements: add Linux to the supported operating systems list.
- Update Install: add Linux tab/command (`node manage-wallpapers.cjs install` or `sudo node manage-wallpapers.cjs install`).
- Update Uninstall: add Linux command (`node manage-wallpapers.cjs restore` or `node manage-wallpapers.cjs uninstall`).

- [ ] **Step 2: Update `index.html`**

- Update Requirements copy to include Linux.
- Update step commands to reflect Linux/macOS/Windows instructions.

- [ ] **Step 3: Verify formatting and links**

Check that markdown and HTML syntax are valid.

- [ ] **Step 4: Commit**

```bash
git add README.md index.html
git commit -m "docs: add Linux installation and configuration documentation"
```

---

### Task 5: End-to-End Verification

**Files:**
- Test: All files in repo

- [ ] **Step 1: Run unit test suite**

Run: `node tests/manage-wallpapers.test.cjs`
Expected: All tests pass cleanly with exit code 0.

- [ ] **Step 2: Run status command on local repository**

Run: `node manage-wallpapers.cjs status`
Expected: Prints clean message or expected path detection without throwing unhandled exceptions.

- [ ] **Step 3: Verify git diff**

Run: `rtk git status` and `rtk git diff`
Expected: Only relevant files staged/modified, clean diff.
