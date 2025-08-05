const express = require('express');
const router = express.Router();
const Reserva = require('../models/reservas');
const autenticarToken = require('../middleware/auth');
const Mesa = require('../models/mesa');
const esAdmin = require('../middleware/admin');

// Listar todas las reservas (solo admin)
router.get('/', autenticarToken, esAdmin, async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          model: require('../models/usuario'),
          attributes: ['id', 'nombre', 'correo']
        },
        {
          model: Mesa,
          attributes: ['id', 'numero', 'capacidad', 'estado']
        }
      ]
    });
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Obtener reserva por ID (solo admin)
router.get('/:id', autenticarToken, esAdmin, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
});

// Crear reserva (usuario autenticado)
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { mesa_id, fecha, hora, personas, preferencias_asiento, estado } = req.body;
    
    // Obtener el usuario_id del token autenticado
    const usuario_id = req.usuario.id;

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
    console.error('Error al crear reserva:', error);
    res.status(400).json({ error: 'Error al crear la reserva' });
  }
});

// Actualizar reserva (solo admin)
router.put('/:id', autenticarToken, esAdmin, async (req, res) => {
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

// Eliminar reserva (solo admin)
router.delete('/:id', autenticarToken, esAdmin, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    await reserva.destroy();
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

// Cancelar reserva (usuario autenticado, solo su propia reserva)
router.delete('/cancelar/:id', autenticarToken, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    // Solo el dueño de la reserva o admin puede cancelar
    if (reserva.usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
    }
    await reserva.destroy();
    res.json({ mensaje: 'Reserva cancelada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
});

// Ver fechas y mesas disponibles (usuario autenticado)
router.get('/disponibles', autenticarToken, async (req, res) => {
  try {
    const { fecha, hora } = req.query;
    // Buscar mesas que NO estén reservadas en esa fecha/hora
    const reservas = await Reserva.findAll({ where: { fecha, hora } });
    const mesasReservadas = reservas.map(r => r.mesa_id);
    const mesasDisponibles = await Mesa.findAll({
      where: { id: { [Mesa.sequelize.Op.notIn]: mesasReservadas } }
    });
    res.json({ fecha, hora, mesasDisponibles });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
});

// Obtener reservas de un usuario autenticado
router.get('/usuario/:id', autenticarToken, async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { usuario_id: req.params.id },
      include: [{
        model: Mesa,
        attributes: ['id', 'numero', 'capacidad', 'estado']
      }]
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas del usuario' });
  }
});

module.exports = router;
