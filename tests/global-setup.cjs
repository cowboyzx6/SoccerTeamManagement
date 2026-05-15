const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8000;
const HOST = '127.0.0.1';
const STATE_PATH = path.join(ROOT, 'test-results', 'server-state.json');
const URL = `http://${HOST}:${PORT}`;

function isServerReady() {
  return new Promise(resolve => {
    const req = http.get(URL, res => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await isServerReady()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${URL}`);
}

module.exports = async () => {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

  if (await isServerReady()) {
    fs.writeFileSync(STATE_PATH, JSON.stringify({ started: false }), 'utf8');
    return;
  }

  const child = spawn(process.execPath, ['scripts/test-server.js'], {
    cwd: ROOT,
    stdio: 'ignore',
    windowsHide: true,
  });

  child.unref();
  fs.writeFileSync(STATE_PATH, JSON.stringify({ started: true, pid: child.pid }), 'utf8');
  await waitForServer();
};
