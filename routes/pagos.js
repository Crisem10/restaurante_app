const express = require('express');
const router = express.Router();
const Pago = require('../models/pago');
const Reserva = require('../models/reservas');
const autenticarToken = require('../middleware/auth');
const axios = require('axios');

const { PAYPHONE_API_URL, PAYPHONE_API_KEY } = process.env;

// ─── CRUD BÁSICO ────────────────────────────────────────────────────────────────

// Listar todos los pagos
router.get('/', autenticarToken, async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Obtener un pago por ID
router.get('/:id', autenticarToken, async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (error) {
    console.error('Error al buscar el pago:', error);
    res.status(500).json({ error: 'Error al buscar el pago' });
  }
});

// Crear nuevo pago manual
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { reserva_id, metodo_pago, monto, estado_pago } = req.body;

    if (!reserva_id || !metodo_pago || !monto) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para el pago' });
    }

    const nuevo = await Pago.create({
      reserva_id,
      metodo_pago,
      monto,
      estado_pago: estado_pago || 'pendiente'
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    res.status(400).json({ error: 'Error al registrar el pago' });
  }
});

// Actualizar pago
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });

    await pago.update(req.body);
    res.json(pago);
  } catch (error) {
    console.error('Error al actualizar el pago:', error);
    res.status(400).json({ error: 'Error al actualizar el pago' });
  }
});

// Eliminar pago
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });

    await pago.destroy();
    res.json({ mensaje: 'Pago eliminado' });
  } catch (error) {
    console.error('Error al eliminar el pago:', error);
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
});


// ─── INTEGRACIÓN CON PAYPHONE ──────────────────────────────────────────────────

// POST /pagos/payphone → iniciar un pago móvil con PayPhone
// Integración con PayPhone
router.post('/payphone', autenticarToken, async (req, res) => {
  // <- Aquí comienza tu lógica PayPhone
  console.log('🔥 LLEGÓ /pagos/payphone:', req.method, req.path, req.body);
  try {
    const { reserva_id, monto, telefono } = req.body;
    const reserva = await Reserva.findByPk(reserva_id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    const payphoneResp = await axios.post(
      `${PAYPHONE_API_URL}/payments`,
      { amount: monto, reference: `reserva-${reserva_id}`, phone: telefono },
      { headers: { Authorization: `Bearer ${PAYPHONE_API_KEY}` } }
    );

    const pago = await Pago.create({
      reserva_id,
      metodo_pago: 'payphone',
      monto,
      estado_pago: payphoneResp.data.status
    });

    return res.status(201).json({ pago, payphone: payphoneResp.data });
  } catch (error) {
    console.error('Error en pago PayPhone:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Error al procesar pago con PayPhone' });
  }
});

module.exports = router;

