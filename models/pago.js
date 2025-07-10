const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Reserva = require('./reservas');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reserva_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Reserva,
      key: 'id',
    },
  },
  metodo_pago: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  fecha_pago: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estado_pago: {
    type: DataTypes.STRING(20),
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'pagos',
  schema: 'restaurante',
  timestamps: false,
});

Pago.belongsTo(Reserva, { foreignKey: 'reserva_id' });

module.exports = Pago;
