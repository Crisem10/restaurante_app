const jwt = require('jsonwebtoken');


function autenticarToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.usuario = usuario; // guardamos el usuario decodificado
    next();
  });
}

module.exports = autenticarToken;