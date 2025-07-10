const express = require('express');
const router = express.Router();
const Reserva = require('../models/reservas');
const autenticarToken = require('../middleware/auth');
const Mesa = require('../models/mesa');

// Listar todas las reservas (protegido)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const reservas = await Reserva.findAll();
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Obtener reserva por ID (protegido)
router.get('/:id', autenticarToken, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
});

// Crear reserva (protegido)
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { usuario_id, mesa_id, fecha, hora, personas, preferencias_asiento, estado } = req.body;

    // Validar que la mesa exista
    const mesa = await Mesa.findByPk(mesa_id);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    // Validar disponibilidad (ejemplo básico, puedes mejorar)
    const reservaExistente = await Reserva.findOne({
      where: {
        mesa_id,
        fecha,
        hora,
      }
    });
    if (reservaExistente) {
      return res.status(400).json({ error: 'Mesa no disponible para esa fecha y hora' });
    }

    const nuevaReserva = await Reserva.create({
      usuario_id,
      mesa_id,
      fecha,
      hora,
      personas,
      preferencias_asiento,
      estado: estado || 'pendiente'
    });

    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al crear la reserva' });
  }
});

// Actualizar reserva (protegido)
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    const { mesa_id, fecha, hora, personas, preferencias_asiento, estado } = req.body;

    // Validar que la mesa exista
    if (mesa_id) {
      const mesa = await Mesa.findByPk(mesa_id);
      if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Validar disponibilidad (similar a crear)
    if (mesa_id && fecha && hora) {
      const reservaExistente = await Reserva.findOne({
        where: {
          mesa_id,
          fecha,
          hora,
          id: { [Op.ne]: req.params.id }, // exclude this reserva id
        }
      });
      if (reservaExistente) {
        return res.status(400).json({ error: 'Mesa no disponible para esa fecha y hora' });
      }
    }

    await reserva.update(req.body);
    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al actualizar la reserva' });
  }
});

// Eliminar reserva (protegido)
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    await reserva.destroy();
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

module.exports = router;
