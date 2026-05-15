'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class Submission extends Model {}

Submission.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    problem_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    code:          { type: DataTypes.TEXT('long'), allowNull: false },
    verdict:       { type: DataTypes.STRING(50), allowNull: true },
    passed:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    total:         { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    execution_time: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    python_code:   { type: DataTypes.TEXT('long'), allowNull: true },
  },
  {
    sequelize,
    modelName: 'Submission',
    tableName: 'submissions',
    updatedAt: false,
  }
);

module.exports = Submission;
