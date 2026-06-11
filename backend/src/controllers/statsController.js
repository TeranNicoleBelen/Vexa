const pool = require('../config/database');
const PDFDocument = require('pdfkit');

// GET /api/estadisticas/dashboard
const getDashboard = async (req, res) => {
  try {
    const [[totalVentas]] = await pool.query("SELECT COUNT(*) as total, SUM(total) as ingresos FROM pedidos WHERE estado != 'cancelado' AND eliminado = 0");
    const [[totalProductos]] = await pool.query('SELECT COUNT(*) as total FROM productos WHERE eliminado = 0 AND activo = 1');
    const [[totalClientes]] = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 3 AND eliminado = 0');
    const [[totalPendientes]] = await pool.query("SELECT COUNT(*) as total FROM pedidos WHERE estado = 'pendiente' AND eliminado = 0");
    const [productosTopVentas] = await pool.query('SELECT * FROM v_ventas_por_producto ORDER BY total_vendido DESC LIMIT 5');
    const [productosPocoStock] = await pool.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.stock <= p.stock_minimo AND p.eliminado = 0 ORDER BY p.stock ASC LIMIT 5');

    res.json({
      success: true,
      data: {
        totalVentas: totalVentas.total || 0,
        ingresos: totalVentas.ingresos || 0,
        totalProductos: totalProductos.total || 0,
        totalClientes: totalClientes.total || 0,
        totalPendientes: totalPendientes.total || 0,
        productosTopVentas,
        productosPocoStock
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

// GET /api/estadisticas/ventas-por-mes
const getVentasPorMes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        YEAR(created_at) as año,
        MONTH(created_at) as mes,
        DATE_FORMAT(created_at, '%b %Y') as label,
        COUNT(*) as total_pedidos,
        SUM(total) as ingresos
      FROM pedidos
      WHERE estado != 'cancelado' AND eliminado = 0
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY año, mes
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/estadisticas/productos-mas-vendidos
const getProductosMasVendidos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_ventas_por_producto ORDER BY total_vendido DESC LIMIT 10');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/estadisticas/clientes-top
const getClientesTop = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id, u.nombre, u.apellido, u.email,
        MONTH(pe.created_at) as mes,
        YEAR(pe.created_at) as año,
        COUNT(pe.id) as total_pedidos,
        SUM(pe.total) as total_compras
      FROM usuarios u
      JOIN pedidos pe ON u.id = pe.cliente_id
      WHERE pe.estado != 'cancelado' AND pe.eliminado = 0
      AND pe.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY u.id, MONTH(pe.created_at), YEAR(pe.created_at)
      ORDER BY total_compras DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/estadisticas/ventas-por-categoria
const getVentasPorCategoria = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.nombre as categoria,
        c.color,
        SUM(dp.cantidad) as total_vendido,
        SUM(dp.subtotal) as ingresos
      FROM categorias c
      JOIN productos p ON c.id = p.categoria_id
      JOIN detalle_pedidos dp ON p.id = dp.producto_id
      JOIN pedidos pe ON dp.pedido_id = pe.id AND pe.estado != 'cancelado'
      WHERE c.eliminado = 0
      GROUP BY c.id, c.nombre, c.color
      ORDER BY total_vendido DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/logs/acceso
const getLogsAcceso = async (req, res) => {
  try {
    const { page = 1, limit = 50, evento } = req.query;
    let q = 'SELECT la.*, u.nombre, u.apellido FROM log_acceso la LEFT JOIN usuarios u ON la.usuario_id = u.id WHERE 1=1';
    const params = [];
    if (evento) { q += ' AND la.evento = ?'; params.push(evento); }
    q += ` ORDER BY la.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/logs/actividad
const getLogsActividad = async (req, res) => {
  try {
    const { page = 1, limit = 50, modulo } = req.query;
    let q = 'SELECT * FROM log_actividad WHERE 1=1';
    const params = [];
    if (modulo) { q += ' AND modulo = ?'; params.push(modulo); }
    q += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/reportes/pedido/:id
const reportePedidoPDF = async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      'SELECT pe.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id WHERE pe.id = ?',
      [req.params.id]
    );
    if (pedidos.length === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    const pedido = pedidos[0];
    const [detalles] = await pool.query(
      'SELECT dp.*, p.nombre as producto_nombre FROM detalle_pedidos dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = ?',
      [req.params.id]
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-vexa-${pedido.codigo_pedido}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(28).fillColor('#E8637A').text('VEXA', { align: 'center' });
    doc.fontSize(12).fillColor('#666').text('Tienda de Limpieza & Belleza', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#999').text('Mercado Ciudad Satélite, El Alto, Bolivia | Tel: +591 60612998 | +591 73503017', { align: 'center' });
    doc.moveDown();

    // Línea separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#FFB6C1').lineWidth(2).stroke();
    doc.moveDown();

    // Info pedido
    doc.fontSize(16).fillColor('#333').text(`TICKET DE PEDIDO`, { align: 'center' });
    doc.fontSize(12).fillColor('#E8637A').text(`Código: ${pedido.codigo_pedido}`, { align: 'center' });
    doc.moveDown();

    const col1 = 50, col2 = 300;
    doc.fontSize(10).fillColor('#333');
    doc.text(`Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`, col1);
    doc.text(`Email: ${pedido.cliente_email}`, col1);
    doc.text(`Fecha: ${new Date(pedido.created_at).toLocaleString('es-BO')}`, col1);
    doc.text(`Método de pago: ${pedido.metodo_pago.toUpperCase()}`, col2, doc.y - 30);
    doc.text(`Tipo entrega: ${pedido.tipo_entrega.toUpperCase()}`, col2);
    doc.text(`Estado: ${pedido.estado.toUpperCase()}`, col2);
    doc.moveDown();

    if (pedido.tipo_entrega === 'envio') {
      doc.fontSize(10).fillColor('#333');
      doc.text(`Dirección: ${pedido.direccion_envio || '-'}`, col1);
      doc.text(`Ciudad: ${pedido.ciudad || '-'} | Zona: ${pedido.zona || '-'}`, col1);
      doc.text(`Referencia: ${pedido.referencia || '-'}`, col1);
      doc.moveDown();
    } else {
      doc.fontSize(10).fillColor('#E8637A').text('Retiro en tienda: Av. Principal 123, La Paz', col1);
      doc.moveDown();
    }

    // Tabla de productos
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#FFB6C1').lineWidth(1).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#E8637A');
    doc.text('Producto', 50, doc.y, { width: 220 });
    doc.text('Cant.', 280, doc.y - 12, { width: 60, align: 'center' });
    doc.text('Precio', 350, doc.y - 12, { width: 90, align: 'right' });
    doc.text('Subtotal', 450, doc.y - 12, { width: 90, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#DDD').lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    detalles.forEach(det => {
      doc.fontSize(9).fillColor('#333');
      const y = doc.y;
      doc.text(det.producto_nombre, 50, y, { width: 220 });
      doc.text(det.cantidad.toString(), 280, y, { width: 60, align: 'center' });
      doc.text(`Bs ${parseFloat(det.precio_unitario).toFixed(2)}`, 350, y, { width: 90, align: 'right' });
      doc.text(`Bs ${parseFloat(det.subtotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      doc.moveDown(0.7);
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#FFB6C1').lineWidth(1).stroke();
    doc.moveDown(0.5);

    const y = doc.y;
    doc.fontSize(10).fillColor('#333');
    doc.text(`Subtotal:`, 350, y, { width: 90, align: 'right' });
    doc.text(`Bs ${parseFloat(pedido.subtotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    doc.moveDown(0.4);
    doc.text(`Costo envío:`, 350, doc.y, { width: 90, align: 'right' });
    doc.text(`Bs ${parseFloat(pedido.costo_envio).toFixed(2)}`, 450, doc.y - 12, { width: 90, align: 'right' });
    doc.moveDown(0.4);
    doc.fontSize(13).fillColor('#E8637A');
    doc.text(`TOTAL:`, 350, doc.y, { width: 90, align: 'right' });
    doc.text(`Bs ${parseFloat(pedido.total).toFixed(2)}`, 450, doc.y - 15, { width: 90, align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#999').text('Gracias por tu compra en VEXA ♥', { align: 'center' });
    doc.fontSize(8).text('terannicole06@gmail.com | vexa.com.bo', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al generar reporte' });
  }
};

// GET /api/reportes/ventas
const reporteVentasPDF = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT pe.codigo_pedido, pe.total, pe.estado, pe.metodo_pago, pe.tipo_entrega,
             DATE_FORMAT(pe.created_at, '%d/%m/%Y %H:%i') as fecha,
             u.nombre, u.apellido, u.email
      FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id
      WHERE pe.eliminado = 0 ORDER BY pe.created_at DESC LIMIT 100
    `);

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas-vexa.pdf');
    doc.pipe(res);

    doc.fontSize(22).fillColor('#E8637A').text('VEXA', { align: 'center' });
    doc.fontSize(14).fillColor('#333').text('Reporte de Ventas', { align: 'center' });
    doc.fontSize(10).fillColor('#999').text(`Generado: ${new Date().toLocaleString('es-BO')}`, { align: 'center' });
    doc.moveDown();

    const headers = ['Código', 'Cliente', 'Email', 'Total (Bs)', 'Pago', 'Estado', 'Fecha'];
    const widths = [80, 100, 150, 70, 60, 80, 110];
    let x = 30;
    headers.forEach((h, i) => {
      doc.fontSize(9).fillColor('#E8637A').text(h, x, doc.y, { width: widths[i] });
      x += widths[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(30, doc.y).lineTo(760, doc.y).strokeColor('#FFB6C1').stroke();
    doc.moveDown(0.5);

    ventas.forEach(v => {
      x = 30;
      const y = doc.y;
      const row = [v.codigo_pedido, `${v.nombre} ${v.apellido}`, v.email, parseFloat(v.total).toFixed(2), v.metodo_pago, v.estado, v.fecha];
      row.forEach((cell, i) => {
        doc.fontSize(7).fillColor('#333').text(cell || '-', x, y, { width: widths[i] - 2 });
        x += widths[i];
      });
      doc.moveDown(0.6);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// GET /api/carrito
const getCarrito = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, p.nombre, p.precio, p.imagen, p.stock FROM carrito c JOIN productos p ON c.producto_id = p.id WHERE c.usuario_id = ?',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const addToCarrito = async (req, res) => {
  const { producto_id, cantidad = 1 } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?', [req.user.id, producto_id]);
    if (existing.length > 0) {
      await pool.query('UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND producto_id = ?', [cantidad, req.user.id, producto_id]);
    } else {
      await pool.query('INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?,?,?)', [req.user.id, producto_id, cantidad]);
    }
    res.json({ success: true, message: 'Producto agregado al carrito' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const updateCarrito = async (req, res) => {
  const { cantidad } = req.body;
  try {
    if (cantidad <= 0) {
      await pool.query('DELETE FROM carrito WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
    } else {
      await pool.query('UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?', [cantidad, req.params.id, req.user.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const removeFromCarrito = async (req, res) => {
  try {
    await pool.query('DELETE FROM carrito WHERE id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

module.exports = {
  getDashboard, getVentasPorMes, getProductosMasVendidos, getClientesTop, getVentasPorCategoria,
  getLogsAcceso, getLogsActividad, reportePedidoPDF, reporteVentasPDF,
  getCarrito, addToCarrito, updateCarrito, removeFromCarrito
};
