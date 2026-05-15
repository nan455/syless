'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Instance method: compare password
  async comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  }

  // Return user without sensitive fields
  toSafeJSON() {
    const obj = this.toJSON();
    delete obj.password;
    delete obj.reset_password_token;
    delete obj.reset_password_expires;
    return obj;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: { msg: 'Username already taken' },
      validate: {
        len: { args: [3, 30], msg: 'Username must be 3–30 characters' },
        is: { args: /^[a-zA-Z0-9_]+$/, msg: 'Username can only contain letters, numbers, underscores' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Email already registered' },
      validate: { isEmail: { msg: 'Enter a valid email address' } },
      set(value) { this.setDataValue('email', value.toLowerCase().trim()); },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: { args: [6, 255], msg: 'Password must be at least 6 characters' } },
    },
    role: {
      type: DataTypes.ENUM('user', 'pro', 'enterprise', 'admin'),
      defaultValue: 'user',
    },
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    bio: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },

    // Stats (stored as flat columns for simplicity with MySQL)
    stats_problems_solved: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    stats_total_runs:      { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    stats_streak:          { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    stats_xp:              { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    stats_level:           { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },

    // Subscription
    subscription_plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      defaultValue: 'free',
    },
    subscription_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Preferences (JSON column — MySQL 5.7+ supports JSON)
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'dark',
        fontSize: 14,
        language: 'syless',
        aiAssistant: true,
      },
    },

    last_login:              { type: DataTypes.DATE, allowNull: true },
    is_active:               { type: DataTypes.BOOLEAN, defaultValue: true },
    email_verified:          { type: DataTypes.BOOLEAN, defaultValue: false },
    reset_password_token:    { type: DataTypes.STRING(255), allowNull: true },
    reset_password_expires:  { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeSave: async (user) => {
        // Hash password only if it changed
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
        // Recalculate level from XP
        user.stats_level = Math.floor(Math.sqrt(user.stats_xp / 100)) + 1;
      },
    },
    defaultScope: {
      attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },
  }
);

// Virtual getter: aggregate stats as object (for API compatibility with frontend)
User.prototype.getStats = function () {
  return {
    problemsSolved: this.stats_problems_solved,
    totalRuns:      this.stats_total_runs,
    streak:         this.stats_streak,
    xp:             this.stats_xp,
    level:          this.stats_level,
  };
};

User.prototype.getSubscription = function () {
  return {
    plan:      this.subscription_plan,
    expiresAt: this.subscription_expires_at,
  };
};

module.exports = User;
