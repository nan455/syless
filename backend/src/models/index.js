'use strict';

const User       = require('./User');
const Problem    = require('./Problem');
const Snippet    = require('./Snippet');
const Submission = require('./Submission');

// ─── Associations ─────────────────────────────────────────────────────────────
User.hasMany(Snippet,    { foreignKey: 'user_id',    onDelete: 'CASCADE'  });
Snippet.belongsTo(User,  { foreignKey: 'user_id' });

User.hasMany(Submission,    { foreignKey: 'user_id',    onDelete: 'CASCADE' });
Submission.belongsTo(User,  { foreignKey: 'user_id' });

Problem.hasMany(Submission,    { foreignKey: 'problem_id', onDelete: 'CASCADE' });
Submission.belongsTo(Problem,  { foreignKey: 'problem_id' });

Problem.belongsTo(User, { foreignKey: 'created_by', as: 'creator', constraints: false });

module.exports = { User, Problem, Snippet, Submission };
