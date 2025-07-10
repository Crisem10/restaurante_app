const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_plato: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING(50),
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'menu',
  schema: 'restaurante',
  timestamps: false,
});

module.exports = Menu;
