'use strict';

const express = require('express');
const router  = express.Router();
const { User, Snippet } = require('../models/index');
const { generateToken, protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check duplicate
  const exists = await User.findOne({
    where: { email: email.toLowerCase() },
    attributes: ['id', 'email'],
  });
  const existsUsername = await User.findOne({ where: { username } });

  if (exists)         return res.status(409).json({ success: false, message: 'Email already registered' });
  if (existsUsername) return res.status(409).json({ success: false, message: 'Username already taken' });

  const user  = await User.create({ username, email, password });
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'Account created! Welcome to SYLESS.',
    token,
    user: user.toSafeJSON(),
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Include password for comparison (override default scope)
  const user = await User.scope('withPassword').findOne({
    where: { email: email.toLowerCase() },
  });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated' });
  }

  user.last_login = new Date();
  await user.save({ hooks: false }); // skip bcrypt re-hash hook

  const token = generateToken(user.id);
  res.json({
    success: true,
    message: 'Welcome back!',
    token,
    user: user.toSafeJSON(),
  });
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

// PUT /api/auth/profile  — update bio, avatar, preferences
router.put('/profile', protect, async (req, res) => {
  const allowed = ['bio', 'avatar', 'preferences'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  await req.user.update(updates);
  res.json({ success: true, user: req.user.toSafeJSON() });
});

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both passwords required' });
  }

  const user = await User.scope('withPassword').findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  user.password = newPassword;
  await user.save(); // triggers bcrypt hook

  res.json({ success: true, message: 'Password updated successfully' });
});

// GET /api/auth/snippets
router.get('/snippets', protect, async (req, res) => {
  const snippets = await Snippet.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']],
    limit: 50,
  });
  res.json({ success: true, snippets });
});

// POST /api/auth/snippets
router.post('/snippets', protect, async (req, res) => {
  const { title, code, language = 'syless' } = req.body;
  if (!title || !code) {
    return res.status(400).json({ success: false, message: 'Title and code required' });
  }
  const snippet = await Snippet.create({ user_id: req.user.id, title, code, language });
  res.status(201).json({ success: true, snippet });
});

// DELETE /api/auth/snippets/:id
router.delete('/snippets/:id', protect, async (req, res) => {
  const deleted = await Snippet.destroy({
    where: { id: req.params.id, user_id: req.user.id },
  });
  if (!deleted) return res.status(404).json({ success: false, message: 'Snippet not found' });
  res.json({ success: true, message: 'Snippet deleted' });
});

module.exports = router;
