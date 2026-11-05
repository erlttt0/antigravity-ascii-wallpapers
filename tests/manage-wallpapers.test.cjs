// tests/manage-wallpapers.test.cjs
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('Running installer unit tests...');

// Test 1: Verify uninstall alias exists in help / error handling
try {
  execSync('node manage-wallpapers.cjs invalid-action', { stdio: 'pipe' });
  assert.fail('Should have failed for invalid action');
} catch (e) {
  const err = e.stderr.toString();
  assert(err.includes('uninstall'), 'Error message must list uninstall as valid action');
}

console.log('Tests passed.');
