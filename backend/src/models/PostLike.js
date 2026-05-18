'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class PostLike extends Model {}

PostLike.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    post_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PostLike',
    tableName: 'post_likes',
    timestamps: false,
    underscored: true,
    indexes: [{ unique: true, fields: ['post_id', 'user_id'] }],
  }
);

module.exports = PostLike;
