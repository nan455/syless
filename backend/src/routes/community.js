'use strict';

const express = require('express');
const { CommunityPost, PostLike, User } = require('../models/index');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_TAGS = [
  'basics', 'loops', 'functions', 'arrays', 'sorting', 'searching',
  'recursion', 'DSA', 'stack', 'queue', 'tree', 'graph', 'math', 'strings', 'patterns',
];

// GET /api/community — list posts (public, paginated)
router.get('/', optionalAuth, async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const sort  = req.query.sort === 'popular' ? 'popular' : 'new';
  const limit = 12;
  const offset = (page - 1) * limit;

  const order = sort === 'popular'
    ? [['likes_count', 'DESC'], ['created_at', 'DESC']]
    : [['created_at', 'DESC']];

  const { rows: posts, count } = await CommunityPost.findAndCountAll({
    include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
    order,
    limit,
    offset,
  });

  let likedSet = new Set();
  if (req.user && posts.length) {
    const likes = await PostLike.findAll({
      where: { user_id: req.user.id, post_id: posts.map(p => p.id) },
      attributes: ['post_id'],
    });
    likedSet = new Set(likes.map(l => l.post_id));
  }

  res.json({
    success: true,
    posts: posts.map(p => ({ ...p.toJSON(), liked: likedSet.has(p.id) })),
    total: count,
    page,
    pages: Math.ceil(count / limit),
  });
});

// POST /api/community — create post (auth required)
router.post('/', protect, async (req, res) => {
  const { title, description = '', code, tags = [] } = req.body;

  if (!title?.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
  if (!code?.trim())  return res.status(400).json({ success: false, error: 'Code is required' });
  if (title.length > 200)   return res.status(400).json({ success: false, error: 'Title too long (max 200 chars)' });
  if (code.length > 10000)  return res.status(400).json({ success: false, error: 'Code too long (max 10,000 chars)' });

  const safeTags = (Array.isArray(tags) ? tags : [])
    .filter(t => VALID_TAGS.includes(t))
    .slice(0, 5);

  const post = await CommunityPost.create({
    user_id: req.user.id,
    title: title.trim(),
    description: description.trim().slice(0, 500),
    code: code.trim(),
    tags: safeTags,
  });

  const full = await CommunityPost.findByPk(post.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
  });

  res.status(201).json({ success: true, post: { ...full.toJSON(), liked: false } });
});

// POST /api/community/:id/like — toggle like (auth required)
router.post('/:id/like', protect, async (req, res) => {
  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

  const existing = await PostLike.findOne({ where: { post_id: post.id, user_id: req.user.id } });

  if (existing) {
    await existing.destroy();
    const newCount = Math.max(0, (post.likes_count || 0) - 1);
    await post.update({ likes_count: newCount });
    return res.json({ success: true, liked: false, likes_count: newCount });
  }

  await PostLike.create({ post_id: post.id, user_id: req.user.id });
  await post.increment('likes_count');
  await post.reload();
  res.json({ success: true, liked: true, likes_count: post.likes_count });
});

// DELETE /api/community/:id — delete own post (auth required)
router.delete('/:id', protect, async (req, res) => {
  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
  if (post.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'You can only delete your own posts' });
  }
  await post.destroy();
  res.json({ success: true });
});

module.exports = router;
