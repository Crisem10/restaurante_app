const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Mesa = require('./mesa');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  duracion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mesa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mesa,
      key: 'id',
    },
  },
}, {
  tableName: 'reservas',
  schema: 'public',
  timestamps: false,
});

Reserva.belongsTo(Mesa, { foreignKey: 'mesa_id' });

module.exports = Reserva;