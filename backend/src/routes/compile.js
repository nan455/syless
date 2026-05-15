'use strict';

const express = require('express');
const router = express.Router();
const { compile } = require('../compiler/index');
const { executePython } = require('../compiler/executor');

// POST /api/compile
// Compile SYLESS source to Python
router.post('/', async (req, res) => {
  const { code, stdin = '' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Please provide some SYLESS code to compile',
    });
  }

  if (code.length > 50000) {
    return res.status(400).json({
      success: false,
      error: 'Code too large — maximum 50,000 characters',
    });
  }

  const compileResult = compile(code);

  if (!compileResult.success) {
    return res.status(400).json({
      success: false,
      phase: compileResult.phase,
      error: compileResult.error,
      line: compileResult.line,
    });
  }

  res.json({
    success: true,
    pythonCode: compileResult.pythonCode,
    ast: compileResult.ast,
  });
});

// POST /api/compile/run
// Compile + Execute SYLESS code
router.post('/run', async (req, res) => {
  const { code, stdin = '' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Please provide some SYLESS code to run',
    });
  }

  if (code.length > 50000) {
    return res.status(400).json({
      success: false,
      error: 'Code too large — maximum 50,000 characters',
    });
  }

  // Step 1: Compile
  const compileResult = compile(code);
  if (!compileResult.success) {
    return res.status(400).json({
      success: false,
      phase: compileResult.phase,
      error: compileResult.error,
      line: compileResult.line,
      pythonCode: null,
    });
  }

  // Step 2: Execute
  const execResult = await executePython(compileResult.pythonCode, stdin);

  res.json({
    success: execResult.success,
    output: execResult.output,
    error: execResult.error,
    pythonCode: compileResult.pythonCode,
    executionTime: execResult.executionTime,
  });
});

// POST /api/compile/ast
// Return only the AST (for educational visualization)
router.post('/ast', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'No code provided' });

  const result = compile(code);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  res.json({ success: true, ast: result.ast, tokens: result.tokens });
});

module.exports = router;
