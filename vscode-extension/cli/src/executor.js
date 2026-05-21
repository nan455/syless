'use strict';

const { spawn }  = require('child_process');
const fs         = require('fs');
const path       = require('path');
const os         = require('os');
const crypto     = require('crypto');

const TIMEOUT_MS  = 30000;
const PYTHON_EXE  = process.platform === 'win32' ? 'python' : 'python3';

async function executePython(pythonCode) {
  return new Promise((resolve) => {
    const filePath = path.join(os.tmpdir(), `syless_${crypto.randomBytes(8).toString('hex')}.py`);

    try {
      fs.writeFileSync(filePath, pythonCode, 'utf8');
    } catch (e) {
      return resolve({ success: false, error: 'Could not write temp file', executionTime: 0 });
    }

    const startTime = Date.now();
    let timer;

    // stdio: inherit passes the real terminal stdin/stdout so `ask` (input()) works interactively
    const child = spawn(PYTHON_EXE, ['-u', filePath], {
      stdio: ['inherit', 'inherit', 'pipe'],
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONIOENCODING: 'utf-8' },
    });

    let stderrBuf = '';
    child.stderr.on('data', d => { stderrBuf += d.toString(); });

    timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, TIMEOUT_MS);

    child.on('error', (e) => {
      clearTimeout(timer);
      try { fs.unlinkSync(filePath); } catch (_) {}
      if (e.code === 'ENOENT') {
        resolve({
          success: false,
          error: `Python not found. Install it from https://python.org then try again.`,
          executionTime: Date.now() - startTime,
        });
      } else {
        resolve({ success: false, error: e.message, executionTime: Date.now() - startTime });
      }
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      try { fs.unlinkSync(filePath); } catch (_) {}
      const executionTime = Date.now() - startTime;

      if (signal === 'SIGTERM') {
        return resolve({
          success: false,
          error: `Timed out after ${TIMEOUT_MS / 1000}s — check for infinite loops`,
          executionTime,
        });
      }

      resolve({
        success: code === 0,
        error: code !== 0 ? cleanError(stderrBuf) : '',
        executionTime,
      });
    });
  });
}

function cleanError(stderr) {
  if (!stderr) return 'Program exited with an error';
  const map = [
    { re: /NameError: name '(.+)' is not defined/, fn: (m) => `'${m[1]}' is not defined — did you use 'make' to create it first?` },
    { re: /ZeroDivisionError/,    fn: () => 'Division by zero — check your math!' },
    { re: /RecursionError/,       fn: () => 'Recursion too deep — check the base case in your task' },
    { re: /IndexError/,           fn: () => 'Index out of range — the array is smaller than you think' },
    { re: /TypeError: (.+)/,      fn: (m) => `Type mismatch: ${m[1]}` },
    { re: /ValueError: (.+)/,     fn: (m) => `Value error: ${m[1]}` },
  ];
  for (const { re, fn } of map) {
    const m = stderr.match(re);
    if (m) return fn(m);
  }
  const lines = stderr.split('\n').filter(l => l.trim());
  return lines[lines.length - 1] || stderr;
}

module.exports = { executePython };
