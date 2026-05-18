'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class Analytics extends Model {}

Analytics.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    page: {
      type: DataTypes.STRING(50),
      allowNull: false,
      index: true,
    },
    event_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'page_view',
    },
    view_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'Analytics',
    tableName: 'analytics',
    timestamps: true,
    indexes: [
      { fields: ['page', 'event_type'], unique: true },
    ],
  }
);

module.exports = Analytics;
