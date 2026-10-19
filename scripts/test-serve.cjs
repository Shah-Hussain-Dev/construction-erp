const { spawn } = require('node:child_process');
const { copyFileSync, mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const dir = mkdtempSync(join(tmpdir(), 'civil-e2e-'));
const file = join(dir, 'db.json');
copyFileSync('mocks/data/seed.json', file);
const data = spawn(process.execPath, ['mocks/server.cjs'], {
  stdio: 'inherit',
  env: { ...process.env, MOCK_DB_FILE: file, MOCK_PORT: '3101' },
});
const web = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    process.env.E2E_PRODUCTION ? 'start' : 'dev',
    '--port',
    '3100',
    '--hostname',
    '127.0.0.1',
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      JSON_SERVER_URL: 'http://127.0.0.1:3101',
      NEXT_DIST_DIR: process.env.E2E_PRODUCTION ? '.next' : '.next-e2e',
    },
  },
);
function close() {
  data.kill();
  web.kill();
  rmSync(dir, { recursive: true, force: true });
  process.exit();
}
process.on('SIGTERM', close);
process.on('SIGINT', close);
