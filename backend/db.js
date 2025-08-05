const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Detectar entorno (Supabase siempre requiere SSL)
const isProduction = process.env.NODE_ENV === 'production';
const isSupabase = process.env.DB_HOST && process.env.DB_HOST.includes('supabase.co');

console.log(`🌍 Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`🗄️ Base de datos: ${isSupabase ? 'SUPABASE' : 'LOCAL'}`);
console.log('DB Config:', {
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: isSupabase ? 'enabled' : 'disabled'
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASS),
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: console.log, // Habilitar logging para debug
    dialectOptions: isSupabase ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Para Supabase
      }
    } : {}
  }
);

module.exports = sequelize;
