function esAdmin(req, res, next) {
  if (req.usuario && req.usuario.rol === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso solo para administradores' });
}

module.exports = esAdmin;
