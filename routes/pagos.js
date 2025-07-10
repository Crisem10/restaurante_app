const express = require('express');
const router = express.Router();
const Pago = require('../models/pago');

// Listar todos los pagos
router.get('/', async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Crear nuevo pago
router.post('/', async (req, res) => {
  try {
    const nuevo = await Pago.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar el pago' });
  }
});

// Obtener un pago por ID
router.get('/:id', async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (pago) res.json(pago);
    else res.status(404).json({ error: 'Pago no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el pago' });
  }
});

// Actualizar pago
router.put('/:id', async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (pago) {
      await pago.update(req.body);
      res.json(pago);
    } else res.status(404).json({ error: 'Pago no encontrado' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el pago' });
  }
});

// Eliminar pago
router.delete('/:id', async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (pago) {
      await pago.destroy();
      res.json({ mensaje: 'Pago eliminado' });
    } else res.status(404).json({ error: 'Pago no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
});

module.exports = router;
