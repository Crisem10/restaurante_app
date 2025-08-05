create schema restaurante;

/*Tabla usuarios*/
CREATE TABLE if not exists restaurante.usuarios(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    contrasena TEXT NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente' -- puede ser 'cliente' o 'admin'
);


/*Tabla Productos*/
CREATE TABLE if not exists restaurante.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ingredientes TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen TEXT -- URL de la imagen del producto
);

-- Tabla Reservas
CREATE TABLE IF NOT EXISTS restaurante.reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES restaurante.usuarios(id),
    mesa_id INTERGER REFERENCES restaurante.mesas(id),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    personas INTEGER NOT NULL,
    preferencias_asiento TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' -- pendiente, confirmada, cancelada
);

/*Tabla Pagos*/
CREATE table if not exists restaurante.pagos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES restaurante.usuarios(id),
    reserva_id INTEGER REFERENCES restaurante.reservas(id),
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50), -- ejemplo: 'tarjeta', 'transferencia'
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagado, fallido
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*Carrito*/
CREATE TABLE if not exists restaurante.carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES restaurante.usuarios(id),si
    producto_id INTEGER REFERENCES restaurante.productos(id),
    cantidad INTEGER NOT NULL DEFAULT 1
);

/*Promociones*/
CREATE TABLE if not exists restaurante.promociones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100),
    descripcion TEXT,
    descuento_porcentaje INTEGER, -- ej: 10 = 10%
    fecha_inicio DATE,
    fecha_fin DATE
);

-- se anadio la columna mesa_id
ALTER TABLE restaurante.reservas
ADD COLUMN mesa_id INTEGER REFERENCES restaurante.mesas(id);

SELECT * FROM restaurante.mesas;
SELECT * FROM restaurante.pagos;
SELECT * FROM restaurante.usuarios;
SELECT * FROM restaurante.reservas;

SELECT * FROM restaurante.reservas WHERE id = 1;

--se anade la columna fecha_pago
ALTER TABLE restaurante.pagos
ADD COLUMN fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE restaurante.pagos RENAME COLUMN estado TO estado_pago;
ALTER TABLE restaurante.pagos RENAME COLUMN fecha TO fecha_pago;

SELECT id, reserva_id, metodo_pago, monto, estado_pago, fecha_pago
FROM restaurante.pagos
WHERE metodo_pago = 'payphone'
ORDER BY fecha_pago DESC;