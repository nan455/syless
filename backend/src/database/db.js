'use strict';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      // Hostinger uses SSL in some plans — enable if needed:
      // ssl: { rejectUnauthorized: false }
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,   // use snake_case columns
      timestamps: true,
    },
  }
);

async function connectDB() {
  await sequelize.authenticate();
  console.log('✅ MySQL connected via Sequelize');
}

module.exports = { sequelize, connectDB };
