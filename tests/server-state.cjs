const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'test-results', 'server-state.json');

function readServerState() {
  if (!fs.existsSync(STATE_PATH)) return null;

  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function clearServerState() {
  fs.rmSync(STATE_PATH, { force: true });
}

function stopManagedServer(state) {
  if (!state?.started || !state.pid) return;

  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/PID', String(state.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(state.pid, 'SIGTERM');
    }
  } catch {
    // The server may already be gone if Playwright was interrupted.
  }
}

module.exports = {
  ROOT,
  STATE_PATH,
  readServerState,
  clearServerState,
  stopManagedServer,
};
