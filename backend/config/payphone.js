/**
 * Configuración centralizada para Payphone
 */

module.exports = {
  // URLs de la API
  API_URLS: {
    SANDBOX: 'https://pay.payphoneapp.com/api/v1', // URL de pruebas
    PRODUCTION: 'https://api.payphone.app/v1' // URL de producción (cambiar cuando tengas la real)
  },

  // Estados de pago posibles
  ESTADOS_PAGO: {
    PENDIENTE: 'pendiente',
    PROCESANDO: 'procesando',
    APROBADO: 'approved',
    COMPLETADO: 'completed',
    FALLIDO: 'failed',
    CANCELADO: 'cancelled',
    EXPIRADO: 'expired',
    CONFIRMADO: 'confirmado'
  },

  // Estados considerados como exitosos
  ESTADOS_EXITOSOS: ['approved', 'completed', 'confirmado'],

  // Configuración de timeouts (en milisegundos)
  TIMEOUTS: {
    REQUEST: 10000, // 10 segundos para requests
    VERIFICATION: 5000 // 5 segundos para verificaciones
  },

  // Monedas soportadas
  MONEDAS: {
    USD: 'USD',
    EUR: 'EUR'
  },

  // Configuración de reintentos
  RETRY_CONFIG: {
    MAX_ATTEMPTS: 3,
    DELAY: 2000 // 2 segundos entre reintentos
  },

  // Mensajes de error personalizados
  MENSAJES_ERROR: {
    API_KEY_INVALID: 'La API Key de Payphone es inválida',
    PHONE_INVALID: 'El número de teléfono no es válido',
    AMOUNT_INVALID: 'El monto debe ser mayor a 0',
    TRANSACTION_NOT_FOUND: 'Transacción no encontrada',
    NETWORK_ERROR: 'Error de conexión con Payphone',
    TIMEOUT_ERROR: 'Tiempo de espera agotado',
    UNKNOWN_ERROR: 'Error desconocido en Payphone'
  },

  // Patrones de validación
  VALIDATION: {
    PHONE_REGEX: /^(\+593|0)?[0-9]{9}$/, // Patrón para números ecuatorianos
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 9999.99
  },

  // Configuración de webhooks (para futuro)
  WEBHOOK_CONFIG: {
    EVENTS: ['payment.approved', 'payment.failed', 'payment.cancelled'],
    RETRY_ATTEMPTS: 5
  }
};

/**
 * Obtener URL de la API según el entorno
 */
function getApiUrl() {
  const isProduction = process.env.NODE_ENV === 'production';
  return process.env.PAYPHONE_API_URL || 
         (isProduction ? module.exports.API_URLS.PRODUCTION : module.exports.API_URLS.SANDBOX);
}

/**
 * Validar configuración de Payphone
 */
function validateConfig() {
  const errors = [];
  
  if (!process.env.PAYPHONE_API_KEY) {
    errors.push('PAYPHONE_API_KEY no está configurada');
  }
  
  if (!getApiUrl()) {
    errors.push('PAYPHONE_API_URL no está configurada');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formatear número de teléfono para Ecuador
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Limpiar el número
  let cleanPhone = phone.replace(/\s/g, '').replace(/[^\d]/g, '');
  
  // Si empieza con 0, quitarlo
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Agregar código de país si no lo tiene
  if (!cleanPhone.startsWith('593')) {
    cleanPhone = '593' + cleanPhone;
  }
  
  return '+' + cleanPhone;
}

/**
 * Validar número de teléfono
 */
function isValidPhone(phone) {
  if (!phone) return false;
  return module.exports.VALIDATION.PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

/**
 * Validar monto
 */
function isValidAmount(amount) {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && 
         numAmount >= module.exports.VALIDATION.MIN_AMOUNT && 
         numAmount <= module.exports.VALIDATION.MAX_AMOUNT;
}

/**
 * Verificar si un estado es exitoso
 */
function isSuccessStatus(status) {
  return module.exports.ESTADOS_EXITOSOS.includes(status?.toLowerCase());
}

// Exportar funciones utilitarias
module.exports.getApiUrl = getApiUrl;
module.exports.validateConfig = validateConfig;
module.exports.formatPhoneNumber = formatPhoneNumber;
module.exports.isValidPhone = isValidPhone;
module.exports.isValidAmount = isValidAmount;
module.exports.isSuccessStatus = isSuccessStatus;
