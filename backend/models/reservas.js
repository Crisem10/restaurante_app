const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Usuario = require('./usuario');
const Mesa = require('./mesa');

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
  mesa_id: {                    
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mesa,
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
  schema: 'public',
  timestamps: false,
});

Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Mesa, { foreignKey: 'mesa_id' });

module.exports = Reserva;
