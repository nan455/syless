'use strict';
/**
 * SYLESS Database Setup Script
 * Run with: node src/database/setup.js
 * Run with reset: node src/database/setup.js --reset
 *
 * This syncs all Sequelize models to MySQL.
 * On Hostinger: run this once after deploying the backend.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { sequelize, connectDB } = require('./db');
const { User, Problem, Snippet, Submission } = require('../models/index');

const RESET = process.argv.includes('--reset');

async function setup() {
  console.log('🔄 Connecting to MySQL...');
  await connectDB();

  if (RESET) {
    console.log('⚠️  RESET mode — dropping all tables...');
    await sequelize.drop();
    console.log('🗑️  All tables dropped');
  }

  console.log('🏗️  Creating/syncing tables...');

  // sync({ alter: true }) is safe for updates; use force:true only to drop+recreate
  await sequelize.sync({ alter: !RESET, force: RESET });

  console.log('✅ Tables synced:');
  console.log('   ├── users');
  console.log('   ├── problems');
  console.log('   ├── snippets');
  console.log('   └── submissions');

  // Check if seed needed
  const count = await Problem.count();
  if (count === 0) {
    console.log('\n🌱 No problems found — running seed...');
    await require('./seed').seed();
  } else {
    console.log(`\n📦 ${count} problems already seeded — skipping seed`);
  }

  console.log('\n🚀 Database setup complete!');
  process.exit(0);
}

setup().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
