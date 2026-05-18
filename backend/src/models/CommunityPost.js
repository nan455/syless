'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class CommunityPost extends Model {}

CommunityPost.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
    code: { type: DataTypes.TEXT, allowNull: false },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'CommunityPost',
    tableName: 'community_posts',
    timestamps: true,
    underscored: true,
  }
);

module.exports = CommunityPost;
