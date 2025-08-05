const sequelize = require('./db');

async function checkSchema() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'mesas' AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura de la tabla mesas:');
    console.table(results);
    
    // También obtener algunos datos de muestra
    const [data] = await sequelize.query('SELECT * FROM mesas LIMIT 5');
    console.log('\nDatos de muestra:');
    console.table(data);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchema();
