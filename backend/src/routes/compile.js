'use strict';

const express = require('express');
const router = express.Router();
const { compile } = require('../compiler/index');
const { executePython } = require('../compiler/executor');
const { optionalAuth, recalcLevel } = require('../middleware/auth');
const { User } = require('../models/index');

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
router.post('/run', optionalAuth, async (req, res) => {
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

  // Step 3: Track stats if user is logged in
  let xpEarned = 0;
  if (req.user) {
    xpEarned = execResult.success ? 2 : 0;
    const inc = { stats_total_runs: 1 };
    if (xpEarned) inc.stats_xp = xpEarned;
    await User.increment(inc, { where: { id: req.user.id } });
    if (xpEarned) await recalcLevel(req.user.id);
  }

  res.json({
    success: execResult.success,
    output: execResult.output,
    error: execResult.error,
    pythonCode: compileResult.pythonCode,
    executionTime: execResult.executionTime,
    xpEarned,
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
