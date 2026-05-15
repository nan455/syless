'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class UserProgress extends Model {}

UserProgress.init(
  {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    module_id:   { type: DataTypes.STRING(20), allowNull: false },   // e.g. 'b1', 'i3'
    completed:   { type: DataTypes.BOOLEAN, defaultValue: false },
    score:       { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    attempts:    { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    best_code:   { type: DataTypes.TEXT, allowNull: true },
    completed_at:   { type: DataTypes.DATE, allowNull: true },
    solved_problems:{ type: DataTypes.JSON, defaultValue: [] },  // array of problem IDs
  },
  {
    sequelize,
    modelName: 'UserProgress',
    tableName: 'user_progress',
    indexes: [{ unique: true, fields: ['user_id', 'module_id'] }],
  }
);

module.exports = UserProgress;
