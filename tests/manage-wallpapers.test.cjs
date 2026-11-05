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
} finally {
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  process.argv = originalArgv;
  fs.writeFileSync = originalWrite;
  fs.unlinkSync = originalUnlink;
}

console.log('Tests passed.');
