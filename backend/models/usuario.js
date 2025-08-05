const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
  },
  contrasena: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING(20),
    defaultValue: 'cliente',
  },
}, {
  tableName: 'usuarios',
  schema: 'public', // Cambiado para Supabase
  timestamps: false,
});

module.exports = Usuario;
