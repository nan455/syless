#!/usr/bin/env node
'use strict';

const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const readline = require('readline');
const { spawn }         = require('child_process');
const { compile }       = require('../src/compiler/index');
const { executePython } = require('../src/executor');

const VERSION    = '1.1.0';
const PYTHON_EXE = process.platform === 'win32' ? 'python' : 'python3';

const C = {
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  reset:  '\x1b[0m',
};

function log(msg) { process.stdout.write(msg + '\n'); }
function err(msg) { process.stderr.write(msg + '\n'); }

function help() {
  log(`
${C.bold}${C.cyan}SYLESS v${VERSION}${C.reset} — Code Like You Think

${C.bold}Usage:${C.reset}
  ${C.cyan}syless run${C.reset} <file.sy>       Compile and run a .sy file
  ${C.cyan}syless compile${C.reset} <file.sy>   Print the generated Python code
  ${C.cyan}syless repl${C.reset}                Start an interactive REPL
  ${C.cyan}syless version${C.reset}             Show version
  ${C.cyan}syless help${C.reset}                Show this help

${C.bold}Example:${C.reset}
  syless run hello.sy
  syless hello.sy
  syless repl

${C.bold}Language quick-ref:${C.reset}
  make x = 10
  show "Hello!"         # or: say -> "Hello!"
  check x > 5 { show "Big" } otherwise { show "Small" }
  loop 3 times { show "Hi" }
  task greet(name) { say -> "Hi " + name }
  x += 1
  show length of "hello"
`);
}

function readFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    err(`${C.red}Error: file not found — ${filePath}${C.reset}`);
    process.exit(1);
  }
  return { abs, source: fs.readFileSync(abs, 'utf8') };
}

function compileOrExit(source) {
  const result = compile(source);
  if (!result.success) {
    err(`\n${C.red}${C.bold}Compile Error${C.reset} ${C.dim}(${result.phase})${C.reset}`);
    err(`${C.red}  ${result.error}${C.reset}\n`);
    process.exit(1);
  }
  return result;
}

async function cmdRun(filePath) {
  const { abs, source } = readFile(filePath);
  const result = compileOrExit(source);
  log(`${C.dim}▶  ${path.basename(abs)}${C.reset}\n`);
  const exec = await executePython(result.pythonCode);
  if (!exec.success) {
    err(`\n${C.red}${C.bold}Runtime Error:${C.reset}`);
    err(`${C.red}  ${exec.error}${C.reset}`);
    process.exit(1);
  }
  log(`\n${C.dim}✓ done in ${exec.executionTime}ms${C.reset}`);
}

async function cmdCompile(filePath) {
  const { abs, source } = readFile(filePath);
  const result = compileOrExit(source);
  log(`${C.dim}# Python generated from ${path.basename(abs)}${C.reset}\n`);
  log(result.pythonCode);
}

// ---------------------------------------------------------------------------
// REPL — persistent Python kernel with shared global state
// ---------------------------------------------------------------------------

// The kernel reads SYLESS-compiled Python code line-by-line until it sees
// __SYLESS_EXEC__, executes it in a shared globals() dict, then prints
// __SYLESS_DONE__ so the Node side knows output is complete.
const REPL_KERNEL = `
import sys
_g = {}
buf = []
for line in sys.stdin:
    line = line.rstrip('\\n')
    if line == '__SYLESS_EXEC__':
        code = '\\n'.join(buf)
        buf = []
        if code.strip():
            try:
                exec(code, _g)
            except Exception as e:
                print('Error:', e)
        sys.stdout.write('__SYLESS_DONE__\\n')
        sys.stdout.flush()
    else:
        buf.append(line)
`.trim();

async function cmdRepl() {
  log(`${C.bold}${C.cyan}SYLESS REPL v${VERSION}${C.reset}  ${C.dim}(type 'exit' to quit)${C.reset}`);
  log(`${C.dim}Tip: show x  |  make x = 5  |  x += 1  |  task greet(n) { ... }${C.reset}\n`);

  // Write kernel to a temp file
  const kernelPath = path.join(os.tmpdir(), `syless_kernel_${process.pid}.py`);
  fs.writeFileSync(kernelPath, REPL_KERNEL, 'utf8');

  const kernel = spawn(PYTHON_EXE, [kernelPath], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  kernel.on('error', e => {
    if (e.code === 'ENOENT') {
      err(`${C.red}Python not found. Install it from https://python.org${C.reset}`);
    } else {
      err(`${C.red}Kernel error: ${e.message}${C.reset}`);
    }
    try { fs.unlinkSync(kernelPath); } catch (_) {}
    process.exit(1);
  });

  let outBuf  = '';
  let waitRes = null;

  kernel.stdout.on('data', chunk => {
    outBuf += chunk.toString();
    const idx = outBuf.indexOf('__SYLESS_DONE__\n');
    if (idx !== -1 && waitRes) {
      const output = outBuf.slice(0, idx);
      outBuf = outBuf.slice(idx + '__SYLESS_DONE__\n'.length);
      const resolve = waitRes;
      waitRes = null;
      resolve(output);
    }
  });

  function execInKernel(pythonCode) {
    return new Promise(resolve => {
      waitRes = resolve;
      for (const line of pythonCode.split('\n')) {
        kernel.stdin.write(line + '\n');
      }
      kernel.stdin.write('__SYLESS_EXEC__\n');
    });
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let braceDepth = 0;
  let inputBuf   = [];

  function prompt() {
    const indicator = braceDepth > 0
      ? `${C.yellow}...${C.reset} `
      : `${C.cyan}>${C.reset} `;
    rl.question(indicator, async line => {
      const trimmed = line.trim();

      if (trimmed === 'exit' || trimmed === 'quit') {
        kernel.stdin.end();
        rl.close();
        try { fs.unlinkSync(kernelPath); } catch (_) {}
        log(`\n${C.dim}Bye!${C.reset}`);
        return;
      }

      if (trimmed === '') { prompt(); return; }

      inputBuf.push(line);
      braceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      // Execute when block is complete (no unclosed braces)
      if (braceDepth <= 0) {
        braceDepth = 0;
        const source = inputBuf.join('\n');
        inputBuf = [];

        const result = compile(source);
        if (!result.success) {
          err(`${C.red}  ${result.error}${C.reset}`);
        } else {
          const output = await execInKernel(result.pythonCode);
          if (output.trim()) log(output.trimEnd());
        }
      }

      prompt();
    });
  }

  rl.on('close', () => {
    kernel.stdin.end();
    try { fs.unlinkSync(kernelPath); } catch (_) {}
  });

  prompt();
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
async function main() {
  const [cmd, arg] = process.argv.slice(2);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') { help(); return; }
  if (cmd === 'version' || cmd === '--version' || cmd === '-v')   { log(`syless v${VERSION}`); return; }
  if (cmd === 'repl')    { await cmdRepl(); return; }
  if (cmd === 'run')     { if (!arg) { err(`${C.red}Usage: syless run <file.sy>${C.reset}`); process.exit(1); } await cmdRun(arg); return; }
  if (cmd === 'compile') { if (!arg) { err(`${C.red}Usage: syless compile <file.sy>${C.reset}`); process.exit(1); } await cmdCompile(arg); return; }
  if (cmd.endsWith('.sy') || cmd.endsWith('.syless')) { await cmdRun(cmd); return; }

  err(`${C.red}Unknown command: ${cmd}${C.reset}`);
  err(`Run ${C.cyan}syless help${C.reset} for usage.`);
  process.exit(1);
}

main().catch(e => {
  process.stderr.write(`${C.red}Unexpected error: ${e.message}${C.reset}\n`);
  process.exit(1);
});
