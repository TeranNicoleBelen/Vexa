const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authCtrl = require('../controllers/authController');
const prodCtrl = require('../controllers/productosController');
const catCtrl = require('../controllers/categoriasController');
const pedCtrl = require('../controllers/pedidosController');
const userCtrl = require('../controllers/usuariosController');
const statsCtrl = require('../controllers/statsController');

// ============ AUTH ============
router.get('/auth/captcha', authCtrl.getCaptcha);
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.post('/auth/logout', verifyToken, authCtrl.logout);
router.get('/auth/me', verifyToken, authCtrl.getMe);
router.post('/auth/check-password', authCtrl.checkPassword);

// ============ CATEGORÍAS ============
router.get('/categorias', catCtrl.getAll);
router.get('/categorias/:id', catCtrl.getById);
router.post('/categorias', verifyToken, requireRole('admin', 'vendedor'), upload.single('imagen'), catCtrl.create);
router.put('/categorias/:id', verifyToken, requireRole('admin', 'vendedor'), upload.single('imagen'), catCtrl.update);
router.delete('/categorias/:id', verifyToken, requireRole('admin'), catCtrl.remove);

// ============ PRODUCTOS ============
router.get('/productos', prodCtrl.getAll);
router.get('/productos/:id', prodCtrl.getById);
router.post('/productos', verifyToken, requireRole('admin', 'vendedor'), upload.single('imagen'), prodCtrl.create);
router.put('/productos/:id', verifyToken, requireRole('admin', 'vendedor'), upload.single('imagen'), prodCtrl.update);
router.delete('/productos/:id', verifyToken, requireRole('admin'), prodCtrl.remove);

// ============ PEDIDOS ============
router.get('/pedidos', verifyToken, pedCtrl.getAll);
router.get('/pedidos/:id', verifyToken, pedCtrl.getById);
router.post('/pedidos', verifyToken, pedCtrl.create);
router.put('/pedidos/:id/estado', verifyToken, requireRole('admin', 'vendedor'), pedCtrl.updateEstado);
router.delete('/pedidos/:id', verifyToken, requireRole('admin'), pedCtrl.remove);

// ============ CARRITO ============
router.get('/carrito', verifyToken, statsCtrl.getCarrito);
router.post('/carrito', verifyToken, statsCtrl.addToCarrito);
router.put('/carrito/:id', verifyToken, statsCtrl.updateCarrito);
router.delete('/carrito/:id', verifyToken, statsCtrl.removeFromCarrito);

// ============ USUARIOS ============
router.get('/usuarios', verifyToken, requireRole('admin'), userCtrl.getAll);
router.get('/usuarios/:id', verifyToken, requireRole('admin'), userCtrl.getById);
router.post('/usuarios', verifyToken, requireRole('admin'), userCtrl.create);
router.put('/usuarios/:id', verifyToken, requireRole('admin'), userCtrl.update);
router.delete('/usuarios/:id', verifyToken, requireRole('admin'), userCtrl.remove);

// ============ ESTADÍSTICAS ============
router.get('/estadisticas/dashboard', verifyToken, requireRole('admin', 'vendedor'), statsCtrl.getDashboard);
router.get('/estadisticas/ventas-por-mes', verifyToken, requireRole('admin', 'vendedor'), statsCtrl.getVentasPorMes);
router.get('/estadisticas/productos-mas-vendidos', verifyToken, requireRole('admin', 'vendedor'), statsCtrl.getProductosMasVendidos);
router.get('/estadisticas/clientes-top', verifyToken, requireRole('admin', 'vendedor'), statsCtrl.getClientesTop);
router.get('/estadisticas/ventas-por-categoria', verifyToken, requireRole('admin', 'vendedor'), statsCtrl.getVentasPorCategoria);

// ============ LOGS ============
router.get('/logs/acceso', verifyToken, requireRole('admin'), statsCtrl.getLogsAcceso);
router.get('/logs/actividad', verifyToken, requireRole('admin'), statsCtrl.getLogsActividad);

// ============ REPORTES PDF ============
router.get('/reportes/pedido/:id', verifyToken, statsCtrl.reportePedidoPDF);
router.get('/reportes/ventas', verifyToken, requireRole('admin', 'vendedor'), statsCtrl.reporteVentasPDF);

module.exports = router;
