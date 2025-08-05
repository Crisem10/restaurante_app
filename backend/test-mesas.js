const Mesa = require('./models/mesa');
const sequelize = require('./db');

async function verificarMesas() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');
    
    const mesas = await Mesa.findAll();
    console.log(`📊 Mesas encontradas: ${mesas.length}`);
    
    mesas.forEach(mesa => {
      console.log(`- Mesa ${mesa.numero}, capacidad: ${mesa.capacidad}, estado: ${mesa.estado}`);
    });
    
    const mesasDisponibles = await Mesa.findAll({
      where: { estado: 'disponible' }
    });
    console.log(`✅ Mesas disponibles: ${mesasDisponibles.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarMesas();
