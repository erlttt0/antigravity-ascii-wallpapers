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
  process.argv = originalArgv;
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
  process.argv = originalArgv;
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
const appearanceMatch = asciiSource.match(/function appearance\([^)]*\)\s*\{([\s\S]*?)\n\s*function apply/);
assert(appearanceMatch, 'appearance() function must exist in ascii-wallpapers.js');
const appearanceBody = appearanceMatch[1];
const resetMatches = appearanceBody.match(/\$\{viewerReset\}/g) || [];
assert(
  appearanceBody.includes('viewerReset') && resetMatches.length >= 2,
  'viewerReset must be included in both the wallpaper-only and full recolor stylesheet branches'
);

// Test 7: Verify Antigravity 2.30.0+ inset container transparency rules in ascii-wallpapers.js
const insetSelector = '.agy-sheet[data-sheet-inset] [data-main-content-body]';
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
  appearanceBody.includes('padding-right:76px') || appearanceBody.includes('padding-right: 76px'),
  'appearance() must allocate padding-right for floating actions to prevent text collision'
);

console.log('Tests passed.');
