const express = require('express');
const router = express.Router();
const Menu = require('../models/menu');
const autenticarToken = require('../middleware/auth');
const esAdmin = require('../middleware/admin');

// Listar todos los menús (público)
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener menús' });
  }
});

// Crear nuevo menú (solo admin)
router.post('/', autenticarToken, esAdmin, async (req, res) => {
  try {
    const nuevo = await Menu.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el menú' });
  }
});

// Obtener un menú por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (menu) res.json(menu);
    else res.status(404).json({ error: 'Menú no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el menú' });
  }
});

// Actualizar menú (solo admin)
router.put('/:id', autenticarToken, esAdmin, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (menu) {
      await menu.update(req.body);
      res.json(menu);
    } else res.status(404).json({ error: 'Menú no encontrado' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el menú' });
  }
});

// Eliminar menú (solo admin)
router.delete('/:id', autenticarToken, esAdmin, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (menu) {
      await menu.destroy();
      res.json({ mensaje: 'Menú eliminado' });
    } else res.status(404).json({ error: 'Menú no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el menú' });
  }
});

module.exports = router;
