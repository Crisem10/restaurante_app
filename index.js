const express = require('express');
const app = express();
require('dotenv').config();
const sequelize = require('./db');

// Importar modelos
const Usuario = require('./models/usuario');
const Reserva = require('./models/reservas'); // ← coincide con tu archivo actual
const Mesa = require('./models/mesa');
const Menu = require('./models/menu');
const Pago = require('./models/pago');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const reservaRoutes = require('./routes/reservas'); // ← coincide con tu archivo actual
const mesaRoutes = require('./routes/mesas');
const menuRoutes = require('./routes/menus');
const pagoRoutes = require('./routes/pagos');

const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/usuarios', usuariosRoutes);
app.use('/reservas', reservaRoutes);
app.use('/mesas', mesaRoutes);
app.use('/menus', menuRoutes);
app.use('/pagos', pagoRoutes);


// Verificar conexión y arrancar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');

    await sequelize.sync({ force: false }); // Sin borrar tablas existentes
    console.log('📦 Modelos sincronizados correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
}

startServer();
