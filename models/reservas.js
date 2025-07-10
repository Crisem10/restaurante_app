const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Usuario = require('./usuario');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id',
    },
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  personas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  preferencias_asiento: {
    type: DataTypes.TEXT,
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'reservas',
  schema: 'restaurante',
  timestamps: false,
});

Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Reserva;
