const Reserva = require('../models/reserva');
const Mesa = require('../models/mesa');

// Ejemplo para obtener todas las reservas con datos de la mesa
exports.getReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [{
        model: Mesa,
        attributes: ['id', 'numero', 'capacidad', 'estado']
      }]
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};