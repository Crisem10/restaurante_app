const express = require('express');
const app = express();
require('dotenv').config();
const sequelize = require('./db');
const cors = require('cors');
const morgan = require('morgan');

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

// Middlewares personalizados
const autenticarToken = require('./middleware/auth');
const esAdmin = require('./middleware/admin');

const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware CORS
app.use(cors());

// Logging de peticiones
app.use(morgan('dev'));

// Servir archivos estáticos de imágenes
app.use('/images', express.static(__dirname + '/public/images'));

// RUTA PÚBLICA ESPECIAL PARA MESAS DISPONIBLES (antes de las rutas con middleware)
// RUTA PÚBLICA ESPECIAL PARA MESAS DISPONIBLES (antes de las rutas con middleware)
app.get('/api/mesas-publicas', async (req, res) => {
  try {
    console.log('🎯 RUTA PÚBLICA /api/mesas-publicas llamada');
    const sequelize = require('./db');
    
    const [mesas] = await sequelize.query(`
      SELECT id, numero, capacidad, estado 
      FROM mesas 
      WHERE estado = 'disponible' 
      ORDER BY numero ASC
    `);
    
    console.log(`📊 Mesas disponibles encontradas: ${mesas.length}`);
    res.json(mesas);
  } catch (error) {
    console.error('❌ Error al obtener mesas disponibles:', error);
    res.status(500).json({ error: 'Error al obtener mesas disponibles' });
  }
});

app.get('/api/mesas/disponibles', async (req, res) => {
  try {
    console.log('🎯 RUTA PÚBLICA /api/mesas/disponibles llamada');
    const sequelize = require('./db');
    
    const [mesas] = await sequelize.query(`
      SELECT id, numero, capacidad, estado 
      FROM mesas 
      WHERE estado = 'disponible' 
      ORDER BY numero ASC
    `);
    
    console.log(`📊 Mesas disponibles encontradas: ${mesas.length}`);
    res.json(mesas);
  } catch (error) {
    console.error('❌ Error al obtener mesas disponibles:', error);
    res.status(500).json({ error: 'Error al obtener mesas disponibles' });
  }
});

// Rutas con prefijo /api
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/pagos', pagoRoutes);
// Rutas protegidas para admin
app.use('/api/menus/admin', autenticarToken, esAdmin, menuRoutes); // rutas de gestión admin
app.use('/api/menus', menuRoutes); // Rutas públicas de menú

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

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
