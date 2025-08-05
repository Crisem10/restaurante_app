const express = require('express');
const router = express.Router();
const Pago = require('../models/pago');
const Reserva = require('../models/reservas');
const autenticarToken = require('../middleware/auth');
const axios = require('axios');
const esAdmin = require('../middleware/admin');

// Importar configuración y middlewares de Payphone
const payphoneConfig = require('../config/payphone');
const payphoneMiddleware = require('../middleware/payphone');

const { PAYPHONE_API_URL, PAYPHONE_API_KEY } = process.env;

// ─── CRUD BÁSICO ────────────────────────────────────────────────────────────────

// Listar todos los pagos (solo admin)
router.get('/', autenticarToken, esAdmin, async (req, res) => {
  try {
    const pagos = await Pago.findAll();
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Obtener un pago por ID (solo admin)
router.get('/:id', autenticarToken, esAdmin, async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (error) {
    console.error('Error al buscar el pago:', error);
    res.status(500).json({ error: 'Error al buscar el pago' });
  }
});

// Crear nuevo pago manual (usuario autenticado)
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

    // Cambiar estado de la mesa a "ocupado" si el pago es exitoso
    if ((estado_pago && estado_pago.toLowerCase() === 'pagado') || (metodo_pago && metodo_pago.toLowerCase() === 'payphone')) {
      const reserva = await Reserva.findByPk(reserva_id);
      if (reserva) {
        const Mesa = require('../models/mesa');
        await Mesa.update({ estado: 'ocupado' }, { where: { id: reserva.mesa_id } });
      }
    }

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    res.status(400).json({ error: 'Error al registrar el pago' });
  }
});

// Actualizar pago (solo admin)
router.put('/:id', autenticarToken, esAdmin, async (req, res) => {
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

// Eliminar pago (solo admin)
router.delete('/:id', autenticarToken, esAdmin, async (req, res) => {
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

// ─── PAGOS DEL USUARIO AUTENTICADO ────────────────────────────────────────────
// GET /pagos/mis → ver pagos del usuario autenticado
router.get('/mis', autenticarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    // Buscar pagos cuyas reservas pertenecen al usuario
    const pagos = await Pago.findAll({
      include: [{
        model: Reserva,
        where: { usuario_id: usuarioId },
        attributes: []
      }]
    });
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener pagos del usuario' });
  }
});

// ─── INTEGRACIÓN CON PAYPHONE ──────────────────────────────────────────────────

// POST /pagos/payphone/crear → crear un pago con PayPhone
router.post('/payphone/crear', 
  autenticarToken,
  payphoneMiddleware.validatePayphoneConfig,
  payphoneMiddleware.validatePaymentData,
  payphoneMiddleware.logPayphoneTransaction,
  async (req, res) => {
  console.log('🔥 Creando pago PayPhone:', req.body);
  try {
    const { reserva_id, monto, telefono, descripcion } = req.body;

    const reserva = await Reserva.findByPk(reserva_id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    // Datos para PayPhone usando configuración centralizada
    const payphoneData = {
      amount: monto,
      reference: `reserva-${reserva_id}-${Date.now()}`,
      phone: telefono,
      description: descripcion || `Pago reserva mesa ${reserva.mesa_id}`,
      currency: payphoneConfig.MONEDAS.USD
    };

    // Llamar a PayPhone API
    const payphoneResp = await axios.post(
      `${payphoneConfig.getApiUrl()}/payments`,
      payphoneData,
      { 
        headers: { 
          'Authorization': `Bearer ${PAYPHONE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: payphoneConfig.TIMEOUTS.REQUEST
      }
    );

    // Crear registro de pago en base de datos
    const pago = await Pago.create({
      reserva_id,
      metodo_pago: 'payphone',
      monto,
      estado_pago: payphoneConfig.ESTADOS_PAGO.PENDIENTE,
      transaction_id: payphoneResp.data.transactionId || payphoneResp.data.id
    });

    return res.status(201).json({ 
      success: true,
      pago,
      payphone: payphoneResp.data,
      mensaje: 'Pago iniciado correctamente. Revisa tu teléfono para completar el pago.'
    });
  } catch (error) {
    payphoneMiddleware.handlePayphoneError(error, req, res);
  }
});

// GET /pagos/payphone/verificar/:transactionId → verificar estado de pago
router.get('/payphone/verificar/:transactionId',
  autenticarToken,
  payphoneMiddleware.validatePayphoneConfig,
  payphoneMiddleware.validateTransactionId,
  payphoneMiddleware.logPayphoneTransaction,
  async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Verificar estado en PayPhone
    const payphoneResp = await axios.get(
      `${payphoneConfig.getApiUrl()}/payments/${transactionId}`,
      { 
        headers: { 
          'Authorization': `Bearer ${PAYPHONE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: payphoneConfig.TIMEOUTS.VERIFICATION
      }
    );

    // Actualizar estado en base de datos
    const pago = await Pago.findOne({ where: { transaction_id: transactionId } });
    if (pago && payphoneResp.data.status) {
      await pago.update({ estado_pago: payphoneResp.data.status });
      
      // Si el pago fue exitoso, actualizar estado de la mesa
      if (payphoneConfig.isSuccessStatus(payphoneResp.data.status)) {
        const reserva = await Reserva.findByPk(pago.reserva_id);
        if (reserva) {
          const Mesa = require('../models/mesa');
          await Mesa.update({ estado: 'ocupado' }, { where: { id: reserva.mesa_id } });
        }
      }
    }

    return res.json({
      success: true,
      estado: payphoneResp.data.status,
      pago,
      payphone: payphoneResp.data,
      esExitoso: payphoneConfig.isSuccessStatus(payphoneResp.data.status)
    });
  } catch (error) {
    payphoneMiddleware.handlePayphoneError(error, req, res);
  }
});

// POST /pagos/payphone/confirmar/:transactionId → confirmar pago
router.post('/payphone/confirmar/:transactionId',
  autenticarToken,
  payphoneMiddleware.validateTransactionId,
  payphoneMiddleware.logPayphoneTransaction,
  async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { confirmacion } = req.body;
    
    const pago = await Pago.findOne({ where: { transaction_id: transactionId } });
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Actualizar estado del pago
    const nuevoEstado = confirmacion ? 
      payphoneConfig.ESTADOS_PAGO.CONFIRMADO : 
      payphoneConfig.ESTADOS_PAGO.CANCELADO;

    await pago.update({ 
      estado_pago: nuevoEstado,
      fecha_confirmacion: new Date()
    });

    return res.json({
      success: true,
      mensaje: confirmacion ? 'Pago confirmado exitosamente' : 'Pago cancelado',
      pago,
      estado: nuevoEstado
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    return res.status(500).json({ error: 'Error al confirmar pago' });
  }
});

// POST /pagos/payphone → mantener compatibilidad con versión anterior
router.post('/payphone', autenticarToken, async (req, res) => {
  // Redirigir a la nueva ruta
  req.url = '/payphone/crear';
  return router.handle(req, res);
});

module.exports = router;

