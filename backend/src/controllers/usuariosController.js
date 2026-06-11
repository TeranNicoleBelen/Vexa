const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { logActividad, getClientInfo } = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const { rol_id, activo, search } = req.query;
    let q = 'SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo, u.eliminado, u.created_at, u.avatar, r.nombre as rol_nombre, u.rol_id FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.eliminado = 0';
    const params = [];
    if (rol_id) { q += ' AND u.rol_id = ?'; params.push(rol_id); }
    if (activo !== undefined) { q += ' AND u.activo = ?'; params.push(activo); }
    if (search) { q += ' AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
    q += ' ORDER BY u.created_at DESC';
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo, u.avatar, r.nombre as rol_nombre, u.rol_id, u.created_at FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ? AND u.eliminado = 0', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const create = async (req, res) => {
  const { nombre, apellido, email, password, telefono, rol_id } = req.body;
  const { ip } = getClientInfo(req);

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos requeridos' });
  }

  try {
    const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length > 0) return res.status(409).json({ success: false, message: 'Email ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id) VALUES (?,?,?,?,?,?)',
      [nombre, apellido, email, hashed, telefono || null, rol_id || 3]
    );
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Creó usuario: ${email}`, modulo: 'Usuarios', ip });
    res.status(201).json({ success: true, message: 'Usuario creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
};

const update = async (req, res) => {
  const { nombre, apellido, telefono, rol_id, activo, password } = req.body;
  const { ip } = getClientInfo(req);

  try {
    const [existing] = await pool.query('SELECT * FROM usuarios WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    let hashed = existing[0].password;
    if (password) hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE usuarios SET nombre=?, apellido=?, telefono=?, rol_id=?, activo=?, password=? WHERE id=?',
      [nombre || existing[0].nombre, apellido || existing[0].apellido, telefono ?? existing[0].telefono,
       rol_id || existing[0].rol_id, activo !== undefined ? activo : existing[0].activo, hashed, req.params.id]
    );
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Actualizó usuario ID: ${req.params.id}`, modulo: 'Usuarios', ip });
    res.json({ success: true, message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const remove = async (req, res) => {
  const { ip } = getClientInfo(req);
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo' });
  }
  try {
    const [existing] = await pool.query('SELECT email FROM usuarios WHERE id = ? AND eliminado = 0', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    await pool.query('UPDATE usuarios SET eliminado = 1, eliminado_at = NOW(), activo = 0 WHERE id = ?', [req.params.id]);
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: `Eliminó usuario: ${existing[0].email}`, modulo: 'Usuarios', ip });
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
