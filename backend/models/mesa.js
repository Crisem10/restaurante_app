const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Mesa = sequelize.define('Mesa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'disponible',
  },
}, {
  tableName: 'mesas',
  schema: 'public',
  timestamps: true,
});

// No changes necesarios aquí para mostrar los datos de la mesa en reservas.
// Asegúrate de definir la relación en el modelo de Reserva.

module.exports = Mesa;
