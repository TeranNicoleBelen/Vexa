-- IMPORTANTE: Después de importar este SQL, ejecutar:
-- node database/reset_passwords.js
-- Esto generará los hashes reales de contraseñas.
--
-- ============================================
-- VEXA - Base de Datos
-- Sistema de Tienda de Artículos de Limpieza y Belleza
-- ============================================

CREATE DATABASE IF NOT EXISTS vexa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vexa_db;

-- ============================================
-- TABLA: roles
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema con acceso total'),
('vendedor', 'Vendedor con acceso a ventas y productos'),
('cliente', 'Cliente con acceso a tienda y compras');

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT NOT NULL DEFAULT 3,
    avatar VARCHAR(500),
    activo TINYINT(1) DEFAULT 1,
    eliminado TINYINT(1) DEFAULT 0,
    eliminado_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Usuario admin por defecto (password: Admin@123)
INSERT INTO usuarios (nombre, apellido, email, password, rol_id) VALUES
('Admin', 'VEXA', 'admin@vexa.com', 'PLACEHOLDER_RUN_RESET_SCRIPT', 1),
('Carlos', 'Vendedor', 'vendedor@vexa.com', 'PLACEHOLDER_RUN_RESET_SCRIPT', 2),
('Maria', 'Cliente', 'cliente@vexa.com', 'PLACEHOLDER_RUN_RESET_SCRIPT', 3);

-- ============================================
-- TABLA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500),
    color VARCHAR(20) DEFAULT '#FFB6C1',
    activo TINYINT(1) DEFAULT 1,
    eliminado TINYINT(1) DEFAULT 0,
    eliminado_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categorias (nombre, descripcion, color) VALUES
('Limpieza del Hogar', 'Productos para limpiar y desinfectar tu hogar', '#FFB6C1'),
('Cuidado Personal', 'Productos para el cuidado e higiene personal', '#FF8C69'),
('Belleza', 'Cosméticos y productos de belleza', '#FFD1DC'),
('Cabello', 'Shampoos, acondicionadores y tratamientos capilares', '#FFC0CB'),
('Skin Care', 'Cuidado y tratamiento de la piel', '#FFDAB9'),
('Fragancias', 'Perfumes y desodorantes', '#FFE4E1');

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    categoria_id INT NOT NULL,
    imagen VARCHAR(500),
    codigo VARCHAR(50) UNIQUE,
    marca VARCHAR(100),
    activo TINYINT(1) DEFAULT 1,
    eliminado TINYINT(1) DEFAULT 0,
    eliminado_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, marca, codigo) VALUES
('Detergente Líquido Ariel 1L', 'Detergente concentrado para ropa, elimina manchas difíciles', 45.00, 100, 1, 'Ariel', 'PROD-001'),
('Cloro Multiusos 2L', 'Cloro desinfectante para superficies del hogar', 18.50, 150, 1, 'Clorox', 'PROD-002'),
('Jabón de Tocador Dove', 'Jabón cremoso con 1/4 de crema hidratante', 12.00, 200, 2, 'Dove', 'PROD-003'),
('Shampoo Pantene Pro-V', 'Shampoo para cabello dañado, con proteínas', 35.00, 80, 4, 'Pantene', 'PROD-004'),
('Crema Hidratante Nivea', 'Crema corporal hidratación intensa 400ml', 55.00, 60, 5, 'Nivea', 'PROD-005'),
('Perfume Floral 50ml', 'Fragancia floral con notas de rosa y jazmín', 120.00, 40, 6, 'VEXA', 'PROD-006'),
('Limpiavidrios Cristal', 'Limpiador para vidrios y superficies brillantes', 22.00, 120, 1, 'Cristal', 'PROD-007'),
('Crema BB Maybelline', 'Base BB cream cobertura media FPS15', 85.00, 50, 3, 'Maybelline', 'PROD-008'),
('Acondicionador Sedal', 'Acondicionador nutritivo para cabello seco', 28.00, 90, 4, 'Sedal', 'PROD-009'),
('Gel Antibacterial 500ml', 'Gel desinfectante para manos con aloe vera', 25.00, 300, 2, 'VEXA', 'PROD-010');

-- ============================================
-- TABLA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    metodo_pago ENUM('qr', 'tarjeta', 'efectivo') NOT NULL,
    tipo_entrega ENUM('envio', 'recogida') NOT NULL,
    estado ENUM('pendiente','confirmado','en_proceso','enviado','entregado','cancelado') DEFAULT 'pendiente',
    direccion_envio TEXT,
    ciudad VARCHAR(100),
    zona VARCHAR(100),
    referencia TEXT,
    telefono_contacto VARCHAR(20),
    notas TEXT,
    codigo_pedido VARCHAR(20) UNIQUE,
    activo TINYINT(1) DEFAULT 1,
    eliminado TINYINT(1) DEFAULT 0,
    eliminado_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABLA: detalle_pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- ============================================
-- TABLA: log_acceso
-- ============================================
CREATE TABLE IF NOT EXISTS log_acceso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    email VARCHAR(150),
    ip VARCHAR(50),
    evento ENUM('ingreso', 'salida', 'registro', 'intento_fallido', 'cambio_password') NOT NULL,
    browser VARCHAR(200),
    sistema_operativo VARCHAR(100),
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- TABLA: log_actividad
-- ============================================
CREATE TABLE IF NOT EXISTS log_actividad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    email VARCHAR(150),
    rol VARCHAR(50),
    accion VARCHAR(200) NOT NULL,
    modulo VARCHAR(100),
    detalle TEXT,
    ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- TABLA: carrito
-- ============================================
CREATE TABLE IF NOT EXISTS carrito (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    UNIQUE KEY unique_carrito (usuario_id, producto_id)
);

-- ============================================
-- TABLA: reseñas
-- ============================================
CREATE TABLE IF NOT EXISTS resenas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- VISTAS ÚTILES
-- ============================================
CREATE OR REPLACE VIEW v_ventas_por_producto AS
SELECT 
    p.id,
    p.nombre,
    p.imagen,
    c.nombre AS categoria,
    SUM(dp.cantidad) AS total_vendido,
    SUM(dp.subtotal) AS total_ingresos,
    COUNT(DISTINCT pe.id) AS num_pedidos
FROM productos p
LEFT JOIN detalle_pedidos dp ON p.id = dp.producto_id
LEFT JOIN pedidos pe ON dp.pedido_id = pe.id AND pe.estado != 'cancelado'
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.eliminado = 0
GROUP BY p.id, p.nombre, p.imagen, c.nombre;

CREATE OR REPLACE VIEW v_clientes_top AS
SELECT 
    u.id,
    u.nombre,
    u.apellido,
    u.email,
    COUNT(pe.id) AS total_pedidos,
    SUM(pe.total) AS total_compras,
    MAX(pe.created_at) AS ultima_compra
FROM usuarios u
LEFT JOIN pedidos pe ON u.id = pe.cliente_id AND pe.estado != 'cancelado'
WHERE u.rol_id = 3 AND u.eliminado = 0
GROUP BY u.id, u.nombre, u.apellido, u.email;
