const pool = require('../config/database');
const { logActividad, getClientInfo } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const generateCode = () => 'VX-' + Date.now().toString().slice(-8);

const getAll = async (req, res) => {
  try {
    const { estado, cliente_id, page = 1, limit = 20 } = req.query;
    const user = req.user;
    let q = `
      SELECT pe.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email
      FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id
      WHERE pe.eliminado = 0
    `;
    const params = [];
    if (user.rol_nombre === 'cliente') { q += ' AND pe.cliente_id = ?'; params.push(user.id); }
    if (estado) { q += ' AND pe.estado = ?'; params.push(estado); }
    if (cliente_id && user.rol_nombre !== 'cliente') { q += ' AND pe.cliente_id = ?'; params.push(cliente_id); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    q += ` ORDER BY pe.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
  }
};

const getById = async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      'SELECT pe.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email, u.telefono as cliente_telefono FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id WHERE pe.id = ? AND pe.eliminado = 0',
      [req.params.id]
    );
    if (pedidos.length === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    const pedido = pedidos[0];
    if (req.user.rol_nombre === 'cliente' && pedido.cliente_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const [detalles] = await pool.query(
      'SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen FROM detalle_pedidos dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = ?',
      [req.params.id]
    );

    res.json({ success: true, data: { ...pedido, detalles } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener pedido' });
  }
};

const create = async (req, res) => {
  const { items, metodo_pago, tipo_entrega, direccion_envio, ciudad, zona, referencia, telefono_contacto, notas } = req.body;
  const { ip } = getClientInfo(req);

  if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'El carrito está vacío' });
  if (!metodo_pago || !tipo_entrega) return res.status(400).json({ success: false, message: 'Método de pago y tipo de entrega son requeridos' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let subtotal = 0;
    const detalles = [];

    for (const item of items) {
      const [prods] = await conn.query('SELECT * FROM productos WHERE id = ? AND activo = 1 AND eliminado = 0', [item.producto_id]);
      if (prods.length === 0) throw new Error(`Producto ${item.producto_id} no disponible`);
      const prod = prods[0];
      if (prod.stock < item.cantidad) throw new Error(`Stock insuficiente para ${prod.nombre}`);
      const sub = prod.precio * item.cantidad;
      subtotal += sub;
      detalles.push({ producto_id: item.producto_id, cantidad: item.cantidad, precio_unitario: prod.precio, subtotal: sub });
    }

    const costo_envio = (tipo_entrega === 'envio' && subtotal < 200) ? 15 : 0;
    const total = subtotal + costo_envio;
    const codigo = generateCode();

    const [result] = await conn.query(
      'INSERT INTO pedidos (cliente_id, total, subtotal, costo_envio, metodo_pago, tipo_entrega, estado, direccion_envio, ciudad, zona, referencia, telefono_contacto, notas, codigo_pedido) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, total, subtotal, costo_envio, metodo_pago, tipo_entrega, 'pendiente', direccion_envio || null, ciudad || null, zona || null, referencia || null, telefono_contacto || null, notas || null, codigo]
    );

    for (const det of detalles) {
      await conn.query(
        'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [result.insertId, det.producto_id, det.cantidad, det.precio_unitario, det.subtotal]
      );
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [det.cantidad, det.producto_id]);
    }

    // Limpiar carrito
    await conn.query('DELETE FROM carrito WHERE usuario_id = ?', [req.user.id]);

    await conn.commit();
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Creó pedido: ${codigo}`, modulo: 'Pedidos', ip });

    res.status(201).json({ success: true, data: { id: result.insertId, codigo, total }, message: 'Pedido creado exitosamente' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Error al crear pedido' });
  } finally {
    conn.release();
  }
};

const updateEstado = async (req, res) => {
  const { estado } = req.body;
  const { ip } = getClientInfo(req);
  const estados = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];

  if (!estados.includes(estado)) return res.status(400).json({ success: false, message: 'Estado inválido' });

  try {
    const [existing] = await pool.query('SELECT * FROM pedidos WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Actualizó estado pedido #${req.params.id} a: ${estado}`, modulo: 'Pedidos', ip });

    res.json({ success: true, message: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const remove = async (req, res) => {
  const { ip } = getClientInfo(req);
  try {
    await pool.query('UPDATE pedidos SET eliminado = 1, eliminado_at = NOW() WHERE id = ?', [req.params.id]);
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Eliminó pedido #${req.params.id}`, modulo: 'Pedidos', ip });
    res.json({ success: true, message: 'Pedido eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

module.exports = { getAll, getById, create, updateEstado, remove };
