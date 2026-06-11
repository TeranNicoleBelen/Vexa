-- =============================================
-- VEXA - Base de Datos
-- =============================================
CREATE DATABASE IF NOT EXISTS vexa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vexa_db;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema'),
('vendedor', 'Vendedor de la tienda'),
('cliente', 'Cliente de la tienda')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  rol_id INT NOT NULL DEFAULT 3,
  avatar VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  eliminado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Admin por defecto (password: Admin@Vexa2024)
INSERT INTO usuarios (uuid, nombre, apellido, email, password, rol_id) VALUES
(UUID(), 'Admin', 'VEXA', 'admin@vexa.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewCOYz6TtxMQJqhN8/', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255),
  slug VARCHAR(100) UNIQUE,
  activo TINYINT(1) DEFAULT 1,
  eliminado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categorias (nombre, descripcion, slug) VALUES
('Limpieza del Hogar', 'Productos para limpiar y desinfectar tu hogar', 'limpieza-hogar'),
('Cuidado Personal', 'Productos para el cuidado e higiene personal', 'cuidado-personal'),
('Belleza y Maquillaje', 'Cosméticos y productos de belleza', 'belleza-maquillaje'),
('Aromaterapia', 'Velas, aromas y ambientadores', 'aromaterapia'),
('Cuidado del Cabello', 'Shampoos, acondicionadores y tratamientos', 'cuidado-cabello'),
('Skincare', 'Cremas, sueros y cuidado de la piel', 'skincare')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  precio_oferta DECIMAL(10,2),
  stock INT NOT NULL DEFAULT 0,
  categoria_id INT NOT NULL,
  imagen VARCHAR(255),
  imagenes JSON,
  marca VARCHAR(100),
  codigo_barras VARCHAR(50),
  activo TINYINT(1) DEFAULT 1,
  eliminado TINYINT(1) DEFAULT 0,
  destacado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  usuario_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  costo_envio DECIMAL(10,2) DEFAULT 0,
  estado ENUM('pendiente','confirmado','preparando','enviado','entregado','cancelado') DEFAULT 'pendiente',
  tipo_pago ENUM('tarjeta','qr','efectivo') NOT NULL,
  tipo_entrega ENUM('envio','recojo') NOT NULL,
  direccion_envio TEXT,
  ciudad VARCHAR(100),
  zona VARCHAR(100),
  referencia TEXT,
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  notas TEXT,
  eliminado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de log de accesos
CREATE TABLE IF NOT EXISTS logs_acceso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  email VARCHAR(150),
  ip VARCHAR(45),
  evento ENUM('ingreso','salida','registro','compra','accion') NOT NULL,
  descripcion TEXT,
  browser VARCHAR(200),
  sistema_operativo VARCHAR(100),
  fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_carrito (usuario_id, producto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Productos de ejemplo
INSERT INTO productos (uuid, nombre, descripcion, precio, stock, categoria_id, marca, destacado) VALUES
(UUID(), 'Jabón Líquido Lavanda', 'Jabón líquido antibacterial con aroma a lavanda 500ml', 25.00, 100, 1, 'CleanPro', 1),
(UUID(), 'Desinfectante Multiusos', 'Desinfectante para superficies 1L, elimina el 99.9% de bacterias', 35.00, 80, 1, 'HygieneX', 1),
(UUID(), 'Crema Corporal Rosa', 'Crema hidratante corporal con extracto de rosa 300ml', 55.00, 60, 2, 'BellaSkin', 1),
(UUID(), 'Shampoo Nutritivo', 'Shampoo con keratina y aceite de argán 400ml', 45.00, 75, 5, 'HairLux', 1),
(UUID(), 'Kit de Maquillaje Natural', 'Set de maquillaje orgánico con acabado natural', 120.00, 30, 3, 'NaturGlow', 1),
(UUID(), 'Vela Aromática Vainilla', 'Vela de soya con aroma vainilla, duración 40hrs', 40.00, 50, 4, 'AromaZen', 0),
(UUID(), 'Sérum Vitamina C', 'Sérum antiedad con vitamina C al 20%', 85.00, 40, 6, 'PureSkin', 1),
(UUID(), 'Limpiador de Pisos', 'Limpiador concentrado para pisos duros 2L', 28.00, 120, 1, 'CleanPro', 0)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Vista para estadísticas de ventas
CREATE OR REPLACE VIEW vista_ventas_productos AS
SELECT 
  p.id,
  p.nombre,
  p.precio,
  c.nombre AS categoria,
  COALESCE(SUM(dp.cantidad), 0) AS total_vendido,
  COALESCE(SUM(dp.subtotal), 0) AS total_ingresos,
  COUNT(DISTINCT dp.pedido_id) AS num_pedidos
FROM productos p
LEFT JOIN detalle_pedidos dp ON p.id = dp.producto_id
LEFT JOIN pedidos ped ON dp.pedido_id = ped.id AND ped.estado != 'cancelado'
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.eliminado = 0
GROUP BY p.id, p.nombre, p.precio, c.nombre;

-- Vista para top clientes
CREATE OR REPLACE VIEW vista_top_clientes AS
SELECT 
  u.id,
  u.nombre,
  u.apellido,
  u.email,
  COUNT(DISTINCT ped.id) AS total_pedidos,
  COALESCE(SUM(ped.total), 0) AS total_gastado,
  MAX(ped.created_at) AS ultima_compra
FROM usuarios u
LEFT JOIN pedidos ped ON u.id = ped.usuario_id AND ped.estado != 'cancelado' AND ped.eliminado = 0
WHERE u.eliminado = 0 AND u.rol_id = 3
GROUP BY u.id, u.nombre, u.apellido, u.email;
