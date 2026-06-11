const pool = require('../config/database');
const { logActividad, getClientInfo } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// GET /api/productos
const getAll = async (req, res) => {
  try {
    const { categoria_id, activo, search, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT p.*, c.nombre as categoria_nombre, c.color as categoria_color
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.eliminado = 0
    `;
    const params = [];

    if (categoria_id) { query += ' AND p.categoria_id = ?'; params.push(categoria_id); }
    if (activo !== undefined) { query += ' AND p.activo = ?'; params.push(activo); }
    if (search) { query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY p.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [rows] = await pool.query(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM productos p WHERE p.eliminado = 0';
    const countParams = [];
    if (categoria_id) { countQuery += ' AND p.categoria_id = ?'; countParams.push(categoria_id); }
    if (activo !== undefined) { countQuery += ' AND p.activo = ?'; countParams.push(activo); }
    if (search) { countQuery += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)'; const s = `%${search}%`; countParams.push(s, s, s); }

    const [countRows] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};

// GET /api/productos/:id
const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ? AND p.eliminado = 0',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener producto' });
  }
};

// POST /api/productos
const create = async (req, res) => {
  const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, marca, codigo } = req.body;
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;
  const { ip } = getClientInfo(req);

  if (!nombre || !precio || !stock || !categoria_id) {
    return res.status(400).json({ success: false, message: 'Nombre, precio, stock y categoría son requeridos' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, categoria_id, imagen, marca, codigo) VALUES (?,?,?,?,?,?,?,?,?)',
      [nombre, descripcion || null, precio, stock, stock_minimo || 5, categoria_id, imagen, marca || null, codigo || null]
    );

    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Creó producto: ${nombre}`, modulo: 'Productos', ip });

    const [newProd] = await pool.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newProd[0], message: 'Producto creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

// PUT /api/productos/:id
const update = async (req, res) => {
  const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, marca, codigo, activo } = req.body;
  const { ip } = getClientInfo(req);

  try {
    const [existing] = await pool.query('SELECT * FROM productos WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    let imagen = existing[0].imagen;
    if (req.file) {
      // Delete old image
      if (imagen) {
        const oldPath = path.join(__dirname, '../../', imagen);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagen = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, stock_minimo=?, categoria_id=?, imagen=?, marca=?, codigo=?, activo=? WHERE id=?',
      [nombre || existing[0].nombre, descripcion ?? existing[0].descripcion, precio || existing[0].precio,
       stock ?? existing[0].stock, stock_minimo ?? existing[0].stock_minimo, categoria_id || existing[0].categoria_id,
       imagen, marca ?? existing[0].marca, codigo ?? existing[0].codigo, activo !== undefined ? activo : existing[0].activo,
       req.params.id]
    );

    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Actualizó producto: ${nombre || existing[0].nombre}`, modulo: 'Productos', ip });

    const [updated] = await pool.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: 'Producto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
};

// DELETE /api/productos/:id (eliminación lógica)
const remove = async (req, res) => {
  const { ip } = getClientInfo(req);
  try {
    const [existing] = await pool.query('SELECT * FROM productos WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    await pool.query('UPDATE productos SET eliminado = 1, eliminado_at = NOW(), activo = 0 WHERE id = ?', [req.params.id]);
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Eliminó producto: ${existing[0].nombre}`, modulo: 'Productos', ip });

    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
};

module.exports = { getAll, getById, create, update, remove };
