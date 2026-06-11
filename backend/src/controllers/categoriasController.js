const pool = require('../config/database');
const { logActividad, getClientInfo } = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const { activo } = req.query;
    let q = 'SELECT c.*, COUNT(p.id) as total_productos FROM categorias c LEFT JOIN productos p ON c.id = p.categoria_id AND p.eliminado = 0 WHERE c.eliminado = 0';
    const params = [];
    if (activo !== undefined) { q += ' AND c.activo = ?'; params.push(activo); }
    q += ' GROUP BY c.id ORDER BY c.nombre';
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const create = async (req, res) => {
  const { nombre, descripcion, color } = req.body;
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;
  const { ip } = getClientInfo(req);

  if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es requerido' });

  try {
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion, imagen, color) VALUES (?,?,?,?)',
      [nombre, descripcion || null, imagen, color || '#FFB6C1']
    );
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Creó categoría: ${nombre}`, modulo: 'Categorías', ip });
    const [newCat] = await pool.query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newCat[0], message: 'Categoría creada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear categoría' });
  }
};

const update = async (req, res) => {
  const { nombre, descripcion, color, activo } = req.body;
  const { ip } = getClientInfo(req);
  try {
    const [existing] = await pool.query('SELECT * FROM categorias WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

    let imagen = existing[0].imagen;
    if (req.file) imagen = `/uploads/${req.file.filename}`;

    await pool.query(
      'UPDATE categorias SET nombre=?, descripcion=?, imagen=?, color=?, activo=? WHERE id=?',
      [nombre || existing[0].nombre, descripcion ?? existing[0].descripcion, imagen,
       color || existing[0].color, activo !== undefined ? activo : existing[0].activo, req.params.id]
    );
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Actualizó categoría: ${nombre}`, modulo: 'Categorías', ip });
    const [updated] = await pool.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0], message: 'Categoría actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
};

const remove = async (req, res) => {
  const { ip } = getClientInfo(req);
  try {
    const [existing] = await pool.query('SELECT * FROM categorias WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    await pool.query('UPDATE categorias SET eliminado = 1, eliminado_at = NOW() WHERE id = ?', [req.params.id]);
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Eliminó categoría: ${existing[0].nombre}`, modulo: 'Categorías', ip });
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
};

module.exports = { getAll, getById, create, update, remove };
