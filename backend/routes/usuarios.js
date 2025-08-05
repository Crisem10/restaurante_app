
const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const autenticarToken = require('../middleware/auth');
const esAdmin = require('../middleware/admin');

// ENDPOINT DE DEBUG - Verificar usuarios en DB
router.get('/debug/all', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'correo', 'rol']
    });
    res.json({
      total: usuarios.length,
      usuarios: usuarios
    });
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener datos del usuario autenticado
router.get('/me', autenticarToken, async (req, res) => {
  try {
    // Suponiendo que el middleware agrega req.usuarioId
    const usuario = await Usuario.findByPk(req.usuarioId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Devuelve todos los datos relevantes del usuario
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Obtener perfil del usuario autenticado (alias de /me)
router.get('/perfil', autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Registro de usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol: rol || 'cliente'
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar el usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  console.log('req.body:', req.body);  // <-- Aquí

  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const valida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!valida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ mensaje: 'Login exitoso', token, usuario });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Listar usuarios (solo admin)
router.get('/', autenticarToken, esAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Actualizar usuario (solo admin)
router.put('/:id', autenticarToken, esAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contrasena } = req.body;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    await usuario.update({
      nombre,
      correo,
      contrasena: hashedPassword,
    });

    res.json({ mensaje: 'Usuario actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', autenticarToken, esAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
