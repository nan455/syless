'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/db');

class Snippet extends Model {}

Snippet.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title:   { type: DataTypes.STRING(255), allowNull: false },
    code:    { type: DataTypes.TEXT('long'), allowNull: false },
    language: { type: DataTypes.STRING(50), defaultValue: 'syless' },
  },
  {
    sequelize,
    modelName: 'Snippet',
    tableName: 'snippets',
  }
);

module.exports = Snippet;
