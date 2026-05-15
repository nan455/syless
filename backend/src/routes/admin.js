'use strict';

const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');
const { User, Problem, Submission } = require('../models/index');
const { protect, requireRole } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [totalUsers, totalProblems, proUsers, totalSubmissions] = await Promise.all([
    User.count({ where: { is_active: true } }),
    Problem.count({ where: { is_active: true } }),
    User.count({ where: { subscription_plan: { [Op.in]: ['pro', 'enterprise'] } } }),
    Submission.count(),
  ]);

  const recentUsers = await User.findAll({
    order: [['created_at', 'DESC']],
    limit: 10,
    attributes: ['id', 'username', 'email', 'role', 'created_at', 'subscription_plan'],
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProblems,
      proUsers,
      freeUsers: totalUsers - proUsers,
      totalSubmissions,
    },
    recentUsers,
  });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const where = {};

  if (search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email:    { [Op.like]: `%${search}%` } },
    ];
  }
  if (role) where.role = role;

  const { rows: users, count: total } = await User.findAndCountAll({
    where,
    order:  [['created_at', 'DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({ success: true, users, total });
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  const { role, is_active, subscription_plan } = req.body;
  const updates = {};
  if (role !== undefined)              updates.role              = role;
  if (is_active !== undefined)         updates.is_active         = is_active;
  if (subscription_plan !== undefined) updates.subscription_plan = subscription_plan;

  const [updated] = await User.update(updates, { where: { id: req.params.id } });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

  const user = await User.findByPk(req.params.id);
  res.json({ success: true, user });
});

// DELETE /api/admin/users/:id  — soft delete
router.delete('/users/:id', async (req, res) => {
  await User.update({ is_active: false }, { where: { id: req.params.id } });
  res.json({ success: true, message: 'User deactivated' });
});

// GET /api/admin/problems
router.get('/problems', async (req, res) => {
  const problems = await Problem.findAll({
    order: [['order_num', 'ASC']],
  });
  res.json({ success: true, problems });
});

// POST /api/admin/problems
router.post('/problems', async (req, res) => {
  const problem = await Problem.create({
    ...req.body,
    created_by: req.user.id,
  });
  res.status(201).json({ success: true, problem });
});

// PUT /api/admin/problems/:id
router.put('/problems/:id', async (req, res) => {
  const [updated] = await Problem.update(req.body, { where: { id: req.params.id } });
  if (!updated) return res.status(404).json({ success: false, message: 'Problem not found' });
  const problem = await Problem.findByPk(req.params.id);
  res.json({ success: true, problem });
});

// DELETE /api/admin/problems/:id  — soft delete
router.delete('/problems/:id', async (req, res) => {
  await Problem.update({ is_active: false }, { where: { id: req.params.id } });
  res.json({ success: true, message: 'Problem deactivated' });
});

// GET /api/admin/submissions
router.get('/submissions', async (req, res) => {
  const submissions = await Submission.findAll({
    include: [
      { model: User,    attributes: ['username'] },
      { model: Problem, attributes: ['title', 'slug'] },
    ],
    order: [['created_at', 'DESC']],
    limit: 50,
  });
  res.json({ success: true, submissions });
});

module.exports = router;
