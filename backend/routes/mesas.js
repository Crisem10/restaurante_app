const express = require('express');
const router = express.Router();
const Mesa = require('../models/mesa');
const autenticarToken = require('../middleware/auth');
const sequelize = require('../db');

// Obtener solo las mesas disponibles (usando SQL directo para evitar problemas de modelo)
router.get('/disponibles', autenticarToken, async (req, res) => {
  try {
    console.log('🔍 Obteniendo mesas disponibles con SQL directo...');
    
    // Usar SQL directo para evitar problemas con el modelo
    const [mesas] = await sequelize.query(`
      SELECT id, numero, capacidad, estado 
      FROM mesas 
      WHERE estado = 'disponible' 
      ORDER BY numero ASC
    `);
    
    console.log(`📊 Mesas disponibles encontradas: ${mesas.length}`);
    mesas.forEach(mesa => {
      console.log(`- Mesa ${mesa.numero}: ${mesa.capacidad} personas (ID: ${mesa.id})`);
    });
    
    res.json(mesas);
  } catch (error) {
    console.error('❌ Error completo al obtener mesas disponibles:', error);
    res.status(500).json({ error: 'Error al obtener mesas disponibles', details: error.message });
  }
});

// Ruta de prueba simple
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Ruta de prueba llamada');
    res.json({ message: 'Ruta de mesas funcionando', timestamp: new Date() });
  } catch (error) {
    console.error('Error en ruta de prueba:', error);
    res.status(500).json({ error: 'Error en prueba' });
  }
});

// Obtener todas las mesas
router.get('/', autenticarToken, async (req, res) => {
  try {
    const mesas = await Mesa.findAll();
    res.json(mesas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
});

// Crear una nueva mesa
router.post('/', autenticarToken, async (req, res) => {
  try {
    const nuevaMesa = await Mesa.create(req.body);
    res.status(201).json(nuevaMesa);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al crear la mesa' });
  }
});

// Obtener una mesa por ID
router.get('/:id', autenticarToken, async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    if (mesa) {
      res.json(mesa);
    } else {
      res.status(404).json({ error: 'Mesa no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la mesa' });
  }
});

// Actualizar una mesa por ID
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    if (mesa) {
      await mesa.update(req.body);
      res.json(mesa);
    } else {
      res.status(404).json({ error: 'Mesa no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la mesa' });
  }
});

// Eliminar una mesa
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    if (mesa) {
      await mesa.destroy();
      res.json({ mensaje: 'Mesa eliminada' });
    } else {
      res.status(404).json({ error: 'Mesa no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la mesa' });
  }
});

module.exports = router;
