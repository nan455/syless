#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const { compile }       = require('../src/compiler/index');
const { executePython } = require('../src/executor');

const VERSION = '1.0.0';

const C = {
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  reset:  '\x1b[0m',
};

function log(msg)  { process.stdout.write(msg + '\n'); }
function err(msg)  { process.stderr.write(msg + '\n'); }

function help() {
  log(`
${C.bold}${C.cyan}SYLESS v${VERSION}${C.reset} — Code Like You Think

${C.bold}Usage:${C.reset}
  ${C.cyan}syless run${C.reset} <file.sy>       Compile and run a .sy file
  ${C.cyan}syless compile${C.reset} <file.sy>   Print the generated Python code
  ${C.cyan}syless version${C.reset}             Show version
  ${C.cyan}syless help${C.reset}                Show this help

${C.bold}Example:${C.reset}
  syless run hello.sy
  syless hello.sy

${C.bold}Language quick-ref:${C.reset}
  make x = 10
  say -> "Hello!"
  check x > 5 { say -> "Big" }
  loop 3 times { say -> "Hi" }
  task greet(name) { say -> name }
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

async function main() {
  const [cmd, arg] = process.argv.slice(2);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    help(); return;
  }
  if (cmd === 'version' || cmd === '--version' || cmd === '-v') {
    log(`syless v${VERSION}`); return;
  }
  if (cmd === 'run') {
    if (!arg) { err(`${C.red}Usage: syless run <file.sy>${C.reset}`); process.exit(1); }
    await cmdRun(arg); return;
  }
  if (cmd === 'compile') {
    if (!arg) { err(`${C.red}Usage: syless compile <file.sy>${C.reset}`); process.exit(1); }
    await cmdCompile(arg); return;
  }
  // Allow: syless hello.sy  (shorthand for run)
  if (cmd.endsWith('.sy') || cmd.endsWith('.syless')) {
    await cmdRun(cmd); return;
  }

  err(`${C.red}Unknown command: ${cmd}${C.reset}`);
  err(`Run ${C.cyan}syless help${C.reset} for usage.`);
  process.exit(1);
}

main().catch(e => {
  process.stderr.write(`${C.red}Unexpected error: ${e.message}${C.reset}\n`);
  process.exit(1);
});
