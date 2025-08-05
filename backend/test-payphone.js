/**
 * Script de prueba para verificar la configuración de Payphone
 * Ejecutar con: node test-payphone.js
 */

require('dotenv').config();
const axios = require('axios');

const { PAYPHONE_API_URL, PAYPHONE_API_KEY } = process.env;

console.log('🔍 Verificando configuración de Payphone...\n');

// Verificar variables de entorno
console.log('Variables de entorno:');
console.log(`PAYPHONE_API_URL: ${PAYPHONE_API_URL || 'NO CONFIGURADA'}`);
console.log(`PAYPHONE_API_KEY: ${PAYPHONE_API_KEY ? '***CONFIGURADA***' : 'NO CONFIGURADA'}\n`);

if (!PAYPHONE_API_URL || !PAYPHONE_API_KEY) {
  console.error('❌ Error: Variables de entorno de Payphone no configuradas');
  console.log('Crea un archivo .env con:');
  console.log('PAYPHONE_API_URL=https://pay.payphoneapp.com/api/v1');
  console.log('PAYPHONE_API_KEY=tu_api_key_aqui');
  process.exit(1);
}

// Función de prueba
async function probarConexionPayphone() {
  try {
    console.log('🧪 Probando conexión con Payphone...');
    
    // Datos de prueba
    const datosPrueba = {
      amount: 1.00, // $1 USD para prueba
      reference: `test-${Date.now()}`,
      phone: '+593987654321', // Número de prueba
      description: 'Pago de prueba - Restaurante App',
      currency: 'USD'
    };

    console.log('Datos de prueba:', datosPrueba);
    
    const response = await axios.post(
      `${PAYPHONE_API_URL}/payments`,
      datosPrueba,
      {
        headers: {
          'Authorization': `Bearer ${PAYPHONE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      }
    );

    console.log('\n✅ Conexión exitosa con Payphone!');
    console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    
    // Si hay un transaction ID, intentar verificar el estado
    const transactionId = response.data.transactionId || response.data.id;
    if (transactionId) {
      console.log('\n🔄 Verificando estado del pago...');
      await verificarEstadoPago(transactionId);
    }

  } catch (error) {
    console.error('\n❌ Error al conectar con Payphone:');
    
    if (error.response) {
      // Error de respuesta del servidor
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Mensajes específicos según el error
      switch (error.response.status) {
        case 401:
          console.error('\n💡 Posible causa: API Key inválida o expirada');
          break;
        case 400:
          console.error('\n💡 Posible causa: Datos de solicitud inválidos');
          break;
        case 403:
          console.error('\n💡 Posible causa: Permisos insuficientes');
          break;
        case 500:
          console.error('\n💡 Posible causa: Error interno del servidor de Payphone');
          break;
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de conexión:', error.message);
      console.error('\n💡 Posible causa: Sin conexión a internet o URL incorrecta');
    } else {
      // Otros errores
      console.error('Error:', error.message);
    }
  }
}

async function verificarEstadoPago(transactionId) {
  try {
    const response = await axios.get(
      `${PAYPHONE_API_URL}/payments/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYPHONE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Estado del pago:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error al verificar estado:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
probarConexionPayphone().then(() => {
  console.log('\n🎉 Prueba completada!');
  console.log('\nSi todo funcionó correctamente, tu integración con Payphone está lista.');
  console.log('Ahora puedes usar la aplicación con pagos reales.');
}).catch(error => {
  console.error('\n💥 Error inesperado:', error);
  process.exit(1);
});
