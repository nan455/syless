'use strict';

const express    = require('express');
const router     = express.Router();
const { protect, recalcLevel } = require('../middleware/auth');
const { User, UserProgress } = require('../models/index');
const { compile }       = require('../compiler/index');
const { executePython } = require('../compiler/executor');
const MODULES = require('../data/modules');

// GET /api/learn/modules  — public, returns module list (no theory/test content)
router.get('/modules', async (req, res) => {
  const { level } = req.query; // 'beginner' | 'intermediate' | undefined (all)
  const list = level ? MODULES.filter(m => m.level === level) : MODULES;
  // Strip out exercise testCases for the list view
  const safe = list.map(({ exercise, theory, ...m }) => ({
    ...m,
    exerciseTitle: exercise.title,
    exerciseDesc:  exercise.description,
  }));
  res.json({ success: true, modules: safe });
});

// GET /api/learn/modules/:slug  — full module including theory + starter code
router.get('/modules/:slug', (req, res) => {
  const mod = MODULES.find(m => m.slug === req.params.slug);
  if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });
  // Strip testCases (never sent to client)
  const { exercise: { testCases, ...exerciseSafe }, ...rest } = mod;
  res.json({ success: true, module: { ...rest, exercise: exerciseSafe } });
});

// GET /api/learn/progress  — user's completed modules + XP
router.get('/progress', protect, async (req, res) => {
  const rows = await UserProgress.findAll({ where: { user_id: req.user.id } });
  res.json({ success: true, progress: rows });
});

// POST /api/learn/submit/:slug
router.post('/submit/:slug', protect, async (req, res) => {
  const { code } = req.body;
  const mod = MODULES.find(m => m.slug === req.params.slug);
  if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });
  if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

  // Find or create progress record
  const [progress] = await UserProgress.findOrCreate({
    where: { user_id: req.user.id, module_id: mod.id },
    defaults: { attempts: 0 },
  });
  await progress.increment('attempts');

  // Compile
  const compileResult = compile(code);
  if (!compileResult.success) {
    return res.json({
      success: false, verdict: 'Compile Error',
      error: compileResult.error, passed: 0, total: mod.exercise.testCases.length,
    });
  }

  // Run each test case
  const testCases = mod.exercise.testCases;
  let allPassed = true;
  const results = [];

  for (const tc of testCases) {
    const exec = await executePython(compileResult.pythonCode, tc.input || '');
    const actual   = (exec.output || '').trim();
    const expected = (tc.expectedOutput || '').trim();
    const passed   = actual === expected;
    if (!passed) allPassed = false;
    results.push({ passed, expected, actual, executionTime: exec.executionTime });
  }

  // Award XP only on first completion
  let xpEarned = 0;
  if (allPassed && !progress.completed) {
    xpEarned = mod.xp;
    await progress.update({
      completed: true,
      score: 100,
      best_code: code,
      completed_at: new Date(),
    });
    await User.increment({ stats_xp: xpEarned, stats_problems_solved: 1 }, { where: { id: req.user.id } });
    await recalcLevel(req.user.id);
  } else if (allPassed && progress.completed) {
    // Already completed — update best code but no extra XP
    await progress.update({ best_code: code });
  }

  res.json({
    success: true,
    verdict:   allPassed ? 'Accepted' : 'Wrong Answer',
    passed:    results.filter(r => r.passed).length,
    total:     results.length,
    results,
    xpEarned,
    alreadyCompleted: allPassed && progress.completed && xpEarned === 0,
  });
});

// PUT /api/learn/level  — save user's chosen learning level in preferences
router.put('/level', protect, async (req, res) => {
  const { level } = req.body;
  if (!['beginner', 'intermediate', 'all'].includes(level)) {
    return res.status(400).json({ success: false, message: 'Invalid level' });
  }
  const prefs = { ...(req.user.preferences || {}), learning_level: level };
  await req.user.update({ preferences: prefs });
  res.json({ success: true, user: req.user.toSafeJSON() });
});

module.exports = router;
