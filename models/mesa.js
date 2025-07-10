const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Mesa = sequelize.define('Mesa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'disponible',
  },
}, {
  tableName: 'mesas',
  schema: 'restaurante',
  timestamps: false,
});

module.exports = Mesa;
