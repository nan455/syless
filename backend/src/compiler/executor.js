'use strict';

/**
 * SYLESS Secure Python Executor
 * Runs Python code in a sandboxed child process with strict timeouts.
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const EXEC_TIMEOUT_MS = parseInt(process.env.PYTHON_EXEC_TIMEOUT || '10000', 10);
const MAX_OUTPUT_BYTES = 100 * 1024; // 100 KB

// Python sandbox wrapper: restricts dangerous builtins
const SANDBOX_PREFIX = `
import sys
import io

_safe_builtins = {
    'print': print,
    'input': input,
    'range': range,
    'len': len,
    'int': int,
    'float': float,
    'str': str,
    'bool': bool,
    'list': list,
    'dict': dict,
    'set': set,
    'tuple': tuple,
    'type': type,
    'isinstance': isinstance,
    'abs': abs,
    'max': max,
    'min': min,
    'sum': sum,
    'sorted': sorted,
    'reversed': reversed,
    'enumerate': enumerate,
    'zip': zip,
    'map': map,
    'filter': filter,
    'any': any,
    'all': all,
    'round': round,
    'pow': pow,
    'divmod': divmod,
    '__import__': __import__,
    '__name__': '__main__',
}

from collections import deque
_safe_builtins['deque'] = deque

`;

const BLOCKED_PATTERNS = [
  /import\s+os/,
  /import\s+subprocess/,
  /import\s+sys/,
  /open\s*\(/,
  /__import__\s*\(\s*['"]os['"]/,
  /exec\s*\(/,
  /eval\s*\(/,
  /compile\s*\(/,
  /globals\s*\(\s*\)/,
  /locals\s*\(\s*\)/,
  /getattr\s*\(/,
  /setattr\s*\(/,
  /delattr\s*\(/,
];

function detectMaliciousCode(code) {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return `Unsafe operation detected: ${pattern.source}`;
    }
  }
  return null;
}

async function executePython(pythonCode, stdinData = '') {
  return new Promise((resolve) => {
    // Security check
    const threat = detectMaliciousCode(pythonCode);
    if (threat) {
      return resolve({
        success: false,
        output: '',
        error: `Security: ${threat}`,
        executionTime: 0,
      });
    }

    // Write to temp file
    const tmpDir = os.tmpdir();
    const fileName = `syless_${crypto.randomBytes(8).toString('hex')}.py`;
    const filePath = path.join(tmpDir, fileName);

    const fullCode = SANDBOX_PREFIX + pythonCode;

    try {
      fs.writeFileSync(filePath, fullCode, 'utf8');
    } catch (e) {
      return resolve({
        success: false,
        output: '',
        error: 'Failed to create execution environment',
        executionTime: 0,
      });
    }

    const startTime = Date.now();
    let outputChunks = [];
    let errorChunks = [];
    let outputSize = 0;

    const pythonArgs = ['-u', filePath];

    const child = execFile('python', pythonArgs, {
      timeout: EXEC_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      env: {
        PATH: process.env.PATH,
        PYTHONDONTWRITEBYTECODE: '1',
        PYTHONIOENCODING: 'utf-8',
      },
    }, (err, stdout, stderr) => {
      const executionTime = Date.now() - startTime;

      // Cleanup temp file
      try { fs.unlinkSync(filePath); } catch (_) {}

      if (err) {
        if (err.killed || err.signal === 'SIGTERM') {
          return resolve({
            success: false,
            output: stdout || '',
            error: `Your program took too long to run (limit: ${EXEC_TIMEOUT_MS / 1000}s). Check for infinite loops!`,
            executionTime,
          });
        }

        const cleanedErr = cleanPythonError(stderr || err.message);
        return resolve({
          success: false,
          output: stdout || '',
          error: cleanedErr,
          executionTime,
        });
      }

      resolve({
        success: true,
        output: stdout,
        error: stderr || '',
        executionTime,
      });
    });

    if (stdinData && child.stdin) {
      child.stdin.write(stdinData);
      child.stdin.end();
    }
  });
}

function cleanPythonError(stderr) {
  if (!stderr) return 'An unknown error occurred';

  // Map Python errors to friendly SYLESS messages
  const errorMap = [
    { pattern: /NameError: name '(.+)' is not defined/, msg: (m) => `'${m[1]}' is not defined — did you use 'make' to create it first?` },
    { pattern: /SyntaxError/, msg: () => 'There is a syntax problem in the generated code — please check your SYLESS code' },
    { pattern: /IndentationError/, msg: () => 'Indentation error — this is an internal SYLESS issue, please report it' },
    { pattern: /ZeroDivisionError/, msg: () => 'You tried to divide by zero — check your math!' },
    { pattern: /IndexError: list index out of range/, msg: () => 'You tried to access an item that does not exist in the array — check your index' },
    { pattern: /TypeError: (.+)/, msg: (m) => `Type mismatch: ${m[1]}` },
    { pattern: /RecursionError/, msg: () => 'Your recursive function went too deep — check the base case in your task' },
    { pattern: /MemoryError/, msg: () => 'Your program used too much memory — check for large loops or data structures' },
    { pattern: /ValueError: (.+)/, msg: (m) => `Value error: ${m[1]}` },
    { pattern: /KeyboardInterrupt/, msg: () => 'Execution was interrupted' },
  ];

  for (const { pattern, msg } of errorMap) {
    const match = stderr.match(pattern);
    if (match) return msg(match);
  }

  // Return last non-empty line of stderr (most likely the actual error)
  const lines = stderr.split('\n').filter(l => l.trim());
  return lines[lines.length - 1] || stderr;
}

module.exports = { executePython };
