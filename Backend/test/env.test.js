import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const envModulePath = pathToFileURL(path.resolve(process.cwd(), 'src/config/env.js')).href;

test('env config should not crash when JWT_SECRET is missing', () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'backend-env-test-'));

  try {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import('${envModulePath}').then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); })`], {
      cwd: tempDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: '',
      },
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
