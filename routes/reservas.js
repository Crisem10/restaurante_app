const express = require('express');
const router = express.Router();
const Reserva = require('../models/reservas'); // Aquí sí importamos el modelo

// GET /reservas → listar todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.findAll();
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

module.exports = router;
