const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar el usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
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

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en login:', error);  // <-- Aquí el detalle
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;
