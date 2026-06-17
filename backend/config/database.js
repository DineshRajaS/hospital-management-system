// config/database.js
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse Railway's full MySQL URL or use individual env vars
const getDbConfig = () => {
  const rawHost = process.env.DB_HOST || '';

  if (rawHost.startsWith('mysql://')) {
    const url = new URL(rawHost);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', '')
    };
  }

  return {
    host: rawHost,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
};

const cfg = getDbConfig();

// Log (without password) to confirm what's being used
console.log('🔌 Connecting to DB:', `${cfg.host}:${cfg.port} / ${cfg.database} as ${cfg.user}`);

// Step 1: Create DB if not exists
const createDatabaseIfNotExists = async () => {
  const connection = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` 
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );

  console.log(`✅ Database "${cfg.database}" is ready`);
  await connection.end();
};

// Step 2: Sequelize instance
const sequelize = new Sequelize(cfg.database, cfg.user, cfg.password, {
  host: cfg.host,
  port: cfg.port,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  define: { timestamps: true, underscored: true }
});

const testConnection = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };