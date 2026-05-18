'use strict';

const User           = require('./User');
const Problem        = require('./Problem');
const Snippet        = require('./Snippet');
const Submission     = require('./Submission');
const UserProgress   = require('./UserProgress');
const Analytics      = require('./Analytics');
const CommunityPost  = require('./CommunityPost');
const PostLike       = require('./PostLike');

// ─── Associations ─────────────────────────────────────────────────────────────
User.hasMany(Snippet,       { foreignKey: 'user_id', onDelete: 'CASCADE' });
Snippet.belongsTo(User,     { foreignKey: 'user_id' });

User.hasMany(Submission,    { foreignKey: 'user_id', onDelete: 'CASCADE' });
Submission.belongsTo(User,  { foreignKey: 'user_id' });

Problem.hasMany(Submission,    { foreignKey: 'problem_id', onDelete: 'CASCADE' });
Submission.belongsTo(Problem,  { foreignKey: 'problem_id' });

Problem.belongsTo(User, { foreignKey: 'created_by', as: 'creator', constraints: false });

User.hasMany(UserProgress,       { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserProgress.belongsTo(User,     { foreignKey: 'user_id' });

User.hasMany(CommunityPost,      { foreignKey: 'user_id', onDelete: 'CASCADE' });
CommunityPost.belongsTo(User,    { foreignKey: 'user_id', as: 'author' });

CommunityPost.hasMany(PostLike,  { foreignKey: 'post_id', onDelete: 'CASCADE' });
PostLike.belongsTo(CommunityPost,{ foreignKey: 'post_id' });

module.exports = { User, Problem, Snippet, Submission, UserProgress, Analytics, CommunityPost, PostLike };
