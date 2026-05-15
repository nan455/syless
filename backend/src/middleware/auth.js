'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in to continue.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.';
      return res.status(401).json({ success: false, message });
    }

    // Sequelize findByPk — default scope excludes password
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
    });
  }
  next();
};

const requirePro = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.subscription_plan === 'free') {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a Pro or Enterprise subscription.',
      upgradeRequired: true,
    });
  }
  next();
};

// Attach user if token is present — does NOT block unauthenticated requests
const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user && user.is_active) req.user = user;
    }
  } catch { /* silent — unauthenticated requests are allowed */ }
  next();
};

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Recalculate stats_level from XP (User.increment bypasses beforeSave hook)
async function recalcLevel(userId) {
  const u = await User.findByPk(userId, { attributes: ['stats_xp', 'stats_level'] });
  if (!u) return;
  const newLevel = Math.floor(Math.sqrt(u.stats_xp / 100)) + 1;
  if (newLevel !== u.stats_level) {
    await User.update({ stats_level: newLevel }, { where: { id: userId } });
  }
}

module.exports = { protect, optionalAuth, requireRole, requirePro, generateToken, recalcLevel };
