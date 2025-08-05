/**
 * Middleware para validaciones y configuración de Payphone
 */

const payphoneConfig = require('../config/payphone');

/**
 * Middleware para validar configuración de Payphone
 */
function validatePayphoneConfig(req, res, next) {
  const validation = payphoneConfig.validateConfig();
  
  if (!validation.isValid) {
    return res.status(500).json({
      error: 'Configuración de Payphone incompleta',
      details: validation.errors,
      solution: 'Configura las variables PAYPHONE_API_KEY y PAYPHONE_API_URL en el archivo .env'
    });
  }
  
  next();
}

/**
 * Middleware para validar datos de pago
 */
function validatePaymentData(req, res, next) {
  const { reserva_id, monto, telefono } = req.body;
  const errors = [];

  // Validar reserva_id
  if (!reserva_id || isNaN(reserva_id) || reserva_id <= 0) {
    errors.push('reserva_id debe ser un número entero positivo');
  }

  // Validar monto
  if (!payphoneConfig.isValidAmount(monto)) {
    errors.push(`monto debe ser un número entre ${payphoneConfig.VALIDATION.MIN_AMOUNT} y ${payphoneConfig.VALIDATION.MAX_AMOUNT}`);
  }

  // Validar teléfono
  if (!payphoneConfig.isValidPhone(telefono)) {
    errors.push('telefono debe tener un formato válido (ej: 0987654321, +593987654321)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Datos de pago inválidos',
      details: errors
    });
  }

  // Formatear teléfono y agregar al request
  req.body.telefono = payphoneConfig.formatPhoneNumber(telefono);
  req.body.monto = parseFloat(monto);

  next();
}

/**
 * Middleware para validar transaction_id
 */
function validateTransactionId(req, res, next) {
  const { transactionId } = req.params;

  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim().length === 0) {
    return res.status(400).json({
      error: 'Transaction ID inválido',
      details: 'El transaction_id es requerido y debe ser una cadena válida'
    });
  }

  next();
}

/**
 * Middleware para logging de transacciones Payphone
 */
function logPayphoneTransaction(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] PAYPHONE ${method} ${path} - IP: ${ip}`);
  
  if (method === 'POST') {
    // Log datos del pago (sin información sensible)
    const { reserva_id, monto, telefono } = req.body;
    console.log(`[${timestamp}] Pago - Reserva: ${reserva_id}, Monto: $${monto}, Teléfono: ${telefono?.replace(/(\d{3})\d{6}(\d{3})/, '$1***$2')}`);
  }

  next();
}

/**
 * Middleware para manejo de errores de Payphone
 */
function handlePayphoneError(error, req, res, next) {
  console.error('[PAYPHONE ERROR]', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack
  });

  // Errores específicos de Payphone
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        return res.status(500).json({
          error: 'Error de autenticación con Payphone',
          message: 'Verifica tu API Key',
          code: 'PAYPHONE_AUTH_ERROR'
        });
      
      case 400:
        return res.status(400).json({
          error: 'Datos de pago inválidos',
          message: data?.message || 'Los datos enviados a Payphone son inválidos',
          code: 'PAYPHONE_DATA_ERROR',
          details: data
        });
      
      case 403:
        return res.status(500).json({
          error: 'Permisos insuficientes en Payphone',
          message: 'Tu cuenta no tiene permisos para esta operación',
          code: 'PAYPHONE_PERMISSION_ERROR'
        });
      
      case 404:
        return res.status(404).json({
          error: 'Transacción no encontrada',
          message: 'La transacción no existe en Payphone',
          code: 'PAYPHONE_NOT_FOUND'
        });
      
      case 500:
        return res.status(500).json({
          error: 'Error interno de Payphone',
          message: 'Intenta nuevamente en unos minutos',
          code: 'PAYPHONE_SERVER_ERROR'
        });
      
      default:
        return res.status(500).json({
          error: 'Error de comunicación con Payphone',
          message: data?.message || 'Error desconocido',
          code: 'PAYPHONE_UNKNOWN_ERROR',
          status
        });
    }
  }

  // Error de red o timeout
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(500).json({
      error: 'No se puede conectar con Payphone',
      message: 'Verifica tu conexión a internet',
      code: 'PAYPHONE_CONNECTION_ERROR'
    });
  }

  if (error.code === 'ECONNABORTED') {
    return res.status(500).json({
      error: 'Timeout de conexión con Payphone',
      message: 'La solicitud tardó demasiado tiempo',
      code: 'PAYPHONE_TIMEOUT_ERROR'
    });
  }

  // Error genérico
  return res.status(500).json({
    error: 'Error inesperado en el procesamiento de pago',
    message: 'Contacta al soporte técnico',
    code: 'PAYPHONE_GENERIC_ERROR'
  });
}

/**
 * Middleware para rate limiting específico de Payphone
 */
function payphoneRateLimit(req, res, next) {
  // Implementación básica de rate limiting
  // En producción, considera usar redis o una librería especializada
  
  const ip = req.ip || req.connection.remoteAddress;
  const key = `payphone_rate_${ip}`;
  
  // Aquí podrías implementar lógica de rate limiting
  // Por ejemplo, máximo 10 transacciones por minuto por IP
  
  next();
}

module.exports = {
  validatePayphoneConfig,
  validatePaymentData,
  validateTransactionId,
  logPayphoneTransaction,
  handlePayphoneError,
  payphoneRateLimit
};
