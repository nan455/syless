'use strict';

const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');
const { Problem, User, Submission } = require('../models/index');
const { protect } = require('../middleware/auth');
const { compile }       = require('../compiler/index');
const { executePython } = require('../compiler/executor');

// GET /api/dsa/problems
router.get('/problems', async (req, res) => {
  const { category, difficulty, page = 1, limit = 20, search } = req.query;

  const where = { is_active: true };
  if (category)   where.category   = category;
  if (difficulty) where.difficulty  = difficulty;
  if (search)     where.title = { [Op.like]: `%${search}%` };

  const { rows: problems, count: total } = await Problem.findAndCountAll({
    where,
    order: [['order_num', 'ASC'], ['created_at', 'ASC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    success: true,
    problems,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// GET /api/dsa/problems/:slug
router.get('/problems/:slug', async (req, res) => {
  const problem = await Problem.scope('withSolution').findOne({
    where: { slug: req.params.slug, is_active: true },
  });
  if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
  res.json({ success: true, problem });
});

// POST /api/dsa/submit
router.post('/submit', protect, async (req, res) => {
  const { problemSlug, code } = req.body;
  if (!problemSlug || !code) {
    return res.status(400).json({ success: false, message: 'problemSlug and code required' });
  }

  const problem = await Problem.scope('withSolution').findOne({
    where: { slug: problemSlug, is_active: true },
  });
  if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

  // Step 1: Compile
  const compileResult = compile(code);
  if (!compileResult.success) {
    return res.json({
      success: false,
      verdict: 'Compile Error',
      error: compileResult.error,
      passed: 0,
      total: (problem.test_cases || []).length,
    });
  }

  // Step 2: Run each test case
  const testCases = problem.test_cases || [];
  const results   = [];
  let allPassed   = true;

  for (const tc of testCases) {
    const execResult   = await executePython(compileResult.pythonCode, tc.input || '');
    const actualOutput = (execResult.output || '').trim();
    const expected     = (tc.expectedOutput || '').trim();
    const passed       = actualOutput === expected;

    if (!passed) allPassed = false;

    results.push({
      passed,
      input:    tc.isHidden ? '[hidden]' : (tc.input || ''),
      expected: tc.isHidden ? '[hidden]' : expected,
      actual:   tc.isHidden ? (passed ? '✓ Correct' : '✗ Wrong') : actualOutput,
      executionTime: execResult.executionTime,
    });
  }

  // Step 3: Update stats
  const xpGain = getDifficultyXP(problem.difficulty);
  await problem.recordSubmission(allPassed);

  if (allPassed) {
    await User.increment(
      { stats_problems_solved: 1, stats_total_runs: 1, stats_xp: xpGain },
      { where: { id: req.user.id } }
    );
  } else {
    await User.increment({ stats_total_runs: 1 }, { where: { id: req.user.id } });
  }

  // Step 4: Save submission record
  await Submission.create({
    user_id:        req.user.id,
    problem_id:     problem.id,
    code,
    verdict:        allPassed ? 'Accepted' : 'Wrong Answer',
    passed:         results.filter(r => r.passed).length,
    total:          results.length,
    execution_time: results[0]?.executionTime || 0,
    python_code:    compileResult.pythonCode,
  });

  res.json({
    success: true,
    verdict:     allPassed ? 'Accepted' : 'Wrong Answer',
    passed:      results.filter(r => r.passed).length,
    total:       results.length,
    results,
    pythonCode:  compileResult.pythonCode,
    xpEarned:    allPassed ? xpGain : 0,
  });
});

// GET /api/dsa/leaderboard
router.get('/leaderboard', async (req, res) => {
  const users = await User.findAll({
    where:      { is_active: true },
    attributes: ['id', 'username', 'avatar', 'stats_xp', 'stats_level', 'stats_problems_solved'],
    order:      [['stats_xp', 'DESC']],
    limit:      50,
  });
  res.json({ success: true, leaderboard: users });
});

// GET /api/dsa/categories
router.get('/categories', (_req, res) => {
  res.json({
    success: true,
    categories: [
      { id: 'basics',     name: 'Basics',              icon: '📚', description: 'Variables, I/O, conditions' },
      { id: 'arrays',     name: 'Arrays',              icon: '🔢', description: 'Array operations & traversal' },
      { id: 'strings',    name: 'Strings',             icon: '🔤', description: 'String manipulation' },
      { id: 'stack',      name: 'Stack',               icon: '📦', description: 'LIFO data structure' },
      { id: 'queue',      name: 'Queue',               icon: '🚶', description: 'FIFO data structure' },
      { id: 'linkedlist', name: 'Linked List',         icon: '🔗', description: 'Pointer-based lists' },
      { id: 'tree',       name: 'Trees',               icon: '🌳', description: 'Binary trees & traversal' },
      { id: 'graph',      name: 'Graphs',              icon: '🕸️', description: 'BFS, DFS & paths' },
      { id: 'sorting',    name: 'Sorting',             icon: '📊', description: 'Sorting algorithms' },
      { id: 'searching',  name: 'Searching',           icon: '🔍', description: 'Binary search & more' },
      { id: 'recursion',  name: 'Recursion',           icon: '🔄', description: 'Recursive thinking' },
      { id: 'dp',         name: 'Dynamic Programming', icon: '⚡', description: 'Optimization problems' },
    ],
  });
});

// GET /api/dsa/my-submissions
router.get('/my-submissions', protect, async (req, res) => {
  const submissions = await Submission.findAll({
    where:   { user_id: req.user.id },
    include: [{ model: Problem, attributes: ['title', 'slug', 'difficulty'] }],
    order:   [['created_at', 'DESC']],
    limit:   20,
  });
  res.json({ success: true, submissions });
});

function getDifficultyXP(difficulty) {
  return { beginner: 10, easy: 25, medium: 60, hard: 120, expert: 250 }[difficulty] ?? 25;
}

module.exports = router;
