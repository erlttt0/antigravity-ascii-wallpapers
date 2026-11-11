// tests/manage-wallpapers.test.cjs
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

console.log('Running installer unit tests...');

const rootDir = path.resolve(__dirname, '..');

// Test 1: Verify uninstall alias exists in help / error handling
try {
  execSync('node manage-wallpapers.cjs invalid-action', { cwd: rootDir, stdio: 'pipe' });
  assert.fail('Should have failed for invalid action');
} catch (e) {
  const err = (e.stderr || e.stdout || '').toString();
  assert(err.includes('uninstall'), 'Error message must list uninstall as valid action');
  assert(err.includes('Use install, verify, status, restore, or uninstall'), 'Error message must list all valid actions');
}

// Test 2: Verify uninstall CLI action is normalized to restore (does not throw invalid action error)
try {
  execSync('node manage-wallpapers.cjs uninstall /nonexistent/path/app.asar', {
    cwd: rootDir,
    stdio: 'pipe'
  });
  assert.fail('Should fail on nonexistent archive');
} catch (e) {
  const err = (e.stderr || e.stdout || '').toString();
  assert(!err.includes('Use install, verify, status'), 'uninstall action must be recognized as valid');
  assert(err.includes('Antigravity was not found at') || err.includes('No wallpaper backup found'), 'uninstall must proceed to action handling');
}

// Test 3: Linux candidate path resolution
const installer = require('../manage-wallpapers.cjs');
assert(typeof installer.resolveArchive === 'function', 'resolveArchive must be exported');

const originalPlatform = process.platform;
const originalArgv = [...process.argv];
const originalEnvAsar = process.env.ANTIGRAVITY_ASAR;
const originalEnvAppPath = process.env.ANTIGRAVITY_APP_PATH;
const originalExists = fs.existsSync;

try {
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  delete process.env.ANTIGRAVITY_ASAR;
  delete process.env.ANTIGRAVITY_APP_PATH;
  process.argv = ['node', 'manage-wallpapers.cjs', 'status'];

  const expectedLinuxPaths = [
    '/opt/Antigravity/resources/app.asar',
    '/opt/antigravity/resources/app.asar',
    '/usr/lib/antigravity/resources/app.asar',
    '/usr/lib/Antigravity/resources/app.asar',
    path.join(os.homedir(), '.local', 'share', 'antigravity', 'resources', 'app.asar'),
    path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app.asar')
  ];

  for (const expected of expectedLinuxPaths) {
    fs.existsSync = (p) => p === expected;
    const resolved = installer.resolveArchive();
    assert.strictEqual(resolved, expected, 'resolveArchive should discover Linux path: ' + expected);
  }

  // When none exist, should fall back to first Linux candidate
  fs.existsSync = () => false;
  assert.strictEqual(installer.resolveArchive(), '/opt/Antigravity/resources/app.asar', 'Default candidate on Linux should be /opt/Antigravity/resources/app.asar');
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  process.argv = [...originalArgv];
  if (originalEnvAsar !== undefined) process.env.ANTIGRAVITY_ASAR = originalEnvAsar;
  if (originalEnvAppPath !== undefined) process.env.ANTIGRAVITY_APP_PATH = originalEnvAppPath;
  fs.existsSync = originalExists;
}

// Test 4: Check replace() permission error formatting logic
assert(typeof installer.replace === 'function', 'replace must be exported');

const originalWrite = fs.writeFileSync;
const originalUnlink = fs.unlinkSync;

try {
  // Test win32 EACCES / EPERM -> PowerShell as Administrator
  Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  fs.writeFileSync = () => { const err = new Error('access denied'); err.code = 'EACCES'; throw err; };
  fs.unlinkSync = () => {};
  assert.throws(() => installer.replace(Buffer.from('')), /Run PowerShell as Administrator/);

  fs.writeFileSync = () => { const err = new Error('operation not permitted'); err.code = 'EPERM'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /Run PowerShell as Administrator/);

  // Test linux EACCES / EPERM -> sudo node manage-wallpapers.cjs
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  process.argv[2] = 'install';
  fs.writeFileSync = () => { const err = new Error('access denied'); err.code = 'EACCES'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /Run with: sudo node manage-wallpapers\.cjs install/);

  fs.writeFileSync = () => { const err = new Error('operation not permitted'); err.code = 'EPERM'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /Run with: sudo node manage-wallpapers\.cjs install/);

  // Test EBUSY across platforms -> in use message
  fs.writeFileSync = () => { const err = new Error('resource busy'); err.code = 'EBUSY'; throw err; };
  assert.throws(() => installer.replace(Buffer.from('')), /The app archive is in use\. Close Antigravity completely/);

  // Test backup and old backup permission error formatting
  assert(typeof installer.permissionError === 'function', 'permissionError must be exported');
  const backupPath = '/opt/Antigravity/resources/app.asar.ascii-wallpapers.backup';
  const oldBackupPath = '/opt/Antigravity/resources/app.asar.ascii-wallpapers.backup.previous-12345';

  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  process.argv[2] = 'install';
  const linuxBackupErr = installer.permissionError(backupPath);
  assert.strictEqual(
    linuxBackupErr.message,
    'Permission denied writing to ' + backupPath + '. Run with: sudo node manage-wallpapers.cjs install'
  );
  const linuxOldErr = installer.permissionError(oldBackupPath);
  assert.strictEqual(
    linuxOldErr.message,
    'Permission denied writing to ' + oldBackupPath + '. Run with: sudo node manage-wallpapers.cjs install'
  );

  Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  const winBackupErr = installer.permissionError(backupPath);
  assert.strictEqual(
    winBackupErr.message,
    'Permission denied writing to ' + backupPath + '. Run PowerShell as Administrator and try again.'
  );
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  process.argv = [...originalArgv];
  fs.writeFileSync = originalWrite;
  fs.unlinkSync = originalUnlink;
}

// Test 5: Linux ELF integrity fuse inspection and inspect() reporting
assert(typeof installer.asarIntegrityFuse === 'function', 'asarIntegrityFuse must be exported');
assert(typeof installer.inspect === 'function', 'inspect must be exported');

function makeFuseBuffer(wireString) {
  const sentinel = Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX');
  const version = Buffer.from([1]);
  const wire = Buffer.from(wireString, 'latin1');
  const len = Buffer.from([wire.length]);
  return Buffer.concat([Buffer.from('ELF_HEADER_DUMMY_DATA'), sentinel, version, len, wire]);
}

function makeMinimalAsar() {
  const json = Buffer.from(JSON.stringify({ files: {} }));
  const padded = Math.ceil((4 + json.length) / 4) * 4;
  const head = Buffer.alloc(8 + padded);
  head.writeUInt32LE(4 + padded, 0);
  head.writeUInt32LE(json.length, 4);
  json.copy(head, 8);
  const size = Buffer.alloc(8);
  size.writeUInt32LE(4, 0);
  size.writeUInt32LE(head.length, 4);
  return Buffer.concat([size, head]);
}

const originalReadFileSync = fs.readFileSync;

try {
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });

  // 1. Binary lookup precedence: checks 'antigravity' first, then 'Antigravity'
  let checkedPaths = [];
  let readPath = null;
  fs.existsSync = (p) => {
    checkedPaths.push(p);
    return path.basename(p) === 'antigravity';
  };
  fs.readFileSync = (p) => {
    readPath = p;
    return makeFuseBuffer('00001');
  };

  let status = installer.asarIntegrityFuse();
  assert.strictEqual(status, 'on', 'Should return "on" when fuse 4 is "1"');
  assert.strictEqual(path.basename(readPath), 'antigravity', 'Should prefer lowercase antigravity binary');

  // If lowercase does not exist, checks Antigravity (capitalized)
  checkedPaths = [];
  readPath = null;
  fs.existsSync = (p) => {
    checkedPaths.push(p);
    return path.basename(p) === 'Antigravity';
  };
  fs.readFileSync = (p) => {
    readPath = p;
    return makeFuseBuffer('00000');
  };

  status = installer.asarIntegrityFuse();
  assert.strictEqual(status, 'off', 'Should return "off" when fuse 4 is "0"');
  assert.strictEqual(path.basename(readPath), 'Antigravity', 'Should fallback to uppercase Antigravity binary');

  // If neither exists, returns 'unknown'
  fs.existsSync = () => false;
  status = installer.asarIntegrityFuse();
  assert.strictEqual(status, 'unknown', 'Should return "unknown" when binary does not exist');

  // 2. Wire parsing edge cases
  fs.existsSync = () => true;

  // Wire too short
  fs.readFileSync = () => makeFuseBuffer('000');
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when fuse wire is too short');

  // Sentinel missing
  fs.readFileSync = () => Buffer.from('binary data without sentinel');
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when sentinel is missing');

  // Unreadable binary (EACCES / EPERM / EIO)
  fs.readFileSync = () => { const err = new Error('permission denied'); err.code = 'EACCES'; throw err; };
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when binary read throws EACCES');

  fs.readFileSync = () => { const err = new Error('operation not permitted'); err.code = 'EPERM'; throw err; };
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when binary read throws EPERM');

  fs.readFileSync = () => { const err = new Error('i/o error'); err.code = 'EIO'; throw err; };
  assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Should return "unknown" when binary read throws EIO');

  // 3. inspect() behavior on Linux
  const dummyArchive = makeMinimalAsar();

  // Fuse 'on' -> error
  fs.readFileSync = () => makeFuseBuffer('00001');
  let report = installer.inspect(dummyArchive, '', '');
  assert(
    report.errors.includes('Electron ASAR integrity validation is enabled for this build'),
    'inspect() should push error when Linux fuse is "on"'
  );

  // Fuse 'unknown' on Linux -> warning mentioning 'antigravity binary'
  fs.existsSync = () => false;
  report = installer.inspect(dummyArchive, '', '');
  assert(
    report.warnings.includes('could not read Electron fuses from antigravity binary'),
    'inspect() should push warning mentioning antigravity binary on Linux when fuse is unknown'
  );
  assert(
    !report.warnings.some((w) => w.includes('Antigravity.exe')),
    'inspect() should not mention Antigravity.exe on Linux'
  );

  // Fuse 'unknown' on Windows -> warning mentioning 'Antigravity.exe'
  Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  fs.existsSync = () => false;
  report = installer.inspect(dummyArchive, '', '');
  assert(
    report.warnings.includes('could not read Electron fuses from Antigravity.exe'),
    'inspect() should push warning mentioning Antigravity.exe on Windows when fuse is unknown'
  );
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  fs.existsSync = originalExists;
  fs.readFileSync = originalReadFileSync;
}

// Test 6: Document viewer CSS resets for PDF and text previewers
const asciiSource = fs.readFileSync(path.resolve(__dirname, '../ascii-wallpapers.js'), 'utf8');

const requiredSelectors = [
  'iframe',
  'embed',
  'object',
  '.pdfViewer',
  '.textLayer',
  '[class*="pdf" i]',
  '.monaco-editor'
];

for (const selector of requiredSelectors) {
  assert(
    asciiSource.includes(selector),
    `ascii-wallpapers.js must declare viewer reset selector: ${selector}`
  );
}

assert(
  asciiSource.includes('text-shadow: none !important') || asciiSource.includes('text-shadow:none!important'),
  'ascii-wallpapers.js must reset text-shadow on viewers'
);

assert(
  asciiSource.includes('isolation: isolate') || asciiSource.includes('isolation:isolate'),
  'ascii-wallpapers.js must isolate viewer stacking context'
);

assert(
  asciiSource.includes('color: initial') || asciiSource.includes('color:initial'),
  'ascii-wallpapers.js must reset color on document viewers'
);

// Assert viewer reset is present in both stylesheet branches of appearance()
const appearanceMatch = asciiSource.match(/function appearance\([^)]*\)\s*\{([\s\S]*?)\s+function apply/);
assert(appearanceMatch, 'appearance() function must exist in ascii-wallpapers.js');
const appearanceBody = appearanceMatch[1];
const resetMatches = appearanceBody.match(/\$\{viewerReset\}/g) || [];
assert(
  appearanceBody.includes('viewerReset') && resetMatches.length >= 2,
  'viewerReset must be included in both the wallpaper-only and full recolor stylesheet branches'
);

// Test 7: Verify Antigravity 2.30.0+ inset container transparency rules in ascii-wallpapers.js
const insetMatches = appearanceBody.match(/\.agy-sheet\[data-sheet-inset\]\s*\[data-main-content-body\]/g) || [];
assert(
  insetMatches.length >= 2,
  'inset container transparency rule must be included in both the wallpaper-only and full recolor stylesheet branches'
);
assert(
  appearanceBody.includes('.agy-inset-shell [data-side-panel-body]'),
  'appearance() must include transparency rules for .agy-inset-shell [data-side-panel-body]'
);

// Test 8: Verify frosted glass surface refinements in ascii-wallpapers.js
assert(
  appearanceBody.includes('.border-menu-border') && appearanceBody.includes('[role="menu"]'),
  'appearance() must include frosted menu dropdown styling'
);
assert(
  appearanceBody.includes('.agy-sidebar-row.bg-sidebar-secondary'),
  'appearance() must include frosted active sidebar item styling'
);
assert(
  appearanceBody.includes('.agy-row-actions::before'),
  'appearance() must neutralize the opaque .agy-row-actions::before pseudo-element'
);

// Test 9: Verify dynamic text truncation on hover/active
assert(
  appearanceBody.includes('.agy-sidebar-row:hover > div:nth-child(2)'),
  'appearance() must include dynamic text truncation on .agy-sidebar-row hover'
);
assert(
  /padding-right:\s*76px/.test(appearanceBody),
  'appearance() must allocate padding-right for floating actions to prevent text collision'
);

// Test 10: Verify sidebar and header share the same glass recipe (30% tint, 10px blur) in both branches
const compactAppearance = appearanceBody.replace(/\s+/g, ' ');
const sidebarDecls = [...compactAppearance.matchAll(/nav\.bg-sidebar\s*\{((?:[^{}]|\$\{[^}]+\})*)\}/g)].map((m) => m[1]);
const headerDecls = [...compactAppearance.matchAll(/\.agy-shell\s*>\s*\.shrink-0\s*\{((?:[^{}]|\$\{[^}]+\})*)\}/g)].map((m) => m[1]);
assert(sidebarDecls.length >= 2 && headerDecls.length >= 2, 'appearance() must style sidebar and header in both full-recolor and wallpaper-only branches');
for (const decl of [...sidebarDecls, ...headerDecls]) {
  assert(
    /background-color:\s*color-mix\(in srgb,\s*\$\{t\.chrome\}\s*30%,\s*transparent\)\s*!important/.test(decl) &&
    /backdrop-filter:\s*blur\(10px\)\s*!important/.test(decl) &&
    /-webkit-backdrop-filter:\s*blur\(10px\)\s*!important/.test(decl),
    'appearance() must give sidebar and .agy-shell > .shrink-0 header matching glass recipe'
  );
}

// Test 11: Verify the header has no bottom border, so header and sidebar read as one block
for (const decl of headerDecls) {
  assert(
    /border-bottom:\s*0\s*!important/.test(decl) && !/border-bottom:\s*[1-9]/.test(decl),
    'appearance() must keep border-bottom: 0 on .agy-shell > .shrink-0'
  );
}

// Test 12: Verify calm titlebar zone prevents bright character bleeding into header
const scenesSource = fs.readFileSync(path.join(__dirname, '..', 'wallpaper-scenes.js'), 'utf8');
assert(
  scenesSource.includes('topH') && scenesSource.includes('ey <= 0'),
  'wallpaper-scenes.js must define topH titlebar calm boundary and suppress glyph rendering when ey <= 0'
);
assert(
  asciiSource.includes('topHeight') && asciiSource.includes('.agy-shell > .shrink-0'),
  'ascii-wallpapers.js must calculate topHeight from .agy-shell > .shrink-0 and pass it into calmBox'
);

// Test 13: Verify transparent window controls overlay color to prevent opaque cutout
assert(
  /color:\s*['"]#00000000['"]/.test(asciiSource),
  'ascii-wallpapers.js must set transparent titleBarOverlay color (#00000000) to blend with glass topbar'
);

// Test 13b: quotaGroups merges Low/Medium/High variants, keeps the lowest fraction, and treats a missing fraction as 0
const quotaMatch = asciiSource.match(/const hasQuota[\s\S]*?function quotaGroups\([\s\S]*?\r?\n  \}\r?\n/);
assert(quotaMatch, 'quotaSummary() and quotaGroups() must exist in ascii-wallpapers.js');
const { quotaSummary, quotaGroups } = new Function(quotaMatch[0] + 'return {quotaSummary,quotaGroups};')();

// Test 13c: quotaSummary keeps server group order, labels windows, and takes the tighter limit per group
const summary = quotaSummary([
  { displayName: 'Gemini Models', description: 'Flash, Pro', buckets: [
    { window: 'weekly', remainingFraction: 0.97, resetTime: '2026-11-14T13:43:15Z' },
    { window: '5h', resetTime: '2026-11-11T00:34:52Z' }
  ] },
  { displayName: 'Claude and GPT models', buckets: [{ window: 'weekly', remainingFraction: 1, resetTime: '2026-11-17T19:34:52Z' }] },
  { displayName: 'Empty', buckets: [{}] }
]);
assert.deepStrictEqual(summary.map(g => [g.name, g.left]), [['Gemini Models', 0], ['Claude and GPT models', 1]]);
assert.deepStrictEqual(summary[0].buckets.map(b => [b.label, b.left]), [['Weekly', 0.97], ['5-hour', 0]]);
assert.strictEqual(summary[0].info, 'Flash, Pro');
assert.deepStrictEqual(quotaSummary(undefined), []);
const groups = quotaGroups([
  { label: 'Claude Opus 5.5 (Low)', quotaInfo: { remainingFraction: 0.8, resetTime: '2026-11-11T00:00:00Z' } },
  { label: 'Claude Opus 5.5 (High)', quotaInfo: { remainingFraction: 0.4, resetTime: '2026-11-11T00:00:00Z' } },
  { label: 'Gemini Flash', quotaInfo: { resetTime: '2026-11-12T00:00:00Z' } },
  { label: 'Unlimited', quotaInfo: {} },
  { label: 'No info' }
]);
assert.deepStrictEqual(groups.map(g => [g.name, g.left]), [['Gemini Flash', 0], ['Claude Opus 5.5', 0.4]]);
assert.strictEqual(groups[1].buckets[0].reset, Date.parse('2026-11-11T00:00:00Z'));
assert.deepStrictEqual(quotaGroups(undefined), []);

// Test 14 (Task 1): atlases LRU cap, draw() frameKey strength skip, and scene refactor parity
const themesMatch = asciiSource.match(/const themes=\[([\s\S]*?)\r?\n\s*\];/);
assert(themesMatch, 'themes array must exist in ascii-wallpapers.js');
const allThemes = new Function('return [' + themesMatch[1] + '];')();
const themeById = Object.fromEntries(allThemes.map(t => [t.id, t]));

function createSceneHarness() {
  let fillTextCalls = 0, layerClears = 0, layerDraws = 0, mainDraws = 0, hashVal = 2166136261, recordOps = false;
  const mainAlphas = [];
  const mixStr = s => { for (let i = 0; i < s.length; i++) { hashVal ^= s.charCodeAt(i); hashVal = Math.imul(hashVal, 16777619) >>> 0; } };
  const mixNum = n => { hashVal ^= (Math.round(n * 1000) | 0); hashVal = Math.imul(hashVal, 16777619) >>> 0; };
  const makeCtx = (canvas, isMain) => {
    const ctx = {
      canvas, font: '', textAlign: '', textBaseline: '', fillStyle: '', strokeStyle: '', lineWidth: 0, globalAlpha: 1,
      getTransform: () => ({ a: 1 }), scale() {},
      createLinearGradient: () => ({ addColorStop() {} }),
      createRadialGradient: () => ({ addColorStop() {} }),
      fillRect(x, y) { if (recordOps && !isMain) { mixStr('fr:' + ctx.fillStyle); mixNum(ctx.globalAlpha); mixNum(x); mixNum(y); } },
      beginPath() {}, moveTo() {}, lineTo() {}, fill() {}, stroke() {},
      fillText() { fillTextCalls++; },
      clearRect(x, y) { if (!isMain) layerClears++; if (recordOps && !isMain) { mixStr('cr'); mixNum(x); mixNum(y); } },
      drawImage(img, a, b, c, d, dx, dy) {
        if (isMain) { mainDraws++; mainAlphas.push(ctx.globalAlpha); }
        else { layerDraws++; if (recordOps) { mixStr('di'); mixNum(ctx.globalAlpha); mixNum(a); mixNum(b); mixNum(dx); mixNum(dy); } }
      },
      save() {}, restore() {}
    };
    return ctx;
  };
  const doc = { createElement: () => { const c = { width: 0, height: 0, getContext: () => makeCtx(c, false) }; return c; } };
  const drawFn = new Function('document', scenesSource + '\nreturn drawAsciiScene;')(doc);
  return {
    drawFn,
    makeMainCtx: (w, h) => makeCtx({ width: w, height: h }, true),
    resetCounters() { fillTextCalls = 0; layerClears = 0; layerDraws = 0; mainDraws = 0; mainAlphas.length = 0; },
    startHash() { hashVal = 2166136261; recordOps = true; },
    endHash() { recordOps = false; return hashVal.toString(16); },
    counts: () => ({ fillTextCalls, layerClears, layerDraws, mainDraws, mainAlphas: [...mainAlphas] })
  };
}

{
  const h = createSceneHarness();
  const mainCtx = h.makeMainCtx(160, 100);
  for (let i = 0; i < 40; i++) h.drawFn(mainCtx, 160, 100, allThemes[i], 0, 1, null, { glyphs: 'ascii', scale: 'normal' });

  h.resetCounters();
  h.drawFn(mainCtx, 160, 100, allThemes[39], 0.2, 1, null, { glyphs: 'ascii', scale: 'normal' });
  assert.strictEqual(h.counts().fillTextCalls, 0, 'Recent atlas (#39) must remain cached within MAX_ATLASES=32');

  h.resetCounters();
  h.drawFn(mainCtx, 160, 100, allThemes[0], 0.2, 1, null, { glyphs: 'ascii', scale: 'normal' });
  assert(h.counts().fillTextCalls > 0, 'Oldest atlas (#0) must be evicted once cache exceeds MAX_ATLASES=32');
}

{
  const h = createSceneHarness();
  const mainCtx = h.makeMainCtx(320, 200);
  const calm = { l: 80, r: 240, t: 38 };
  const fx = { energy: 0.4, pulse: 0.3, glyphs: 'ascii', scale: 'normal' };

  h.drawFn(mainCtx, 320, 200, themeById.sakura, 0, 1, calm, fx);
  h.resetCounters();
  h.drawFn(mainCtx, 320, 200, themeById.sakura, 0, 0.55, calm, fx);
  const c1 = h.counts();
  assert.strictEqual(c1.layerClears, 0, 'strength-only redraw at seconds=0 must skip Pass 1/Pass 2 clears');
  assert.strictEqual(c1.layerDraws, 0, 'strength-only redraw at seconds=0 must skip Pass 1/Pass 2 draws');
  assert.strictEqual(c1.mainDraws, 2, 'strength-only redraw must still composite bg and layer');
  assert(Math.abs(c1.mainAlphas[1] - 0.55) < 1e-6, 'layer blit must use updated strength alpha');

  h.resetCounters();
  h.drawFn(mainCtx, 320, 200, themeById.zen, 0, 0.55, calm, fx);
  assert(h.counts().layerClears > 0, 'theme change with matching time must invalidate frameKey');
}

{
  const expectedHashes = {
    sakura: 'c25741b3', blueprint: '9e695031', neon: '71af3eed', blackhole: '9a88cb45',
    volcano: 'bb9af405', radar: 'ad6efbe1', saturn: '85b92326', stainedglass: '67efd63a',
    reef: '6e5ee940', oasis: '9f8b63a7', windmills: '5aed6fff', island: '857010b7', zen: 'c8c68788'
  };
  for (const [id, expected] of Object.entries(expectedHashes)) {
    const h = createSceneHarness();
    const mainCtx = h.makeMainCtx(640, 360);
    h.startHash();
    h.drawFn(mainCtx, 640, 360, themeById[id], 1.25, 1, { l: 160, r: 480, t: 38 }, { energy: 0.4, pulse: 0.3, glyphs: 'ascii', scale: 'normal' });
    assert.strictEqual(h.endHash(), expected, `Refactored scene "${id}" must match exact baseline draw ops`);
  }
}

// Test 15 (Task 2): UI runtime optimizations (positionTrigger, modeNodes, ResizeObserver rAF, visibilitychange, previews)
function createUiHarness(initialHidden = false, opts = {}) {
  const queryLogs = [], timers = [], intervals = [], rafQueue = [], docListeners = {}, winListeners = {}, drawCalls = [], overlayCalls = [];
  let mutCb = null, mutDisconnects = 0, resizeCb = null, resizeDisconnects = 0, nextId = 1, focusedEl = null;

  const parseSimple = sel => {
    const trimmed = sel.trim();
    const parts = trimmed.split(/\s+/);
    const matchesPart = (el, part) => {
      if (part === '>') return true;
      let s = part, notHidden = false;
      if (s.includes(':not([hidden])')) { notHidden = true; s = s.replace(':not([hidden])', ''); }
      if (notHidden && (el.hidden || el.attributes.hidden !== undefined)) return false;
      const attrM = s.match(/\[([^\]*=]+)(\*)?(?:=(?:"([^"]*)"|([^\]]*)))?\]/);
      let base = s;
      if (attrM) {
        base = s.slice(0, attrM.index);
        const rawVal = attrM[1] === 'hidden' ? (el.hidden ? '' : undefined) : el.attributes[attrM[1]];
        if (rawVal === undefined) return false;
        const expected = attrM[3] ?? attrM[4];
        if (expected !== undefined) {
          if (attrM[2] === '*') { if (!rawVal.includes(expected)) return false; }
          else if (rawVal !== expected) return false;
        }
      }
      if (base.startsWith('#')) return el.id === base.slice(1);
      if (base.startsWith('.')) return el.classList.contains(base.slice(1));
      if (base) return el.tagName.toLowerCase() === base.toLowerCase();
      return true;
    };
    const matchChain = el => {
      if (parts.length === 1) return matchesPart(el, parts[0]);
      if (parts.length === 3 && parts[1] === '>') return matchesPart(el, parts[2]) && el.parentNode && matchesPart(el.parentNode, parts[0]);
      if (parts.length === 2) {
        if (!matchesPart(el, parts[1])) return false;
        let p = el.parentNode;
        while (p) { if (matchesPart(p, parts[0])) return true; p = p.parentNode; }
        return false;
      }
      return false;
    };
    return matchChain;
  };
  const matchesSelector = (el, sel) => sel.split(',').some(s => parseSimple(s)(el));

  function makeEl(tag) {
    const classes = new Set();
    const elListeners = {};
    const el = {
      tagName: tag.toUpperCase(), nodeType: 1, children: [], parentNode: null,
      attributes: {}, dataset: {}, textContent: '', value: /^(input|textarea|select|option)$/i.test(tag) ? '' : undefined, hidden: false, disabled: false, checked: false,
      width: 0, height: 0, title: '', id: '', _rect: { left: 100, top: 8, width: 80, height: 24, right: 180, bottom: 32 },
      style: { _props: {}, setProperty(k, v) { this._props[k] = String(v); }, getPropertyValue(k) { return this._props[k] || ''; }, removeProperty(k) { delete this._props[k]; } },
      classList: {
        add: (...c) => c.forEach(x => classes.add(x)),
        remove: (...c) => c.forEach(x => classes.delete(x)),
        contains: c => classes.has(c)
      },
      get isConnected() { let p = this; while (p) { if (p === document.documentElement) return true; p = p.parentNode; } return false; },
      setAttribute(k, v) {
        el.attributes[k] = String(v);
        if (k === 'id') el.id = String(v);
        if (k === 'class') { classes.clear(); String(v).split(/\s+/).filter(Boolean).forEach(c => classes.add(c)); }
        if (k === 'hidden') el.hidden = true;
        if (k === 'width' || k === 'height') el[k] = Number(v);
        if (k.startsWith('data-')) el.dataset[k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = String(v);
      },
      removeAttribute(k) {
        delete el.attributes[k];
        if (k === 'hidden') el.hidden = false;
      },
      getAttribute: k => el.attributes[k] ?? null,
      toggleAttribute: (k, force) => { const has = el.attributes[k] !== undefined; if (force ?? !has) el.setAttribute(k, ''); else el.removeAttribute(k); },
      append(...nodes) { for (const n of nodes) { if (typeof n === 'string') el.textContent += n; else { n.parentNode = el; el.children.push(n); } } },
      prepend(...nodes) { for (let i = nodes.length - 1; i >= 0; i--) { const n = nodes[i]; n.parentNode = el; el.children.unshift(n); } },
      remove() { if (el.parentNode) { el.parentNode.children = el.parentNode.children.filter(c => c !== el); el.parentNode = null; } },
      replaceChildren(...nodes) { for (const c of el.children) c.parentNode = null; el.children = []; el.append(...nodes); },
      querySelectorAll(sel) {
        if (el === document || el === document.body) queryLogs.push(sel);
        const out = [];
        const walk = n => { for (const c of n.children || []) { if (matchesSelector(c, sel)) out.push(c); walk(c); } };
        walk(el);
        return out;
      },
      querySelector: sel => el.querySelectorAll(sel)[0] || null,
      matches: sel => matchesSelector(el, sel),
      closest: sel => { let p = el; while (p && p.nodeType === 1) { if (matchesSelector(p, sel)) return p; p = p.parentNode; } return null; },
      contains: other => { let p = other; while (p) { if (p === el) return true; p = p.parentNode; } return false; },
      attachShadow() {
        const sr = makeEl('shadow-root');
        Object.defineProperty(sr, 'activeElement', { get: () => (focusedEl && sr.contains(focusedEl) ? focusedEl : null) });
        el.shadowRoot = sr;
        return sr;
      },
      addEventListener(n, fn) { (elListeners[n] ||= []).push(fn); },
      removeEventListener(n, fn) { elListeners[n] = (elListeners[n] || []).filter(f => f !== fn); },
      dispatchEvent(ev) {
        const eventObj = { target: el, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {}, composedPath: () => [el, document.body], ...ev };
        if (eventObj.type === 'click') el.onclick?.(eventObj);
        (elListeners[eventObj.type] || []).forEach(f => f(eventObj));
      },
      focus() { focusedEl = el; }, scrollIntoView() {}, getBoundingClientRect: () => ({ ...el._rect }),
      getContext: () => ({ setTransform() {} }),
      animate() {}
    };
    return el;
  }

  const document = {
    readyState: 'complete', hidden: initialHidden, scripts: [],
    documentElement: null, head: null, body: null,
    createElement: makeEl,
    createRange: opts.createRange || (() => ({ selectNodeContents() {} })),
    execCommand: opts.execCommand || (() => {}),
    getElementById: id => document.documentElement.querySelector('#' + id),
    querySelectorAll: sel => { queryLogs.push(sel); return document.documentElement.querySelectorAll(sel); },
    querySelector: sel => document.querySelectorAll(sel)[0] || null,
    addEventListener(n, fn) { (docListeners[n] ||= []).push(fn); },
    removeEventListener(n, fn) { docListeners[n] = (docListeners[n] || []).filter(f => f !== fn); }
  };
  document.documentElement = makeEl('html');
  document.head = makeEl('head');
  document.body = makeEl('body');
  document.documentElement.append(document.head, document.body);

  const root = makeEl('div'); root.setAttribute('id', 'root');
  const shell = makeEl('div'); shell.setAttribute('class', 'agy-shell'); shell._rect = { left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800 };
  const topBar = makeEl('div'); topBar.setAttribute('class', 'shrink-0'); topBar._rect = { left: 0, top: 0, width: 1200, height: 38, right: 1200, bottom: 38 };
  const openIdeBtn = makeEl('button'); openIdeBtn.textContent = 'Open IDE'; openIdeBtn._rect = { left: 950, top: 6, width: 70, height: 24, right: 1020, bottom: 30 };
  topBar.append(openIdeBtn);
  const sheet = makeEl('div'); sheet.setAttribute('class', 'agy-sheet'); sheet._rect = { left: 0, top: 38, width: 1200, height: 762, right: 1200, bottom: 800 };
  const darkExisting = makeEl('div'); darkExisting.setAttribute('class', opts.lightRoot ? 'light' : 'dark');
  shell.append(topBar, sheet, darkExisting);
  if (!opts.deferShell) root.append(shell);
  document.body.append(root);

  const store = { 'asciiWallpaperPreferences.v1': opts.initialPrefs || '' };
  const window = {
    innerWidth: opts.innerWidth || 1200, devicePixelRatio: 1,
    self: opts.winSelf, top: opts.winTop,
    addEventListener(n, fn) { (winListeners[n] ||= []).push(fn); },
    removeEventListener(n, fn) { winListeners[n] = (winListeners[n] || []).filter(f => f !== fn); }
  };
  const computedFn = opts.getComputedStyle || (() => ({ getPropertyValue: () => '' }));
  const useElectron = Boolean(opts.useElectron || opts.getPrefs || opts.savePrefs);
  const ipcRenderer = {
    invoke: (ch, payload) => {
      if (ch === 'ascii-wallpapers:get') return opts.getPrefs ? opts.getPrefs() : Promise.resolve({ 'asciiWallpaperPreferences.v1': store['asciiWallpaperPreferences.v1'] });
      if (ch === 'ascii-wallpapers:save') return opts.savePrefs ? opts.savePrefs(payload) : Promise.resolve(true);
      return Promise.resolve(null);
    }
  };
  const winAPI = opts.windowAPI || { setTitleBarOverlay: c => { overlayCalls.push(c); return Promise.resolve(); } };
  const sandbox = {
    window, document, navigator: { platform: 'Win32', userAgent: 'Chrome' }, devicePixelRatio: 1,
    get innerWidth() { return window.innerWidth; },
    location: { origin: opts.origin || 'https://example.invalid' },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    getComputedStyle: el => computedFn(el),
    getSelection: opts.getSelection || (() => ({ removeAllRanges() {}, addRange() {} })),
    fetch: opts.fetch || (() => Promise.reject(new Error('unmocked fetch'))),
    AbortController: opts.AbortController || globalThis.AbortController,
    electron_1: useElectron ? { ipcRenderer } : undefined,
    electronNativeAPI: winAPI,
    HTMLTextAreaElement: opts.HTMLTextAreaElement || (() => { const C = class {}; Object.defineProperty(C.prototype, 'value', { configurable: true, set(v) { Object.defineProperty(this, 'value', { value: String(v), writable: true, configurable: true, enumerable: true }); } }); return C; })(),
    Event: class { constructor(type, init = {}) { this.type = type; Object.assign(this, init); } },
    MutationObserver: class { constructor(cb) { mutCb = cb; } observe() {} disconnect() { mutDisconnects++; } },
    ResizeObserver: class { constructor(cb) { resizeCb = cb; } observe() {} disconnect() { resizeDisconnects++; } },
    requestAnimationFrame: cb => { const id = nextId++; rafQueue.push({ id, cb }); return id; },
    cancelAnimationFrame: id => { const i = rafQueue.findIndex(x => x.id === id); if (i >= 0) rafQueue.splice(i, 1); },
    setTimeout: (cb, ms) => { const id = nextId++; timers.push({ id, cb, ms }); return id; },
    clearTimeout: id => { const i = timers.findIndex(x => x.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval: (cb, ms) => { const id = nextId++; intervals.push({ id, cb, ms }); return id; },
    clearInterval: id => { const i = intervals.findIndex(x => x.id === id); if (i >= 0) intervals.splice(i, 1); },
    performance: { now: () => 100 },
    drawAsciiScene: (ctx, w, h, t) => { drawCalls.push({ w, h, id: t.id }); }
  };
  new Function(...Object.keys(sandbox), asciiSource)(...Object.values(sandbox));
  return {
    document, window, root, shell, topBar, sheet, openIdeBtn, darkExisting, makeEl, queryLogs, drawCalls, overlayCalls, timers, intervals, ipcRenderer,
    setFocused(el) { focusedEl = el; },
    getObservers: () => ({ mutDisconnects, resizeDisconnects, hasMutCb: !!mutCb, rafLen: rafQueue.length, timerLen: timers.length, intervalLen: intervals.length }),
    flushRaf(now = 200) { const cur = rafQueue.splice(0); cur.forEach(x => x.cb(now)); return cur.length; },
    flushTimers() { const cur = timers.splice(0); cur.forEach(x => x.cb()); },
    triggerMut: (added = []) => { mutCb?.([{ addedNodes: added }]); },
    triggerResize: () => { resizeCb?.(); },
    fireDoc: (ev, data = {}) => { (docListeners[ev] || []).forEach(f => f({ target: document.body, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {}, composedPath: () => [document.body], ...data })); },
    fireWin: (ev, data = {}) => { (winListeners[ev] || []).forEach(f => f({ preventDefault() {}, ...data })); },
    getHost: () => document.getElementById('agy-ascii-controls')
  };
}

{
  const ui = createUiHarness(false);
  ui.queryLogs.length = 0;
  for (let i = 0; i < 5; i++) {
    ui.triggerMut([]);
    ui.flushTimers();
  }
  assert(!ui.queryLogs.some(s => s.includes('div')), 'positionTrigger must never query document-wide div elements while Open IDE is anchored');
  assert.strictEqual(ui.queryLogs.filter(s => s.includes('Open') || s.includes('role="button"')).length, 0, 'Cached connected Open IDE button must avoid re-querying across mutation ticks');

  ui.openIdeBtn.remove();
  ui.triggerMut([]);
  ui.flushTimers();
  assert(ui.queryLogs.some(s => s.includes('button, a, [role="button"]')), 'Detached Open IDE anchor must invalidate and re-query cleanly');
}

{
  const ui = createUiHarness(false);
  ui.darkExisting.remove();
  const darkNew = ui.makeEl('div'); darkNew.setAttribute('class', 'dark');
  ui.shell.append(darkNew);
  ui.triggerMut([darkNew]);
  ui.flushTimers();
  assert(darkNew.classList.contains('light'), 'Newly mounted #root .dark node must receive theme mode class (clouds -> light)');
  // If modeNodes pruned darkExisting while detached, re-attaching it cleanly avoids touching its classes on Off reset
  ui.darkExisting.classList.remove('light'); ui.darkExisting.classList.add('custom-marker');
  ui.shell.append(ui.darkExisting);
  ui.getHost().shadowRoot.querySelector('.reset').dispatchEvent({ type: 'click' });
  assert(ui.darkExisting.classList.contains('custom-marker') && !ui.darkExisting.classList.contains('dark'), 'Pruned detached nodes must not be retained or restored on reset');
  assert(darkNew.classList.contains('dark') && !darkNew.classList.contains('light'), 'Connected newly mounted node must restore its original .dark class on reset');
}

{
  const ui = createUiHarness(false);
  ui.drawCalls.length = 0;
  ui.triggerResize(); ui.triggerResize(); ui.triggerResize();
  assert.strictEqual(ui.drawCalls.length, 0, 'ResizeObserver callbacks must defer rendering to coalesced rAF');
  ui.flushRaf(116);
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 1200).length, 1, 'Coalesced rAF must render main scene exactly once');

  ui.drawCalls.length = 0;
  ui.document.hidden = true;
  ui.fireDoc('visibilitychange');
  assert.strictEqual(ui.drawCalls.length, 0, 'visibilitychange to hidden must not render a wasted frame');
  ui.document.hidden = false;
  ui.fireDoc('visibilitychange');
  assert.strictEqual(ui.drawCalls.length, 1, 'visibilitychange back to visible must render immediately');
}

{
  const ui = createUiHarness(false);
  const sr = ui.getHost().shadowRoot;
  ui.drawCalls.length = 0;
  sr.querySelector('.trigger').dispatchEvent({ type: 'click' });
  const initPreviewDraws = ui.drawCalls.filter(c => c.w === 160).length;
  assert.strictEqual(initPreviewDraws, 1, 'Opening picker must draw only the active visible card synchronously');

  ui.drawCalls.length = 0;
  ui.flushRaf(116);
  const batch1 = ui.drawCalls.filter(c => c.w === 160).length;
  assert(batch1 >= 1 && batch1 <= 6, `First rAF preview batch must draw at most 6 stale cards (got ${batch1})`);

  // Drain all remaining preview batches (50 total -> 1 sync + 49 queued across <= 9 rAF ticks)
  for (let k = 0; k < 12; k++) ui.flushRaf(116);
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 160).length + initPreviewDraws, 50, 'All 50 preview cards must finish across rAF batches');

  // Search filter hiding/showing already-stamped cards must NOT redraw them
  ui.drawCalls.length = 0;
  const search = sr.querySelector('.search');
  search.value = 'sakura';
  search.dispatchEvent({ type: 'input' });
  search.value = '';
  search.dispatchEvent({ type: 'input' });
  ui.flushRaf(116);
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 160).length, 0, 'Search filter changes must not redraw already-stamped previews');

  // Changing glyphs mid-queue must cancel the prior batch cleanly and re-stamp with the new key
  const glyphSel = sr.querySelector('.glyphs');
  ui.drawCalls.length = 0;
  glyphSel.value = 'braille';
  glyphSel.dispatchEvent({ type: 'change' });
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 160).length, 1, 'Glyph change must immediately stamp active visible card');
  ui.flushRaf(116);
  const partialCount = ui.drawCalls.filter(c => c.w === 160).length;
  assert(partialCount <= 7, `Partial glyph queue batch expected <= 7 draws (got ${partialCount})`);
  ui.drawCalls.length = 0;
  glyphSel.value = 'blocks';
  glyphSel.dispatchEvent({ type: 'change' });
  for (let k = 0; k < 12; k++) ui.flushRaf(116);
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 160).length, 50, 'Cancelling mid-queue and switching glyphs must re-stamp all 50 cards cleanly');
  const canvases = sr.querySelectorAll('.choice canvas');
  assert(canvases.length === 50 && canvases.every(c => c.dataset.previewKey === 'blocks'), 'All 50 preview canvases must carry final blocks previewKey');
}

{
  // Minor 1 & 2: single getBoundingClientRect on cache hit, and single document button query when topBar is absent
  const ui = createUiHarness(false);
  let rectReads = 0;
  ui.openIdeBtn.getBoundingClientRect = () => { rectReads++; return { ...ui.openIdeBtn._rect }; };
  ui.triggerMut([]);
  ui.flushTimers();
  assert.strictEqual(rectReads, 1, 'Cached triggerAnchor must read getBoundingClientRect once per layout tick');

  ui.topBar.remove();
  ui.openIdeBtn.remove();
  ui.queryLogs.length = 0;
  ui.triggerMut([]);
  ui.flushTimers();
  assert.strictEqual(ui.queryLogs.filter(s => s === 'button, a, [role="button"]').length, 1, 'Missing topBar must query document buttons once, not twice');
}

{
  // Minor 3: visibilitychange pauses/cancels queued previews while hidden and resumes remaining cards cleanly
  const ui = createUiHarness(false);
  ui.getHost().shadowRoot.querySelector('.trigger').dispatchEvent({ type: 'click' });
  ui.drawCalls.length = 0;
  ui.document.hidden = true;
  ui.fireDoc('visibilitychange');
  ui.flushRaf(116);
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 160).length, 0, 'Hidden window must cancel queued preview rAF batches');
  ui.document.hidden = false;
  ui.fireDoc('visibilitychange');
  for (let k = 0; k < 12; k++) ui.flushRaf(116);
  assert.strictEqual(ui.drawCalls.filter(c => c.w === 160).length, 49, 'Returning to visible must resume only remaining 49 unstamped preview cards');
}

const flushMicro = async () => { for (let i = 0; i < 32; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const p = new Promise((res, rej) => { resolve = res; reject = rej; }); return { p, resolve, reject }; };

async function runTrack2AsyncTests() {
  // Test 16 (Track 2 Task 1): quota serialization, abort/timeout, 401 retry, empty summary, offline UI, /quota, focus, timer cleanup
  {
    let step = 0, abortedCount = 0;
    const reqs = [];
    const ui = createUiHarness(false, {
      origin: 'https://127.0.0.1:43210',
      useElectron: true,
      fetch: (url, init = {}) => {
        if (init.signal) init.signal.addEventListener('abort', () => abortedCount++);
        if (url === '/') return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('"csrfToken":"tok1"') });
        if (step === 0) {
          if (url.includes('RetrieveUserQuotaSummary')) return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ response: { groups: [{ displayName: 'Gemini', buckets: [{ window: 'weekly', remainingFraction: 0.5, resetTime: '2026-11-12T00:00:00Z' }] }] } }) });
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ userStatus: { userTier: { name: 'Pro' } } }) });
        }
        const d = deferred();
        reqs.push({ step, url, init, d });
        return d.p;
      }
    });
    await flushMicro();
    const sr = ui.getHost().shadowRoot;
    assert(sr.querySelectorAll('.quota span').some(c => c.textContent === '50%'), 'Initial load must show 50% quota');

    // Start req batch #1 (hangs), then start req batch #2 before #1 finishes
    step = 1;
    sr.querySelector('.quota-refresh').dispatchEvent({ type: 'click' });
    await flushMicro();
    assert(ui.timers.some(t => t.ms === 8000), 'In-flight loadQuota must arm 8000ms AbortController timeout');

    step = 2;
    sr.querySelector('.quota-refresh').dispatchEvent({ type: 'click' });
    await flushMicro();
    assert(abortedCount >= 2, 'Overlapping loadQuota must abort superseded fetch signals');

    // Resolve batch #2 cleanly with 85%
    for (const r of reqs.filter(x => x.step === 2)) {
      if (r.url.includes('RetrieveUserQuotaSummary')) r.d.resolve({ ok: true, status: 200, json: () => Promise.resolve({ response: { groups: [{ displayName: 'Gemini', buckets: [{ window: 'weekly', remainingFraction: 0.85, resetTime: '2026-11-12T00:00:00Z' }] }] } }) });
      else r.d.resolve({ ok: true, status: 200, json: () => Promise.resolve({ userStatus: { userTier: { name: 'Pro' } } }) });
    }
    await flushMicro();
    // Now resolve stale batch #1 late with 500 error; must NOT overwrite #2's 85% or mark stale
    for (const r of reqs.filter(x => x.step === 1)) r.d.resolve({ ok: false, status: 500, json: () => Promise.resolve(null) });
    await flushMicro();
    assert(sr.querySelector('.quota').getAttribute('data-stale') === null, 'Stale error from superseded request #1 must not overwrite newer #2 quota');
    assert(!ui.timers.some(t => t.ms === 8000), 'Completed loadQuota must clear its 8000ms timeout');

    // Timeout test + onAgents 3s timer cleanup + dispose abort
    step = 3;
    const beforeAbort = abortedCount;
    sr.querySelector('.quota-refresh').dispatchEvent({ type: 'click' });
    await flushMicro();
    const t8k = ui.timers.find(t => t.ms === 8000);
    assert(t8k, 'Active request must schedule 8000ms timeout');
    t8k.cb();
    await flushMicro();
    assert(abortedCount > beforeAbort, 'Firing 8000ms timeout must abort active fetch signal');

    await ui.ipcRenderer.invoke('agent:update-active-count', 1);
    await ui.ipcRenderer.invoke('agent:update-active-count', 0);
    assert(ui.timers.some(t => t.ms === 3000), 'Agent completion must schedule tracked 3000ms quota retry timer');
    ui.window.__agyAsciiDispose();
    assert(!ui.timers.some(t => t.ms === 3000), 'dispose() must clear 3000ms agent quota retry timer');
  }

  {
    // Non-ok token fetch -> 0 RPCs; 401 -> token refresh & 1x retry -> empty summary preserves cached quota; refresh preserves focus
    let tokAttempt = 0, rpcCalls = 0, mode = 'tokenFail';
    const seenHeaders = [];
    const ui = createUiHarness(false, {
      origin: 'https://127.0.0.1:43210',
      useElectron: true,
      fetch: (url, init = {}) => {
        if (url === '/') {
          if (mode === 'tokenFail') return Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('"csrfToken":"bad"') });
          tokAttempt++;
          return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(`"csrfToken":"tok_${tokAttempt}"`) });
        }
        rpcCalls++;
        seenHeaders.push(init.headers['x-codeium-csrf-token']);
        if (mode === 'retry401' && init.headers['x-codeium-csrf-token'] === 'tok_1') {
          return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve(null) });
        }
        if (mode === 'emptySummary') {
          if (url.includes('RetrieveUserQuotaSummary')) return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ response: {} }) });
          return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve(null) });
        }
        if (url.includes('RetrieveUserQuotaSummary')) return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ response: { groups: [{ displayName: 'Gemini', buckets: [{ window: '5h', remainingFraction: 0.72, resetTime: '2026-11-12T00:00:00Z' }] }] } }) });
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ userStatus: { userTier: { name: 'Pro' } } }) });
      }
    });
    await flushMicro();
    const sr = ui.getHost().shadowRoot;
    assert.strictEqual(rpcCalls, 0, 'Non-ok token fetch must not send RPC requests with empty csrf header');
    assert.strictEqual(sr.querySelector('.quota').hidden, false, 'Initial quota failure must surface visible offline pill instead of hiding .quota');

    // /quota works even when quota.length === 0
    const comp = ui.makeEl('textarea'); comp.value = '/quota'; ui.sheet.append(comp);
    ui.fireDoc('keydown', { key: 'Enter', shiftKey: false, target: comp });
    assert.strictEqual(sr.querySelector('.quota-list').hidden, false, '/quota command must open quota panel even when quota is empty');

    mode = 'retry401';
    sr.querySelector('.quota-refresh').focus();
    sr.querySelector('.quota-refresh').dispatchEvent({ type: 'click' });
    await flushMicro();
    assert(seenHeaders.includes('tok_2'), '401 response must refresh csrfToken and retry RPC once');
    assert(sr.activeElement && sr.activeElement.classList.contains('quota-refresh'), 'Refreshing quota from keyboard must preserve focus on .quota-refresh');

    // Closing quota popup before in-flight refresh completes must not refocus hidden .quota-refresh
    sr.querySelector('.quota-refresh').focus();
    sr.querySelector('.quota-refresh').dispatchEvent({ type: 'click' });
    ui.fireDoc('pointerdown');
    assert.strictEqual(sr.querySelector('.quota-list').hidden, true, 'Outside pointerdown must close quota popover');
    await flushMicro();
    assert.strictEqual(sr.activeElement, null, 'Completed refresh must not steal focus onto hidden .quota-refresh');

    mode = 'emptySummary';
    sr.querySelector('.quota-refresh').dispatchEvent({ type: 'click' });
    await flushMicro();
    assert(sr.querySelector('.quota').getAttribute('data-stale') !== null, 'Empty RetrieveUserQuotaSummary + failed GetUserStatus must set offline state');
    assert(sr.querySelector('.quota-item') !== null, 'Empty summary + failed status must preserve previously cached quota rows');
  }

  // Test 17 (Track 2 Task 2): delayed originalChrome capture, Off-mode host palette, !full overlay, hover/artifact/bubble CSS
  {
    const ui = createUiHarness(false, {
      deferShell: true,
      initialPrefs: JSON.stringify({ theme: 'aurora', recolor: true }),
      getComputedStyle: el => ({
        getPropertyValue: k => el?.classList?.contains('agy-shell') ? (k === '--background' ? '#1e222a' : k === '--foreground' ? '#d8dee9' : '') : ''
      })
    });
    assert.strictEqual(ui.overlayCalls.length, 0, 'Delayed .agy-shell must not sample pre-shell body fallback chrome');
    ui.root.append(ui.shell);
    ui.triggerMut([ui.shell]);
    ui.flushTimers();
    assert.strictEqual(ui.overlayCalls.at(-1)?.color, '#00000000', 'Active theme mount must set transparent titlebar overlay');

    const sr = ui.getHost().shadowRoot;
    sr.querySelector('.reset').dispatchEvent({ type: 'click' });
    assert.deepStrictEqual(ui.overlayCalls.at(-1), { color: '#1e222a', symbolColor: '#d8dee9' }, 'Off mode must restore delayed .agy-shell chrome');
    assert.strictEqual(ui.getHost().style.colorScheme, 'dark', 'Dark host in Off mode must set dark colorScheme');
    const darkFg = ui.getHost().style.getPropertyValue('--aw-fg');
    const darkPanel = ui.getHost().style.getPropertyValue('--aw-panel');
    assert(darkFg && darkFg !== '#203645', 'Dark host in Off mode must not inherit clouds dark-on-light foreground');
    assert(darkPanel && darkPanel !== '#f1faff', 'Dark host in Off mode must not inherit clouds white panel');

    ui.darkExisting.setAttribute('class', 'light');
    sr.querySelector('[data-theme="aurora"]').dispatchEvent({ type: 'click' });
    sr.querySelector('.reset').dispatchEvent({ type: 'click' });
    assert.strictEqual(ui.getHost().style.colorScheme, 'light', 'Light host in Off mode must set light colorScheme');
    assert.notStrictEqual(ui.getHost().style.getPropertyValue('--aw-fg'), darkFg, 'Light host in Off mode must switch to light stock foreground');
    ui.window.__agyAsciiDispose();
  }

  {
    const uiNonFull = createUiHarness(false, { initialPrefs: JSON.stringify({ theme: 'clouds', recolor: false }) });
    assert.deepStrictEqual(uiNonFull.overlayCalls.at(-1), { color: '#00000000', symbolColor: '#203645' }, '!full glass header must request transparent titlebar overlay');
    const cssNonFull = uiNonFull.document.getElementById('agy-ascii-style').textContent;
    assert(!cssNonFull.includes('#fff!important'), '!full action hover must use theme fg instead of hardcoded #fff');
    assert(!cssNonFull.includes('rgba(255,255,255,0.07)!important'), '!full sidebar hover must derive tint from t.fg');
    assert(cssNonFull.includes('.agy-user-bubble{color:var(--foreground);text-shadow:none}'), '!full must reset .agy-user-bubble shadow');
    assert(!/\[class\*="artifact" i\]\{isolation:isolate;color:initial\}/.test(cssNonFull), 'Artifacts must not inherit color:initial under viewerReset');

    const uiFull = createUiHarness(false, { initialPrefs: JSON.stringify({ theme: 'clouds', recolor: true }) });
    const cssFull = uiFull.document.getElementById('agy-ascii-style').textContent;
    assert(!cssFull.includes('#fff!important'), 'full action hover must use theme fg instead of hardcoded #fff');
    assert(!cssFull.includes('rgba(255,255,255,0.07)!important'), 'full sidebar hover must derive tint from t.fg');
    assert(cssFull.includes('.agy-user-bubble{color:var(--foreground);text-shadow:none}'), 'full must also reset .agy-user-bubble shadow and color');
    assert(!/\[class\*="artifact" i\]\{isolation:isolate;color:initial\}/.test(cssFull), 'full artifacts must keep isolation without color:initial');
  }

  // Test 18 (Track 2 Task 3): popover mutual exclusion, Escape ordering, focus fallback, clamping, Ctrl+Alt+W stopPropagation, .save-error, subframe/start/bfcache guards, ripple origin
  {
    let saveGate = deferred();
    let failSave = true;
    const ui = createUiHarness(false, {
      origin: 'https://127.0.0.1:43210',
      useElectron: true,
      innerWidth: 360,
      savePrefs: () => (failSave ? Promise.reject(new Error('disk full')) : saveGate.p),
      fetch: url => {
        if (url === '/') return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('"csrfToken":"t1"') });
        if (url.includes('RetrieveUserQuotaSummary')) return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ response: { groups: [{ displayName: 'Gemini', buckets: [{ window: 'weekly', remainingFraction: 0.6, resetTime: '2026-11-12T00:00:00Z' }] }] } }) });
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ userStatus: { userTier: { name: 'Pro' } } }) });
      }
    });
    await flushMicro();
    const sr = ui.getHost().shadowRoot;
    const trigger = sr.querySelector('.trigger');
    const panel = sr.querySelector('.panel');
    const quotaChip = sr.querySelector('.quota');
    const qList = sr.querySelector('.quota-list');

    // Mutual exclusion between .panel and .quota-list
    trigger.dispatchEvent({ type: 'click' });
    assert.strictEqual(panel.hidden, false, 'Clicking .trigger must open .panel');
    quotaChip.dispatchEvent({ type: 'click' });
    assert.strictEqual(qList.hidden, false, 'Clicking .quota must open .quota-list');
    assert.strictEqual(panel.hidden, true, 'Opening .quota-list must close .panel');

    // Viewport clamping on narrow window (innerWidth = 360, minWidth = 300 -> right <= 52 so left >= 8)
    assert(360 - parseInt(qList.style.right, 10) >= 300, `Narrow viewport .quota-list right (${qList.style.right}) must keep left >= 8px`);

    // Opening .panel closes .quota-list
    trigger.dispatchEvent({ type: 'click' });
    assert.strictEqual(panel.hidden, false);
    assert.strictEqual(qList.hidden, true, 'Opening .panel must close .quota-list');

    // Escape closes quota popup first without closing an unhidden panel or focusing trigger
    qList.hidden = false;
    panel.hidden = false;
    ui.fireDoc('keydown', { key: 'Escape' });
    assert.strictEqual(qList.hidden, true, 'Escape must close visible .quota-list');
    assert.strictEqual(panel.hidden, false, 'Escape closing .quota-list must not simultaneously close .panel');
    assert.strictEqual(sr.activeElement, quotaChip, 'Escape closing .quota-list must focus .quota');
    ui.fireDoc('keydown', { key: 'Escape' });
    assert.strictEqual(panel.hidden, true, 'Second Escape must close .panel');

    // Hidden active card fallback focus -> first visible card, then .search when zero match
    const search = sr.querySelector('.search');
    search.value = 'sakura';
    search.dispatchEvent({ type: 'input' });
    trigger.dispatchEvent({ type: 'click' });
    assert.strictEqual(sr.activeElement, sr.querySelector('[data-theme="sakura"]'), 'Opening filtered panel when active theme is hidden must focus first visible card');
    trigger.dispatchEvent({ type: 'click' });
    search.value = 'zzzznonexistent';
    search.dispatchEvent({ type: 'input' });
    trigger.dispatchEvent({ type: 'click' });
    assert.strictEqual(sr.activeElement, search, 'Opening panel with zero visible cards must focus .search');

    // Ctrl+Alt+W stopPropagation
    let stopped = 0, prevented = 0;
    ui.fireDoc('keydown', { key: 'w', code: 'KeyW', ctrlKey: true, altKey: true, preventDefault() { prevented++; }, stopPropagation() { stopped++; } });
    assert(prevented === 1 && stopped === 1, 'Ctrl+Alt+W shortcut must call both preventDefault and stopPropagation');

    // Visible save-error banner shows on failure and clears on subsequent success; trigger surfaces error while panel is closed
    sr.querySelector('.close').dispatchEvent({ type: 'click' });
    sr.querySelector('[data-theme="aurora"]').dispatchEvent({ type: 'click' });
    await flushMicro();
    const saveErr = sr.querySelector('.save-error');
    assert(saveErr && saveErr.hidden === false && saveErr.textContent.length > 0, 'Save failure must reveal visible .save-error message');
    assert(trigger.getAttribute('data-save-error') !== null && /Could not save/i.test(trigger.title), 'Closed-panel save failure must surface cue on .trigger');
    failSave = false;
    saveGate.resolve(true);
    sr.querySelector('[data-theme="zen"]').dispatchEvent({ type: 'click' });
    await flushMicro();
    assert.strictEqual(saveErr.hidden, true, 'Successful save must hide .save-error banner');
    assert.strictEqual(trigger.getAttribute('data-save-error'), null, 'Successful save must clear .trigger error cue');
    ui.window.__agyAsciiDispose();
  }

  {
    // Nullable getSelection() during contenteditable /theme command must not throw
    const ceUi = createUiHarness(false, { getSelection: () => null });
    const ce = ceUi.makeEl('div');
    ce.setAttribute('contenteditable', 'true');
    ce.textContent = '/theme aurora';
    ceUi.sheet.append(ce);
    ceUi.fireDoc('keydown', { key: 'Enter', shiftKey: false, target: ce });
    assert.strictEqual(ceUi.document.body.dataset.awTheme, 'aurora', 'Contenteditable /theme must succeed even when getSelection() returns null');
    ceUi.window.__agyAsciiDispose();
  }

  {
    // Subframe guard: window.self !== window.top must abort installation immediately
    const sub = createUiHarness(false, { winSelf: { id: 'child' }, winTop: { id: 'top' } });
    assert.strictEqual(sub.getHost(), null, 'Subframe must not mount #agy-ascii-controls');
    assert.strictEqual(sub.window.__agyAsciiInstalled, undefined, 'Subframe must not set __agyAsciiInstalled');

    // Dispose before async native.get() resolves must prevent DOM/observer setup after await
    const slowPrefs = deferred();
    const early = createUiHarness(false, { useElectron: true, getPrefs: () => slowPrefs.p });
    early.window.__agyAsciiDispose();
    slowPrefs.resolve({ 'asciiWallpaperPreferences.v1': JSON.stringify({ theme: 'aurora' }) });
    await flushMicro();
    assert.strictEqual(early.getHost(), null, 'Dispose before native.get() resolves must skip DOM mount');
    assert.strictEqual(early.getObservers().hasMutCb, false, 'Dispose before native.get() resolves must skip MutationObserver');

    // Persisted pagehide/pageshow pauses and resumes; non-persisted pagehide disposes cleanly
    let bfFetches = 0;
    const bf = createUiHarness(false, {
      origin: 'https://127.0.0.1:43210',
      useElectron: true,
      initialPrefs: JSON.stringify({ theme: 'aurora', paused: false }),
      fetch: () => { bfFetches++; return Promise.reject(new Error('offline')); }
    });
    await flushMicro();
    assert(bf.getObservers().rafLen > 0, 'Active unpaused theme must schedule rAF');
    bf.fireWin('pagehide', { persisted: true });
    let obs = bf.getObservers();
    assert.strictEqual(obs.rafLen, 0, 'Persisted pagehide must cancel rAF');
    assert.strictEqual(obs.intervalLen, 0, 'Persisted pagehide must clear quota interval');
    assert(obs.mutDisconnects >= 1 && obs.resizeDisconnects >= 1, 'Persisted pagehide must disconnect observers');
    assert(bf.getHost() !== null, 'Persisted pagehide must keep host for bfcache restore');

    const beforeSuspendedClick = bfFetches;
    bf.getHost().shadowRoot.querySelector('.quota').dispatchEvent({ type: 'click' });
    await flushMicro();
    assert.strictEqual(bfFetches, beforeSuspendedClick, 'loadQuota() must bail while bfcache-suspended');

    // Detached shell replaced before pageshow must remount immediately onto new .agy-shell
    bf.shell.remove();
    const newShell = bf.makeEl('div');
    newShell.setAttribute('class', 'agy-shell');
    newShell._rect = { left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800 };
    const newSheet = bf.makeEl('div');
    newSheet.setAttribute('class', 'agy-sheet');
    newSheet._rect = { left: 0, top: 38, width: 1200, height: 762, right: 1200, bottom: 800 };
    newShell.append(newSheet);
    bf.root.append(newShell);

    bf.fireWin('pageshow', { persisted: true });
    obs = bf.getObservers();
    assert(obs.rafLen > 0, 'Persisted pageshow must resume rAF loop');
    assert(obs.intervalLen > 0, 'Persisted pageshow must restart quota interval');
    assert(newShell.querySelector('#agy-ascii-scene') !== null, 'Persisted pageshow after shell replacement must mount canvas onto new .agy-shell');

    bf.fireWin('pagehide', { persisted: false });
    assert.strictEqual(bf.getHost(), null, 'Non-persisted pagehide must dispose host DOM');
    assert.strictEqual(bf.window.__agyAsciiInstalled, false, 'Non-persisted pagehide must reset __agyAsciiInstalled');
  }

  {
    // Sentinel calm = { l: -1, r: -1, t: 38 } finish ripple must center on screen midpoint just like calm = null
    const fx = { energy: 0, pulse: 0.8, glyphs: 'ascii', scale: 'normal' };
    const hNull = createSceneHarness();
    hNull.startHash();
    hNull.drawFn(hNull.makeMainCtx(640, 360), 640, 360, themeById.aurora, 0, 1, null, fx);
    const expectedHash = hNull.endHash();

    const hSentinel = createSceneHarness();
    hSentinel.startHash();
    hSentinel.drawFn(hSentinel.makeMainCtx(640, 360), 640, 360, themeById.aurora, 0, 1, { l: -1, r: -1, t: 38 }, fx);
    assert.strictEqual(hSentinel.endHash(), expectedHash, 'Sentinel calm={l:-1,r:-1} finish ripple must center at midpoint matching calm=null');
  }

  // Test 19 (Track 3 Task 1): wallpapers-main.js sender/origin validation, JSON/theme allowlist, atomic mkdirSync/tmp cleanup, ASI safety
  {
    const mainSource = fs.readFileSync(path.join(rootDir, 'wallpapers-main.js'), 'utf8');
    const vm = require('vm');
    assert.doesNotThrow(() => new vm.Script('const tailWithoutSemi = 1\n' + mainSource), 'wallpapers-main.js must compile safely after a non-semicolon expression');

    const loadMainHarness = (userDir, fsOverride = fs) => {
      const handlers = {};
      const mockElectron = {
        app: { getPath: () => userDir },
        ipcMain: { handle: (ch, fn) => { handlers[ch] = fn; } }
      };
      const fakeReq = id => (id === 'electron' ? mockElectron : id === 'fs' ? fsOverride : id === 'path' ? path : require(id));
      new Function('require', mainSource)(fakeReq);
      return handlers;
    };

    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-main-'));
    try {
      const nestedUserDir = path.join(tmpRoot, 'nested', 'Antigravity');
      const handlers = loadMainHarness(nestedUserDir);
      const getFn = handlers['ascii-wallpapers:get'];
      const saveFn = handlers['ascii-wallpapers:save'];
      assert(typeof getFn === 'function' && typeof saveFn === 'function', 'Handlers must register cleanly');

      const mainFrameObj = { url: 'https://127.0.0.1:43210/workbench.html', parent: null };
      const goodEvent = { senderFrame: mainFrameObj, sender: { mainFrame: mainFrameObj, getType: () => 'window' } };
      const untrustedEvents = [
        {},
        { senderFrame: { url: 'https://127.0.0.1:43210/', parent: {} }, sender: { mainFrame: mainFrameObj } },
        { senderFrame: { url: 'https://127.0.0.1:43210/', parent: null }, sender: { mainFrame: {} } },
        { senderFrame: mainFrameObj, sender: { mainFrame: mainFrameObj, getType: () => 'webview' } },
        { senderFrame: { url: 'https://evil.example/', parent: null }, sender: { mainFrame: mainFrameObj } },
        { senderFrame: { url: 'http://127.0.0.1:43210/', parent: null }, sender: { mainFrame: mainFrameObj } }
      ];
      for (const ev of untrustedEvents) {
        assert.throws(() => getFn(ev), /Unsupported wallpaper origin/, 'get must reject untrusted frame/webview/origin');
        assert.throws(() => saveFn(ev, { 'asciiWallpaperPreferences.v1': '{}' }), /Unsupported wallpaper origin/, 'save must reject untrusted frame/webview/origin');
      }

      const validPayload = overrides => JSON.stringify({ theme: 'aurora', intensity: 80, paused: false, ...overrides });
      for (const badRaw of ['{bad', 'null', '[]', '123', validPayload({ theme: 'unknownfoo' }), validPayload({ intensity: 10 })]) {
        assert.throws(() => saveFn(goodEvent, { 'asciiWallpaperPreferences.v1': badRaw }), /Invalid wallpaper preferences/, `Must reject invalid prefs: ${badRaw}`);
      }

      assert.deepStrictEqual(getFn(goodEvent), {}, 'Initial get with missing userData dir must return empty object');
      saveFn(goodEvent, { 'asciiWallpaperPreferences.v1': validPayload({ theme: 'off' }) });
      const savedOff = getFn(goodEvent);
      assert(JSON.parse(savedOff['asciiWallpaperPreferences.v1']).theme === 'off', 'Valid off preference must persist across missing userData dir');
      saveFn(goodEvent, { 'asciiWallpaperPreferences.v1': validPayload({ theme: 'aurora', glyphs: 'braille', scale: 'fine' }) });
      assert.strictEqual(JSON.parse(getFn(goodEvent)['asciiWallpaperPreferences.v1']).theme, 'aurora');
      const entriesAfter = fs.readdirSync(nestedUserDir);
      assert.deepStrictEqual(entriesAfter, ['ascii-wallpapers-preferences.json'], 'No temporary files may remain after save');

      // Concurrent/failed renameSync cleanup & non-fixed temp file name
      const writtenTemps = [], unlinkedTemps = [];
      const failFs = {
        ...fs,
        mkdirSync: () => {},
        writeFileSync: (p) => { writtenTemps.push(p); },
        renameSync: () => { const e = new Error('locked'); e.code = 'EBUSY'; throw e; },
        unlinkSync: (p) => { unlinkedTemps.push(p); }
      };
      const failHandlers = loadMainHarness(nestedUserDir, failFs);
      assert.throws(() => failHandlers['ascii-wallpapers:save'](goodEvent, { 'asciiWallpaperPreferences.v1': validPayload() }), /locked/);
      assert.strictEqual(writtenTemps.length, 1);
      assert.notStrictEqual(writtenTemps[0], path.join(nestedUserDir, 'ascii-wallpapers-preferences.json.tmp'), 'Temp file must not use fixed single-path .tmp name');
      assert.deepStrictEqual(unlinkedTemps, writtenTemps, 'Failed renameSync must unlink temporary file');

      // Verify theme allowlist parity against ascii-wallpapers.js
      const expectedIds = new Set(['off', ...allThemes.map(t => t.id)]);
      const disallowedHit = [];
      for (const id of expectedIds) {
        try { saveFn(goodEvent, { 'asciiWallpaperPreferences.v1': validPayload({ theme: id }) }); } catch { disallowedHit.push(id); }
      }
      assert.deepStrictEqual(disallowedHit, [], 'All 50 scene IDs plus off must be allowed by wallpapers-main.js');
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  }

  const buildSyntheticAsar = (fileMap) => {
    const chunks = [];
    let offset = 0;
    const files = {};
    const ensureDir = parts => {
      let cur = files;
      for (const d of parts) { cur[d] ||= { files: {} }; cur = cur[d].files; }
      return cur;
    };
    for (const [rel, val] of Object.entries(fileMap)) {
      const parts = rel.split('/'), name = parts.pop(), dir = ensureDir(parts);
      if (val.unpacked) { dir[name] = { size: val.size || 0, unpacked: true }; continue; }
      if (val.link) { dir[name] = { size: 0, link: val.link }; continue; }
      const buf = Buffer.isBuffer(val.buf) ? val.buf : Buffer.from(val.buf || '');
      const bs = val.blockSize || 4194304, blocks = [];
      for (let i = 0; i < buf.length; i += bs) blocks.push(require('crypto').createHash('sha256').update(buf.subarray(i, i + bs)).digest('hex'));
      if (val.corruptBlock && blocks.length) blocks[0] = '0'.repeat(64);
      dir[name] = {
        size: buf.length,
        offset: String(offset),
        integrity: { algorithm: 'SHA256', hash: require('crypto').createHash('sha256').update(buf).digest('hex'), blockSize: bs, blocks }
      };
      offset += buf.length;
      chunks.push(buf);
    }
    const json = Buffer.from(JSON.stringify({ files }));
    const padded = Math.ceil((4 + json.length) / 4) * 4;
    const head = Buffer.alloc(4 + padded);
    head.writeUInt32LE(padded, 0);
    head.writeUInt32LE(json.length, 4);
    json.copy(head, 8);
    const size = Buffer.alloc(8);
    size.writeUInt32LE(4, 0);
    size.writeUInt32LE(head.length, 4);
    return Buffer.concat([size, head, ...chunks]);
  };

  // Test 20 (Track 3 Task 2): ASAR parse bounds, Chromium Pickle 4+padded header alignment, multi-block SHA-256 verify, ASI safety, fuse schema/multi-slice/streaming
  {
    const vm = require('vm');

    // 1. repack() pickle header exact 4+padded alignment, multi-block file, unpacked/link entries, ASI semicolon injection
    const rawAsar = buildSyntheticAsar({
      'package.json': { buf: JSON.stringify({ productName: 'Antigravity', version: '2.31.0', main: 'dist/main.js' }) },
      'dist/main.js': { buf: 'const electron = require("electron"); const x = 1' },
      'dist/preload.js': { buf: 'const electron_1 = require("electron"); const y = 2' },
      'dist/asset.bin': { buf: Buffer.alloc(64, 7), blockSize: 16 },
      'native/addon.node': { unpacked: true, size: 12 },
      'native/link.txt': { link: 'target.txt' }
    });
    const outAsar = installer.repack(rawAsar, '(()=>{})()', '(()=>{})()');
    const hdrTotal = outAsar.readUInt32LE(4), hdrPayload = outAsar.readUInt32LE(8), jsonLen = outAsar.readUInt32LE(12);
    assert.strictEqual(hdrTotal, hdrPayload + 4, 'ASAR header pickle total size must equal payload size + 4 (no extra 4-byte padding)');
    assert(hdrPayload - 4 - jsonLen >= 0 && hdrPayload - 4 - jsonLen < 4, 'Trailing header pickle alignment padding must be 0..3 bytes');

    const hdrJson = JSON.parse(outAsar.subarray(16, 16 + jsonLen).toString('utf8'));
    assert.strictEqual(hdrJson.files.native.files['addon.node'].unpacked, true, 'Unpacked entry must remain untouched');
    assert.strictEqual(hdrJson.files.native.files['link.txt'].link, 'target.txt', 'Symlink entry must remain untouched');
    assert.strictEqual(hdrJson.files.dist.files['asset.bin'].integrity.blocks.length, 4, 'Multi-block integrity array must stay intact');

    // Verify no-semicolon bundles still compile cleanly after repack() injection
    const dataStart = 8 + hdrTotal;
    const mainItem = hdrJson.files.dist.files['main.js'];
    const preloadItem = hdrJson.files.dist.files['preload.js'];
    const repackedMain = outAsar.subarray(dataStart + Number(mainItem.offset), dataStart + Number(mainItem.offset) + mainItem.size).toString('utf8');
    const repackedPreload = outAsar.subarray(dataStart + Number(preloadItem.offset), dataStart + Number(preloadItem.offset) + preloadItem.size).toString('utf8');
    assert.doesNotThrow(() => new vm.Script(repackedMain), 'Repacked main.js ending without semicolon must compile');
    assert.doesNotThrow(() => new vm.Script(repackedPreload), 'Repacked preload.js ending without semicolon must compile');

    // 2. parse() bounds checks
    assert(typeof installer.parse === 'function', 'parse() must be exported for validation testing');
    assert.throws(() => installer.parse(Buffer.from([4, 0, 0, 0])), /Unexpected ASAR format/, 'Short buffer (<16B) must throw Unexpected ASAR format');
    const trunc = Buffer.from(outAsar.subarray(0, 20));
    assert.throws(() => installer.parse(trunc), /Unexpected ASAR format/, 'Truncated ASAR past dataStart must throw Unexpected ASAR format');

    // 3. asarIntegrityFuse() schema check, bounds check, multi-slice Mach-O scan, and real >4MB streaming scan
    const sentinel = Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX');
    const sliceOff = makeFuseBuffer('00000');
    const sliceOn = makeFuseBuffer('00001');
    const badSchema = Buffer.concat([sentinel, Buffer.from([2, 5]), Buffer.from('00000')]);
    const oobLen = Buffer.concat([sentinel, Buffer.from([1, 99]), Buffer.from('00000')]);

    const prevRead = fs.readFileSync, prevExists = fs.existsSync, prevPlat = process.platform;
    try {
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
      fs.existsSync = () => true;
      fs.readFileSync = () => badSchema;
      assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Fuse wire with schemaVersion !== 1 must return unknown');
      fs.readFileSync = () => oobLen;
      assert.strictEqual(installer.asarIntegrityFuse(), 'unknown', 'Fuse wire with out-of-bounds length must return unknown');
      fs.readFileSync = () => Buffer.concat([sliceOff, Buffer.from('FAT_ARCH_GAP'), sliceOn]);
      assert.strictEqual(installer.asarIntegrityFuse(), 'on', 'Multi-slice binary with fuse enabled in second slice must return on');
    } finally {
      Object.defineProperty(process, 'platform', { value: prevPlat, configurable: true });
      fs.existsSync = prevExists;
      fs.readFileSync = prevRead;
    }

    // Real > 5MB file crossing 4MB chunk boundary without calling fs.readFileSync
    const streamRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-fuse-'));
    try {
      const appDir = path.join(streamRoot, 'app');
      fs.mkdirSync(appDir, { recursive: true });
      const exePath = path.join(appDir, process.platform === 'win32' ? 'Antigravity.exe' : 'antigravity');
      const chunkBoundary = 4 * 1024 * 1024 - 16;
      const bigBuf = Buffer.alloc(5 * 1024 * 1024, 0x90);
      sliceOff.copy(bigBuf, chunkBoundary);
      fs.writeFileSync(exePath, bigBuf);

      const savedRead = fs.readFileSync;
      let readFileCalls = 0;
      fs.readFileSync = (...args) => { readFileCalls++; return savedRead(...args); };
      try {
        assert.strictEqual(installer.asarIntegrityFuse(appDir), 'off', 'Large binary fuse crossing 4MB chunk boundary must resolve off');
        assert.strictEqual(readFileCalls, 0, 'Large real binary fuse scan must stream chunks instead of calling fs.readFileSync');
      } finally {
        fs.readFileSync = savedRead;
      }
    } finally {
      fs.rmSync(streamRoot, { recursive: true, force: true });
    }
  }

  // Test 21 (Track 3 Task 3): dynamic resolveArchive, EISDIR guard, full main() install/update/uninstall/corrupt-receipt/rollback, install.bat
  {
    const buildAppTree = (baseDir, ver = '2.31.1') => {
      const resDir = path.join(baseDir, 'resources');
      fs.mkdirSync(resDir, { recursive: true });
      const fileMap = {
        'package.json': JSON.stringify({ productName: 'Antigravity', version: ver, main: 'dist/main.js' }),
        'dist/main.js': 'const { app } = require("electron");',
        'dist/preload.js': 'const electron_1 = require("electron"); const x = "electronNativeAPI \'agent:update-active-count\'";'
      };
      const chunks = []; let offset = 0; const files = {};
      for (const [rel, text] of Object.entries(fileMap)) {
        const parts = rel.split('/'), name = parts.pop();
        let cur = files; for (const d of parts) { cur[d] ||= { files: {} }; cur = cur[d].files; }
        const buf = Buffer.from(text, 'utf8');
        cur[name] = { size: buf.length, offset: String(offset), integrity: { algorithm: 'SHA256', hash: require('crypto').createHash('sha256').update(buf).digest('hex'), blockSize: 4194304, blocks: [require('crypto').createHash('sha256').update(buf).digest('hex')] } };
        offset += buf.length; chunks.push(buf);
      }
      const json = Buffer.from(JSON.stringify({ files }));
      const padded = Math.ceil((4 + json.length) / 4) * 4;
      const head = Buffer.alloc(4 + padded);
      head.writeUInt32LE(padded, 0); head.writeUInt32LE(json.length, 4); json.copy(head, 8);
      const size = Buffer.alloc(8); size.writeUInt32LE(4, 0); size.writeUInt32LE(head.length, 4);
      const asarPath = path.join(resDir, 'app.asar');
      fs.writeFileSync(asarPath, Buffer.concat([size, head, ...chunks]));
      const exeName = process.platform === 'darwin' ? path.join('Frameworks', 'Electron Framework.framework', 'Electron Framework') : process.platform === 'win32' ? 'Antigravity.exe' : 'antigravity';
      const exePath = path.join(baseDir, exeName);
      fs.mkdirSync(path.dirname(exePath), { recursive: true });
      fs.writeFileSync(exePath, makeFuseBuffer('00000'));
      return asarPath;
    };

    const tmpApp = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-main-cli-'));
    const savedArgv = [...process.argv], savedAsar = process.env.ANTIGRAVITY_ASAR, savedApp = process.env.ANTIGRAVITY_APP_PATH;
    const savedLog = console.log, savedWarn = console.warn;
    try {
      // 1. Existing empty directory must NOT trigger EISDIR
      const emptyDir = path.join(tmpApp, 'empty-dir');
      fs.mkdirSync(emptyDir, { recursive: true });
      process.argv = ['node', 'manage-wallpapers.cjs', 'status', emptyDir];
      const resolvedEmpty = installer.resolveArchive();
      assert.notStrictEqual(resolvedEmpty, emptyDir, 'resolveArchive must not return raw empty directory');
      assert.throws(() => installer.main(), /Antigravity was not found at/, 'main() on directory without app.asar must report not found rather than EISDIR');

      // 2. Dynamic ANTIGRAVITY_APP_PATH / ProgramFiles resolution after require()
      const pfRoot = path.join(tmpApp, 'ProgramFiles');
      const appOne = path.join(pfRoot, 'Antigravity');
      const asarPath = buildAppTree(appOne, '2.31.1');
      process.argv = ['node', 'manage-wallpapers.cjs', 'status'];
      delete process.env.ANTIGRAVITY_ASAR;
      process.env.ANTIGRAVITY_APP_PATH = appOne;
      assert.strictEqual(installer.resolveArchive(), asarPath, 'resolveArchive must resolve ANTIGRAVITY_APP_PATH app directory dynamically');
      delete process.env.ANTIGRAVITY_APP_PATH;
      process.env.ANTIGRAVITY_ASAR = asarPath;
      assert.strictEqual(installer.resolveArchive(), asarPath, 'resolveArchive must resolve ANTIGRAVITY_ASAR dynamically');
      delete process.env.ANTIGRAVITY_ASAR;

      const origPf = process.env.ProgramFiles, origLocal = process.env.LOCALAPPDATA, origPlat = process.platform;
      try {
        Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
        process.env.LOCALAPPDATA = path.join(tmpApp, 'NoLocal');
        process.env.ProgramFiles = pfRoot;
        assert.strictEqual(installer.resolveArchive(), asarPath, 'Windows resolveArchive must check %ProgramFiles% dynamically');
      } finally {
        Object.defineProperty(process, 'platform', { value: origPlat, configurable: true });
        if (origPf === undefined) delete process.env.ProgramFiles; else process.env.ProgramFiles = origPf;
        if (origLocal === undefined) delete process.env.LOCALAPPDATA; else process.env.LOCALAPPDATA = origLocal;
      }

      // 3. Full lifecycle: status -> verify -> install -> idempotent install -> app update rotation -> uninstall -> corrupt receipt
      console.log = () => {}; console.warn = () => {};
      const origBytes = fs.readFileSync(asarPath);
      process.argv = ['node', 'manage-wallpapers.cjs', 'status', appOne];
      installer.main();
      process.argv = ['node', 'manage-wallpapers.cjs', 'verify', appOne];
      installer.main();
      assert(Buffer.compare(fs.readFileSync(asarPath), origBytes) === 0, 'verify must not alter app.asar');

      process.argv = ['node', 'manage-wallpapers.cjs', 'install', appOne];
      installer.main();
      const backupPath = asarPath + '.ascii-wallpapers.backup';
      const receiptPath = asarPath + '.ascii-wallpapers.json';
      assert(fs.existsSync(backupPath) && Buffer.compare(fs.readFileSync(backupPath), origBytes) === 0, 'install must write exact backup');
      assert(fs.existsSync(receiptPath) && JSON.parse(fs.readFileSync(receiptPath, 'utf8')).version === '2.31.1', 'install must write version receipt');

      const patchedBytes = fs.readFileSync(asarPath);
      installer.main(); // idempotent repeat
      assert(Buffer.compare(fs.readFileSync(asarPath), patchedBytes) === 0, 'Repeated install must remain idempotent');

      // Simulated Antigravity update -> backup rotation keeps old build backup beside new one
      const updatedAsar = buildAppTree(appOne, '2.32.0');
      const v2Orig = fs.readFileSync(updatedAsar);
      installer.main();
      const oldBackups = fs.readdirSync(path.dirname(asarPath)).filter(f => f.startsWith('app.asar.ascii-wallpapers.backup.2.31.1-'));
      assert.strictEqual(oldBackups.length, 1, 'Updating app must archive previous version backup');
      assert(Buffer.compare(fs.readFileSync(backupPath), v2Orig) === 0, 'Active backup must hold 2.32.0 original bytes');

      process.argv = ['node', 'manage-wallpapers.cjs', 'uninstall', appOne];
      installer.main();
      assert(Buffer.compare(fs.readFileSync(asarPath), v2Orig) === 0, 'uninstall must restore original 2.32.0 archive');

      // Corrupt receipt must produce clean actionable error instead of raw SyntaxError
      fs.writeFileSync(receiptPath, '{bad json', 'utf8');
      process.argv = ['node', 'manage-wallpapers.cjs', 'status', appOne];
      assert.throws(() => installer.main(), /Corrupt wallpaper receipt/, 'Malformed receipt must throw actionable error');
      fs.unlinkSync(receiptPath);
      fs.unlinkSync(backupPath);
      oldBackups.forEach(f => fs.unlinkSync(path.join(path.dirname(asarPath), f)));

      // 4. Transactional rollback when swap fails (EBUSY) or receipt write fails (EACCES)
      process.argv = ['node', 'manage-wallpapers.cjs', 'install', appOne];
      installer.main(); // clean install of v2Orig
      const v3Asar = buildAppTree(appOne, '2.33.0');
      const v3Orig = fs.readFileSync(v3Asar);
      const realRename = fs.renameSync;
      fs.renameSync = (a, b) => { if (b === asarPath) { const e = new Error('busy'); e.code = 'EBUSY'; throw e; } return realRename(a, b); };
      try {
        assert.throws(() => installer.main(), /in use/);
      } finally {
        fs.renameSync = realRename;
      }
      assert(Buffer.compare(fs.readFileSync(backupPath), v2Orig) === 0, 'Failed swap must roll back previous backup cleanly');
      assert(Buffer.compare(fs.readFileSync(asarPath), v3Orig) === 0, 'Failed swap must leave archive untouched');

      const realWrite = fs.writeFileSync;
      fs.writeFileSync = (p, ...rest) => { if (String(p).startsWith(receiptPath)) { const e = new Error('denied'); e.code = 'EACCES'; throw e; } return realWrite(p, ...rest); };
      try {
        assert.throws(() => installer.main(), /Permission denied writing to/);
      } finally {
        fs.writeFileSync = realWrite;
      }
      assert(Buffer.compare(fs.readFileSync(asarPath), v3Orig) === 0, 'Failed receipt write must restore archive to pre-swap original');
      assert(Buffer.compare(fs.readFileSync(backupPath), v2Orig) === 0, 'Failed receipt write must roll back backup state');

      // Two same-millisecond receipt writes must produce distinct nonce-suffixed tmp names
      const seenReceiptTmps = [];
      const savedNow = Date.now;
      Date.now = () => 1700000000000;
      fs.writeFileSync = (p, ...rest) => {
        if (String(p).includes('.ascii-wallpapers.json.tmp.')) seenReceiptTmps.push(String(p));
        return realWrite(p, ...rest);
      };
      try {
        buildAppTree(appOne, '2.34.0');
        fs.unlinkSync(receiptPath);
        fs.unlinkSync(backupPath);
        process.argv = ['node', 'manage-wallpapers.cjs', 'install', appOne];
        installer.main();
        fs.writeFileSync(asarPath, fs.readFileSync(backupPath));
        fs.unlinkSync(receiptPath);
        fs.unlinkSync(backupPath);
        installer.main();
      } finally {
        Date.now = savedNow;
        fs.writeFileSync = realWrite;
      }
      assert.strictEqual(seenReceiptTmps.length, 2, 'Should record two receipt tmp writes');
      assert(seenReceiptTmps.every(t => /\.tmp\.\d+\.1700000000000\.[a-z0-9]+$/.test(t)), 'writeAtomic tmp file must append random nonce');
      assert.notStrictEqual(seenReceiptTmps[0], seenReceiptTmps[1], 'Same-ms writeAtomic tmp filenames must not collide');
    } finally {
      console.log = savedLog; console.warn = savedWarn;
      process.argv = savedArgv;
      if (savedAsar === undefined) delete process.env.ANTIGRAVITY_ASAR; else process.env.ANTIGRAVITY_ASAR = savedAsar;
      if (savedApp === undefined) delete process.env.ANTIGRAVITY_APP_PATH; else process.env.ANTIGRAVITY_APP_PATH = savedApp;
      fs.rmSync(tmpApp, { recursive: true, force: true });
    }

    // 5. install.bat hardening checks
    const bat = fs.readFileSync(path.join(rootDir, 'install.bat'), 'utf8');
    assert(bat.includes('node manage-wallpapers.cjs install %*'), 'install.bat must forward CLI arguments via %*');
    assert(/taskkill\s+\/im\s+Antigravity\.exe/i.test(bat) && /taskkill\s+\/f\s+\/im\s+Antigravity\.exe/i.test(bat), 'install.bat must attempt graceful close before taskkill /f');
    assert(/if\s+exist\s+/i.test(bat), 'install.bat must check if exist before launching Antigravity.exe');
    assert(/%ANTIGRAVITY_APP_PATH:"=%/i.test(bat), 'install.bat must strip quotes from ANTIGRAVITY_APP_PATH before exist check');
  }

  // Test 22 (Track 4): Docs accuracy, CSP hardening, and corrupt multi-block ASAR rejection
  {
    const themesExpr = asciiSource.match(/const themes=\[[\s\S]*?\];/);
    assert(themesExpr, 'themes array must exist in ascii-wallpapers.js');
    const themesList = new Function(`${themesExpr[0]} return themes;`)();
    const totalThemes = themesList.length;
    const lightThemes = themesList.filter((t) => t.light).length;
    const darkThemes = totalThemes - lightThemes;

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const readmeMd = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');

    assert(!/\b23\b/.test(indexHtml), 'index.html must not contain stale 23 theme count');
    assert(!/9\s+light|14\s+dark/i.test(indexHtml), 'index.html must not contain stale 9 light / 14 dark counts');
    assert(!/No network requests\./i.test(indexHtml), 'index.html must accurately describe local 127.0.0.1 quota polling');
    assert(indexHtml.includes(`${totalThemes}`), `index.html must document ${totalThemes} themes`);
    assert(new RegExp(`${lightThemes}\\s+light,\\s*${darkThemes}\\s+dark`).test(indexHtml), `index.html must document ${lightThemes} light, ${darkThemes} dark`);
    assert(indexHtml.includes('/quota'), 'index.html must document /quota');
    assert(indexHtml.includes('127.0.0.1'), 'index.html must describe local 127.0.0.1 quota requests');
    const reqMatches = indexHtml.match(/Node\.js<\/a>\s*18\+/g) || [];
    assert.strictEqual(reqMatches.length, 1, 'index.html Requirements paragraph must not be duplicated');
    assert(/Linux[\s\S]*Windows[\s\S]*macOS|Linux,\s*macOS,\s*or\s*Windows/i.test(indexHtml), 'index.html must list Linux, macOS, and Windows');

    const cspMatch = indexHtml.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    assert(cspMatch, 'index.html must include a Content-Security-Policy meta tag');
    assert(cspMatch[1].includes("script-src 'none'"), 'index.html CSP must enforce script-src none');
    assert(cspMatch[1].includes("object-src 'none'"), 'index.html CSP must enforce object-src none');
    assert(cspMatch[1].includes("base-uri 'none'"), 'index.html CSP must enforce base-uri none');
    const fontsLink = indexHtml.match(/<link[^>]*href=["']https:\/\/fonts\.googleapis\.com\/css2[^"']*["'][^>]*>/i);
    assert(fontsLink, 'index.html must contain the Google Fonts stylesheet link');
    assert(/\bcrossorigin\b/i.test(fontsLink[0]), 'Google Fonts link must include crossorigin');
    assert(/referrerpolicy=["']no-referrer["']/i.test(fontsLink[0]), 'Google Fonts link must include referrerpolicy="no-referrer"');
    assert(!/\bintegrity=/i.test(fontsLink[0]), 'Google Fonts link must not hardcode fragile SRI integrity');

    assert(readmeMd.includes(`${totalThemes}`), `README.md must state ${totalThemes} themes`);
    assert(new RegExp(`${lightThemes}\\s+light\\s+and\\s+${darkThemes}\\s+dark`).test(readmeMd), `README.md must state ${lightThemes} light and ${darkThemes} dark`);
    for (const theme of themesList) {
      assert(readmeMd.includes(theme.name), `README.md must list theme name ${theme.name}`);
    }
    assert(readmeMd.includes('/quota'), 'README.md must document /quota');
    assert(/## Requirements[\s\S]*Linux[\s\S]*%ProgramFiles%[\s\S]*## Install/i.test(readmeMd), 'README.md Requirements must list Linux and %ProgramFiles%');
    assert(readmeMd.includes('ANTIGRAVITY_APP_PATH'), 'README.md must document ANTIGRAVITY_APP_PATH');
    assert(readmeMd.includes('install.bat'), 'README.md must mention install.bat for Windows');

    // Corrupt multi-block integrity.blocks[0] (even with intact whole-file hash) must abort repack
    const corruptMultiBlock = buildSyntheticAsar({
      'package.json': { buf: JSON.stringify({ productName: 'Antigravity', version: '2.31.0', main: 'dist/main.js' }) },
      'dist/main.js': { buf: 'const electron = require("electron");' },
      'dist/preload.js': { buf: 'console.log("ok");' },
      'dist/asset.bin': { buf: Buffer.alloc(100, 0xaa), blockSize: 32, corruptBlock: true }
    });
    assert.throws(
      () => installer.repack(corruptMultiBlock, '(()=>{})()', '(()=>{})()'),
      /verification failed/i,
      'repack() must reject corrupted multi-block integrity.blocks entry'
    );
  }

  console.log('Tests passed.');
}

runTrack2AsyncTests().catch(err => { console.error(err); process.exit(1); });
