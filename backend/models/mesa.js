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

// No changes necesarios aquí para mostrar los datos de la mesa en reservas.
// Asegúrate de definir la relación en el modelo de Reserva.

module.exports = Mesa;
