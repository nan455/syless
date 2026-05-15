'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class Problem extends Model {
  async recordSubmission(accepted) {
    this.total_submissions += 1;
    if (accepted) this.accepted_submissions += 1;
    this.acceptance_rate = Math.round(
      (this.accepted_submissions / this.total_submissions) * 100
    );
    return this.save();
  }
}

Problem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING(20),
      defaultValue: 'easy',
      validate: { isIn: [['beginner', 'easy', 'medium', 'hard', 'expert']] },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [['arrays', 'strings', 'stack', 'queue', 'linkedlist', 'tree', 'graph', 'sorting', 'searching', 'recursion', 'dp', 'math', 'basics']] },
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Starter code stored as JSON {syless, python}
    starter_code: {
      type: DataTypes.JSON,
      defaultValue: { syless: '', python: '' },
    },
    // Solution hidden from SELECT by default (see scopes)
    solution: {
      type: DataTypes.JSON,
      defaultValue: { syless: '', python: '' },
    },
    // Array of {input, expectedOutput, isHidden}
    test_cases: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    hints: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dsa_visualization: {
      type: DataTypes.JSON,
      defaultValue: { type: 'none', steps: [] },
    },

    // Stats
    total_submissions:    { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    accepted_submissions: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    acceptance_rate:      { type: DataTypes.FLOAT, defaultValue: 0 },

    is_premium:  { type: DataTypes.BOOLEAN, defaultValue: false },
    order_num:   { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Problem',
    tableName: 'problems',
    hooks: {
      beforeCreate: (problem) => {
        if (!problem.slug && problem.title) {
          problem.slug = problem.title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 60);
        }
      },
    },
    defaultScope: {
      attributes: { exclude: ['solution'] },
    },
    scopes: {
      withSolution: { attributes: {} },
    },
  }
);

module.exports = Problem;
